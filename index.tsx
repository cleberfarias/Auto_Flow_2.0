
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  console.error("Erro fatal: Elemento 'root' não encontrado no DOM.");
} else {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Erro ao renderizar o aplicativo:", error);
    container.innerHTML = `<div style="padding: 20px; color: red;">Erro ao carregar o AutoFlow. Verifique o console do navegador.</div>`;
  }
}
