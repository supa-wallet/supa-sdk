import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Note: Buffer polyfill is now handled automatically by @supanovaapp/sdk

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

