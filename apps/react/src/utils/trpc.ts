   import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
   import { AppRouter } from 'server';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: 'http://localhost:8888/trpc' })],
});
