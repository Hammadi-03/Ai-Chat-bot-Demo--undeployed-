import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🔍 main.jsx is loading...');

try {
  const rootElement = document.getElementById('root');
  console.log('🔍 Root element:', rootElement);

  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('✅ React app rendered successfully');
  } else {
    console.error('❌ Root element not found!');
  }
} catch (error) {
  console.error('❌ Error rendering app:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Murjan Failed to Load</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${error.stack}</pre>
    </div>
  `;
}
