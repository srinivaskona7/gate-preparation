import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import { router } from './app/router';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('index.html has no #root element');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// Offline support ships with the production build only; a worker in dev would serve stale modules.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const sw = navigator.serviceWorker;
    // The first time a worker takes control, hand it what this page already fetched.
    if (!sw.controller) {
      sw.addEventListener(
        'controllerchange',
        () => {
          const urls = performance.getEntriesByType('resource').map((e) => e.name);
          sw.controller?.postMessage({ type: 'offline-adopt', urls });
        },
        { once: true },
      );
    }
    sw.register('./sw.js').catch(() => {
      // The site works fully online without it; nothing to tell the learner.
    });
  });
}
