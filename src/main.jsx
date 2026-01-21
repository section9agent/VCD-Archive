import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import './index.css';

import Layout from '../Layout.jsx';
import Home from '../home';
import ReleaseDetail from '../ReleaseDetail';
import EditRelease from '../EditRelease';
import MyCollection from '../MyCollection';
import Admin from '../Admin';
import ImageManager from '../ImageManager';
import PublisherLogos from '../PublisherLogos';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/ReleaseDetail" element={<ReleaseDetail />} />
            <Route path="/EditRelease" element={<EditRelease />} />
            <Route path="/MyCollection" element={<MyCollection />} />
            <Route path="/Admin" element={<Admin />} />
            <Route path="/ImageManager" element={<ImageManager />} />
            <Route path="/PublisherLogos" element={<PublisherLogos />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
