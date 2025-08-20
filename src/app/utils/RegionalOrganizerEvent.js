// TIEMPO-253: Event emitter for regional organizer modal control
class RegionalOrganizerEventEmitter {
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

  openModal() {
    console.log('[RegionalOrganizerEvent] Opening regional organizer modal');
    this.emit({ open: true });
  }

  closeModal() {
    console.log('[RegionalOrganizerEvent] Closing regional organizer modal');
    this.emit({ open: false });
  }
}

// Create singleton instance
export const regionalOrganizerEvent = new RegionalOrganizerEventEmitter();