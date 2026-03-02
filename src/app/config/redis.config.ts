import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;

// Only create Redis client if credentials are provided
if (process.env.REDIS_HOST && process.env.REDIS_PORT) {
  redisClient = createClient({
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  redisClient.on("error", (err) => {
    console.log("Redis Client Error", err);
  });
}

export { redisClient };

export const connectRedis = async (): Promise<void> => {
  if (!redisClient) {
    console.log("⚠️  Redis disabled - using MongoDB for OTP storage");
    return;
  }
  
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis Connected");
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log("Redis Disconnected");
  }
};

// For compatibility with existing services importing getRedis()
export const getRedis = () => redisClient;
