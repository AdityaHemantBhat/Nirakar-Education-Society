import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const adminQueryClient = new QueryClient();

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={adminQueryClient}>{children}</QueryClientProvider>
);
