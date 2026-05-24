/**
 * ProgressManager - Maritime English Level 11
 * Manages course progress with offline-first sync, prerequisite validation, and reporter updates
 * Consistent with maritime course architecture
 */

export class ProgressManager {
  constructor({ level = 11, prerequisiteLevel = 10, apiClient = null, userId = null } = {}) {
    this.level = level;
    this.prerequisiteLevel = prerequisiteLevel;
    this.apiClient = apiClient;
    this.userId = userId || this._generateUserId();
    this.storageKey = `maritime_progress_l${this.level}_${this.userId}`;
    this.queueKey = `maritime_queue_l${this.level}_${this.userId}`;
    this.syncStatus = 'offline';
    this.data = { modules: {}, completed: false, lastSync: null };
    this._init();
  }

  _generateUserId() {
    return 'u_' + Math.random().toString(36).slice(2, 10);
  }

  _init() {
    this._loadFromStorage();
    this._setupOnlineListener();
    this._startSyncLoop();
    this._dispatchEvent('progress:loaded', { data: this.data });
  }

  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.data = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('[ProgressManager] Failed to load from storage:', err);
      this.data = { modules: {}, completed: false, lastSync: null };
    }
  }

  _saveToStorage() {
    try {
      this.data.lastSync = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      return true;
    } catch (err) {
      console.warn('[ProgressManager] Failed to save to storage:', err);
      return false;
    }
  }

  _setupOnlineListener() {
    window.addEventListener('online', () => {
      this.syncStatus = 'online';
      this._dispatchEvent('sync:online');
      this._flushQueue();
    });
    window.addEventListener('offline', () => {
      this.syncStatus = 'offline';
      this._dispatchEvent('sync:offline');
    });
  }

  _startSyncLoop() {
    // Attempt sync every 30 seconds when online
    setInterval(() => {
      if (navigator.onLine && this.apiClient) {
        this._flushQueue();
      }
    }, 30000);
  }

  async _flushQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem(this.queueKey) || '[]');
      if (!queue.length || !this.apiClient) return;
      
      const successful = [];
      for (const item of queue) {
        try {
          // THIS IS THE CRITICAL LINE: It must use .post() to match your api-client.js
          await this.apiClient.post('/api/progress', {
            userId: this.userId,
            level: this.level,
            moduleId: item.moduleId,
            progress: item.progress,
            completed: item.completed,
            score: item.score,
            timestamp: item.timestamp
          });
          successful.push(item);
        } catch (err) {
          console.warn('[ProgressManager] Sync failed for item:', item.moduleId, err);
        }
      }
      
      // Remove successfully synced items from queue
      const remaining = queue.filter(item => !successful.includes(item));
      localStorage.setItem(this.queueKey, JSON.stringify(remaining));
      
      if (successful.length > 0) {
        this._dispatchEvent('sync:complete', { synced: successful.length });
      }
    } catch (err) {
      console.warn('[ProgressManager] Queue flush error:', err);
    }
  }

  _enqueueSync(moduleId, payload) {
    try {
      const queue = JSON.parse(localStorage.getItem(this.queueKey) || '[]');
      queue.push({ ...payload, moduleId, timestamp: Date.now() });
      // Limit queue size to prevent storage bloat
      const trimmed = queue.slice(-50);
      localStorage.setItem(this.queueKey, JSON.stringify(trimmed));
      return true;
    } catch (err) {
      console.warn('[ProgressManager] Failed to enqueue sync:', err);
      return false;
    }
  }

  _dispatchEvent(type, detail = {}) {
    document.dispatchEvent(new CustomEvent(type, { 
      detail: { ...detail, level: this.level, userId: this.userId } 
    }));
  }

  /**
   * Update module progress - the core method used by unit scripts
   */
  updateModule(moduleId, updates) {
    if (!this.data.modules[moduleId]) {
      this.data.modules[moduleId] = { started: false, progress: 0, completed: false };
    }
    
    const module = this.data.modules[moduleId];
    
    // Apply updates
    if (updates.started !== undefined) module.started = updates.started;
    if (updates.progress !== undefined) module.progress = Math.min(100, Math.max(0, updates.progress));
    if (updates.completed !== undefined) module.completed = updates.completed;
    if (updates.score !== undefined) module.score = updates.score;
    if (updates.startedAt !== undefined) module.startedAt = updates.startedAt;
    if (updates.completedAt !== undefined) module.completedAt = updates.completedAt;
    
    // Save locally immediately
    this._saveToStorage();
    
    // Dispatch events for UI updates
    if (updates.started && !module.started) {
      this._dispatchEvent('module:started', { moduleId });
    }
    if (updates.completed && !module.completed) {
      this._dispatchEvent('module:completed', { moduleId, score: module.score });
    }
    this._dispatchEvent('progress:updated', { moduleId, module: this.data.modules[moduleId] });
    
    // Queue for async sync if API available
    if (this.apiClient) {
      this._enqueueSync(moduleId, {
        progress: module.progress,
        completed: module.completed,
        score: module.score
      });
      // Attempt immediate sync if online
      if (navigator.onLine) {
        this._flushQueue();
      }
    }
    
    return this.data.modules[moduleId];
  }

  /**
   * Get progress for a specific module
   */
  getModuleProgress(moduleId) {
    return this.data.modules[moduleId] || { started: false, progress: 0, completed: false };
  }

  /**
   * Calculate overall level progress (percentage of modules completed)
   */
  getLevelProgress() {
    const modules = Object.values(this.data.modules);
    if (modules.length === 0) return 0;
    const completed = modules.filter(m => m.completed).length;
    return Math.round((completed / 6) * 100); // 6 modules per level
  }

  /**
   * Check if user can advance to next level (prerequisite validation)
   */
  async canAdvance() {
    // For Level 11, check if Level 10 is >= 80% complete
    if (this.prerequisiteLevel) {
      try {
        const prereqKey = `maritime_progress_l${this.prerequisiteLevel}_${this.userId}`;
        const prereqData = JSON.parse(localStorage.getItem(prereqKey) || '{}');
        const prereqModules = Object.values(prereqData.modules || {});
        if (prereqModules.length === 0) return false;
        const completed = prereqModules.filter(m => m.completed).length;
        return (completed / 6) >= 0.8; // 80% threshold
      } catch {
        return false;
      }
    }
    return true;
  }

  /**
   * Export progress data for backup/debugging
   */
  exportProgress() {
    return {
      userId: this.userId,
      level: this.level,
      data: this.data,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import progress data (use with caution)
   */
  importProgress(data) {
    if (data?.level !== this.level) {
      throw new Error('Cannot import progress from different level');
    }
    this.data = data.data || this.data;
    this._saveToStorage();
    this._dispatchEvent('progress:imported');
    return true;
  }

  /**
   * Reset all progress for this level
   */
  resetProgress() {
    this.data = { modules: {}, completed: false, lastSync: null };
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.queueKey);
    this._dispatchEvent('progress:reset');
    return true;
  }

  /**
   * Get units studied count (for progress reporter)
   */
  getUnitsStudied() {
    return Object.values(this.data.modules).filter(m => m?.started || m?.progress > 0).length;
  }

  /**
   * Get completed units count
   */
  getCompletedUnits() {
    return Object.values(this.data.modules).filter(m => m?.completed).length;
  }
}

// Export singleton instance for convenience
let _instance = null;
export function getProgressManager(options) {
  if (!_instance) {
    _instance = new ProgressManager(options);
  }
  return _instance;
}