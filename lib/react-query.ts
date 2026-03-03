import { QueryClient } from "@tanstack/react-query";

const isServer = typeof window === "undefined";

type AxiosLikeError = {
  response?: {
    status?: number;
  };
};

const getStatusCode = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const maybeAxiosError = error as AxiosLikeError;
  return maybeAxiosError.response?.status;
};

const shouldRetryRequest = (
  failureCount: number,
  error: unknown,
) => {
  const statusCode = getStatusCode(error);

  if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
    return false;
  }

  return failureCount < 2;
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: shouldRetryRequest,
      },
      mutations: {
        retry: 0,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (isServer) {
    return createQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
};
