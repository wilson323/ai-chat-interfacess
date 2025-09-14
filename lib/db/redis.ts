import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries: number) => Math.min(retries * 50, 2000),
  },
});

redis.on('error', (err: Error) => {
  console.error('Redis Client Error', err);
});

(async () => {
  if (!redis.isOpen) {
    await redis.connect();
  }
})();

export default redis;
