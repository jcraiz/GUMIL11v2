if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Connected:', reg.scope))
      .catch(err => console.warn('[SW] Connection failed:', err));
  });
}
