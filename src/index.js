import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Root from './App'; // This should point to your App.js file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);