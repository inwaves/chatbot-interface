import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
import './index.css';
import Card from './components/Card';

const rootContainer = document.getElementById('root');

if (rootContainer) {
    const root = createRoot(rootContainer);
    root.render(<Card title="What are the" text="trending metrics today?" />);
}
