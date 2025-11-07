// src/main.tsx o src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import emailjs from '@emailjs/browser';

// Inicializar EmailJS
emailjs.init('6ZzdOia3VpMumzjDq'); // Reemplaza con tu Public Key

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);