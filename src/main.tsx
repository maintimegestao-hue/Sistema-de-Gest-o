
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ClientProvider } from './contexts/ClientContext.tsx';
import { queryClient } from './lib/queryClient';
import App from './App.tsx';
import './index.css';

// Simple cache-busting to ensure production always loads the latest index.html
(function () {
  try {
    const isRoot = window.location.pathname === '/' || window.location.pathname === '/index.html';
    const params = new URLSearchParams(window.location.search);
    const hasBuster = params.has('v');

    if (isRoot && !hasBuster) {
      // Add a one-time cache buster and reload
      sessionStorage.setItem('mx_cache_bust', '1');
      const url = new URL(window.location.href);
      url.searchParams.set('v', String(Date.now()));
      window.location.replace(url.toString());
    } else if (hasBuster && sessionStorage.getItem('mx_cache_bust') === '1') {
      // Clean URL after load (no reload)
      const url = new URL(window.location.href);
      url.searchParams.delete('v');
      const qs = url.searchParams.toString();
      window.history.replaceState({}, '', url.pathname + (qs ? `?${qs}` : '') + url.hash);
      sessionStorage.removeItem('mx_cache_bust');
    }
  } catch {
    // no-op
  }
})();

// Tratamento de erros globais para evitar crashes
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
  // Prevenir que o erro quebre a aplicação
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada não tratada:', event.reason);
  // Prevenir que a rejeição quebre a aplicação
  event.preventDefault();
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClientProvider>
        <App />
      </ClientProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
