import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import './styles/global.css';
import './styles/scrollytelling/system-transformation.css';
import './styles/scrollytelling/leadership.css';

const freezeMobileViewportHeight = () => {
  const viewportHeight = Math.round(window.visualViewport?.height ?? window.innerHeight);
  document.documentElement.style.setProperty('--app-viewport-height', `${viewportHeight}px`);
};

freezeMobileViewportHeight();
window.addEventListener('orientationchange', () => window.setTimeout(freezeMobileViewportHeight, 250), { passive: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter basename="/ramiz-cinematic-career"><App /></BrowserRouter></React.StrictMode>
);
