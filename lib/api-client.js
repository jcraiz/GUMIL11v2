/**
 * GET UNDERWAY - API Client (Level 12)
 * Lightweight abstraction for backend communication with retry logic
 */

export class APIClient {
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: { ...this.headers, ...options.headers }
    };

    let lastError;
    
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }
        return { success: true };
        
      } catch (error) {
        lastError = error;
        
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        
        if (attempt < this.retries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * attempt)
          );
          continue;
        }
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }

  async saveProgress(data) {
    return this.request('/api/progress', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getProgressSummary(userId) {
    return this.request(`/api/progress/summary?userId=${encodeURIComponent(userId)}`);
  }

  async healthCheck() {
    try {
      await this.request('/api/health', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  }
}