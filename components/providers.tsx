'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { AUTH_TOKEN_KEY } from '@/lib/api/axios';
import { hydrateAuth } from '@/lib/slices/authSlice';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    store.dispatch(hydrateAuth({ token }));
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
}