import * as React from 'react';
import { createRoot } from 'react-dom/client';

const App = () => (<div>pasdasd</div>);
const rootContainer = document.getElementById('root');

if (rootContainer) {
    const root = createRoot(rootContainer);
    root.render(<App />);
}
