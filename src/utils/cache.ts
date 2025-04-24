import redisClient from "./redis";

type CacheOptions = {
  key: string;
  ttl: number;
};

export function withRedisCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
) {
  return (async (
    ...args: [...parameters: Parameters<T>, options: CacheOptions]
  ) => {
    const allArgs = args as [...Parameters<T>, CacheOptions];
    const cacheOptions = allArgs[allArgs.length - 1];
    const actualArgs = allArgs.slice(0, -1) as Parameters<T>;

    const { key, ttl } = cacheOptions;
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await fn(...actualArgs);
    if (ttl === 0) {
      console.log("Updating cache with no ttl")
      await redisClient.set(key, JSON.stringify(result));
    } else {
      await redisClient.set(key, JSON.stringify(result), {
        EX: ttl,
      });
    }
    return result;
  }) as (...args: [...Parameters<T>, CacheOptions]) => ReturnType<T>;
}
