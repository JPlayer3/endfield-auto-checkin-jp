Object.defineProperty(document, 'hidden', { value: false, writable: false });
Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false });
Object.defineProperty(document, 'hasFocus', { value: () => true, writable: false });
window.dispatchEvent(new Event('focus'));
window.dispatchEvent(new Event('visibilitychange'));
