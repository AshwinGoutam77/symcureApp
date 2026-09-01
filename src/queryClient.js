import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 30 * 1000,
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnMount: 'always',
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },

    mutations: {
      retry: false,
    },
  },
});

export default queryClient;
