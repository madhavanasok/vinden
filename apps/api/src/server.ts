import { app } from './app.js';

const port = Number(process.env.API_PORT ?? 4100);
await app.listen({ port, host: '127.0.0.1' });
console.log(`Vinden demo API on http://127.0.0.1:${port}`);
