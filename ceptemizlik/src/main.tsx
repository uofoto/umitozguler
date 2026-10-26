import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// Yazı tipleri pakete gömülüdür (Google'a istek yok → çevrimdışı çalışır, gizlilik vaadi bozulmaz).
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-ext-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-ext-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-ext-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/dm-sans/latin-ext-700.css';
import '@fontsource/dm-mono/latin-400.css';
import '@fontsource/dm-mono/latin-ext-400.css';
import '@fontsource/dm-mono/latin-500.css';
import '@fontsource/dm-mono/latin-ext-500.css';
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/latin-ext-600.css';
import '@fontsource/playfair-display/latin-600-italic.css';
import '@fontsource/playfair-display/latin-ext-600-italic.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-ext-700.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/playfair-display/latin-ext-700-italic.css';
import './styles.css';

if ('serviceWorker' in navigator) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  // Yeni sürüm devreye girince bir kez yenile (ilk kurulumda yenileme yok).
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    window.location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
