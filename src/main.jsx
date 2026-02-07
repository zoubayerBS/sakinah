import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/design-system.css';
import './styles/enhancements.css';

// Initializing the Sacred Application
ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// PWA Registration logic is handled by vite-plugin-pwa in the config
