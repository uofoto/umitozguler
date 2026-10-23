import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// Eski sürümlerde kayıtlı kalan Service Worker, eski Neural arayüzünü
// cache'den geri getirebiliyordu. Bu sürüm offline cache kullanmaz;
// eski worker ve cache'ler açılışta bir kez temizlenir.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.getRegistrations().then((registrations) =>
      Promise.all(registrations.map((registration) => registration.unregister()))
    );
  });
}
if ('caches' in window) {
  window.addEventListener('load', () => {
    void caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
