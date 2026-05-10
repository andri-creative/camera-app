import { registerSW } from 'virtual:pwa-register';

export function register() {
  if ('serviceWorker' in navigator) {
    registerSW({
      onNeedRefresh() {
        if (confirm('Aplikasi telah diperbarui. Muat ulang sekarang?')) {
          window.location.reload();
        }
      },
      onOfflineReady() {
        console.log('Aplikasi siap digunakan secara offline.');
      },
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
