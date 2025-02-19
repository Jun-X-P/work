import { StrictMode } from 'react';
import './index.css';
import { Provider } from 'react-redux';
import {store} from '@/store';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import ReactDOM from 'react-dom/client'

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);