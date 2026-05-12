/**
 * GET UNDERWAY - Progress Manager (Level 11)
 * Handles unit progress tracking with localStorage + API sync fallback
 * Features: debounced saves, offline support, conflict resolution
 * Consistent with Level 12 architecture
 */

class ProgressManager {
  constructor(config = {}) {
    this.apiEndpoint = config.apiEndpoint || '/api/progress';
    this.userId = config.userId || this._generateUserId();
    this.level = config.level || 11;
    this.prerequisiteLevel = config.prerequisiteLevel || 10;
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.debounceTimers = new Map();
    
    // Bind event listeners
    window.addEventListener('online', () => this._handleOnline());
    window.addEventListener('offline', () => this._handleOffline());
  }

  /**
   * Generate or retrieve persistent user ID
   * @returns {string} UUID-like identifier
   */
  _generateUserId() {
    const stored = localStorage.getItem('gu_user_id');
    if (stored) return stored;
    
    const id = 'usr_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    localStorage.setItem('gu_user_id', id);
    return id;
  }

  /**
   * Calculate progress percentage
   * @param {number} completed - Number of completed items
   * @param {number} total - Total items in unit
   * @returns {number} Percentage (0-100)
   */
  calculateProgress(completed, total) {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((completed / total) * 100));
  }

  /**
   * Check if prerequisite level is complete enough to advance
   * @returns {Promise<boolean>} Can user advance to next level
   */
  async canAdvance() {
    try {
      const prereqKey = `gu_progress_l${this.prerequisiteLevel}_${this.userId}`;
      const raw = localStorage.getItem(prereqKey);
      if (!raw) return false;
      
      const prereqData = JSON.parse(raw);
      const completionRate = prereqData?.completionRate || 0;
      return completionRate >= 80; // Require 80% completion of prerequisite
    } catch {
      return false;
    }
  }

  /**
   * Get progress for a unit from localStorage
   * @param {string} storageKey - localStorage key
   * @param {number} total - Total items in unit
   * @returns {Object} Progress data
   */
  getUnitProgress(storageKey, total) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return { completed: 0, total, percentage: 0, items: [] };
      }
      const items = JSON.parse(raw);
      const completed = Array.isArray(items) ? items.length : 0;
      return {
        completed,
        total,
        percentage: this.calculateProgress(completed, total),
        items: Array.isArray(items) ? items : []
      };
    } catch (error) {
      console.warn(`[ProgressManager] Error reading ${storageKey}:`, error);
      return { completed: 0, total, percentage: 0, items: [] };
    }
  }

  /**
   * Save progress for a unit
   * @param {string} storageKey - localStorage key
   * @param {Array} items - Array of completed item identifiers
   * @param {Object} options - Additional options
   */
  async saveUnitProgress(storageKey, items, options = {}) {
    const { sync = true, debounceMs = 300 } = options;
    
    try {
      // Save to localStorage immediately
      localStorage.setItem(storageKey, JSON.stringify(items));
      
      // Update UI progress bars if they exist
      this._updateUIProgress(storageKey, items.length);
      
      // Queue for API sync if enabled and online
      if (sync && this.isOnline) {
        this._debouncedSync(storageKey, items, debounceMs);
      } else if (sync && !this.isOnline) {
        this.syncQueue.push({ storageKey, items, timestamp: Date.now() });
        this._showToast('Progress saved locally. Will sync when online.', 'info');
      }
      
      return { success: true, local: true };
    } catch (error) {
      console.error(`[ProgressManager] Error saving ${storageKey}:`, error);
      this._showToast('Failed to save progress. Please try again.', 'error');
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset progress for a unit
   * @param {string} storageKey - localStorage key
   * @param {string} barId - Progress bar element ID
   * @param {string} labelId - Progress label element ID
   */
  resetUnitProgress(storageKey, barId, labelId) {
    if (!confirm('⚠️ Reset progress for this unit?\n\nThis action cannot be undone.')) {
      return false;
    }
    
    try {
      localStorage.removeItem(storageKey);
      
      // Update UI
      const bar = document.getElementById(barId);
      const label = document.getElementById(labelId);
      if (bar) {
        bar.style.width = '0%';
        bar.classList.remove('animating');
      }
      if (label) label.textContent = '0% complete';
      
      // Sync reset to API if online
      if (this.isOnline) {
        this._syncToAPI(storageKey, []);
      }
      
      this._showToast('Progress reset successfully', 'success');
      return true;
    } catch (error) {
      console.error(`[ProgressManager] Error resetting ${storageKey}:`, error);
      this._showToast('Failed to reset progress', 'error');
      return false;
    }
  }

  /**
   * Refresh all progress indicators on page
   * @param {Array} unitData - Array of unit configuration objects
   */
  refreshAllProgress(unitData) {
    if (!Array.isArray(unitData)) return;
    
    unitData.forEach(unit => {
      const { storageKey, total, barId, lblId } = unit;
      const progress = this.getUnitProgress(storageKey, total);
      
      const bar = document.getElementById(barId);
      const label = document.getElementById(lblId);
      
      if (bar) {
        bar.style.width = `${progress.percentage}%`;
        // Add animation class for visual feedback
        if (progress.percentage > 0) {
          bar.classList.add('animating');
          setTimeout(() => bar.classList.remove('animating'), 600);
        }
      }
      if (label) {
        label.textContent = `${progress.percentage}% complete`;
        label.setAttribute('aria-valuenow', progress.percentage);
      }
    });
  }

  /**
   * Debounced API sync to avoid excessive requests
   * @private
   */
  _debouncedSync(storageKey, items, debounceMs) {
    // Clear existing timer for this key
    if (this.debounceTimers.has(storageKey)) {
      clearTimeout(this.debounceTimers.get(storageKey));
    }
    
    const timer = setTimeout(() => {
      this._syncToAPI(storageKey, items);
      this.debounceTimers.delete(storageKey);
    }, debounceMs);
    
    this.debounceTimers.set(storageKey, timer);
  }

  /**
   * Sync progress to backend API
   * @private
   */
  async _syncToAPI(storageKey, items) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': this.userId,
          'X-Level': this.level.toString()
        },
        body: JSON.stringify({
          userId: this.userId,
          level: this.level,
          module: storageKey,
          completedItems: items,
          timestamp: new Date().toISOString()
        }),
        keepalive: true // Send even if page unloads
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`[ProgressManager] Synced ${storageKey}:`, result);
      return result;
    } catch (error) {
      console.warn(`[ProgressManager] API sync failed for ${storageKey}:`, error);
      // Queue for retry
      this.syncQueue.push({ storageKey, items, timestamp: Date.now(), retries: 0 });
      return { success: false, error: error.message };
    }
  }

  /**
   * Process queued sync requests when back online
   * @private
   */
  async _processSyncQueue() {
    if (this.syncQueue.length === 0) return;
    
    console.log(`[ProgressManager] Processing ${this.syncQueue.length} queued syncs`);
    
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const item of queue) {
      // Skip if too old (24h) or max retries exceeded
      const age = Date.now() - item.timestamp;
      if (age > 24 * 60 * 60 * 1000 || (item.retries || 0) >= 3) {
        console.warn(`[ProgressManager] Dropping stale sync: ${item.storageKey}`);
        continue;
      }
      
      try {
        await this._syncToAPI(item.storageKey, item.items);
      } catch (error) {
        // Re-queue with incremented retry count
        this.syncQueue.push({ ...item, retries: (item.retries || 0) + 1 });
      }
    }
  }

  /**
   * Handle browser coming back online
   * @private
   */
  _handleOnline() {
    this.isOnline = true;
    this._showToast('🔗 Back online - syncing progress...', 'info');
    this._processSyncQueue();
  }

  /**
   * Handle browser going offline
   * @private
   */
  _handleOffline() {
    this.isOnline = false;
    this._showToast('⚠️ Offline mode - progress saved locally', 'info');
  }

  /**
   * Update UI progress bar elements
   * @private
   */
  _updateUIProgress(storageKey, completedCount) {
    // Find matching unit config from global UNIT_DATA if available
    if (typeof UNIT_DATA !== 'undefined' && Array.isArray(UNIT_DATA)) {
      const unit = UNIT_DATA.find(u => u.storageKey === storageKey);
      if (unit) {
        const percentage = this.calculateProgress(completedCount, unit.total);
        const bar = document.getElementById(unit.barId);
        const label = document.getElementById(unit.lblId);
        
        if (bar) {
          bar.style.width = `${percentage}%`;
          bar.classList.add('animating');
          setTimeout(() => bar.classList.remove('animating'), 600);
        }
        if (label) label.textContent = `${percentage}% complete`;
      }
    }
  }

  /**
   * Show toast notification
   * @private
   */
  _showToast(message, type = 'info') {
    // Create container if needed
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Auto-remove after animation
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Export all progress data (for backup/debug)
   * @returns {Object} All progress data
   */
  exportProgress() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('military_l11_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return { userId: this.userId, level: this.level, timestamp: new Date().toISOString(), data };
  }

  /**
   * Import progress data (from backup)
   * @param {Object} importedData - Data from exportProgress()
   * @returns {boolean} Success status
   */
  importProgress(importedData) {
    if (!importedData?.data || typeof importedData.data !== 'object') {
      this._showToast('Invalid import data', 'error');
      return false;
    }
    
    try {
      Object.entries(importedData.data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      
      // Refresh UI if function available
      if (typeof refreshAllProgress === 'function' && typeof UNIT_DATA !== 'undefined') {
        refreshAllProgress(UNIT_DATA);
      }
      
      this._showToast('✅ Progress imported successfully', 'success');
      return true;
    } catch (error) {
      console.error('[ProgressManager] Import failed:', error);
      this._showToast('Failed to import progress', 'error');
      return false;
    }
  }
}

// Export for module systems or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressManager;
} else {
  window.ProgressManager = ProgressManager;
}