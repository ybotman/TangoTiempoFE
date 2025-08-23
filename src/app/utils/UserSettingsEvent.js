// Simple event emitter for user settings modal control
class UserSettingsEventEmitter {
  constructor() {
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  emit(event) {
    this.listeners.forEach(callback => callback(event));
  }

  openModal(tab = 'locationPrefs') {
    // TIEMPO-276: Security cleanup - removed modal logging
    this.emit({ open: true, tab });
  }
}

// Create singleton instance
export const userSettingsEvent = new UserSettingsEventEmitter();