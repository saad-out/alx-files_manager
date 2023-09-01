import redis from 'redis';
import util from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.connected = true;
    this.client
      .on('error', (err) => {
        console.log(err);
        this.connected = false;
      });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    const getAsync = util.promisify(this.client.get).bind(this.client);
    return getAsync(key);
  }

  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  async del(key) {
    const delAsync = util.promisify(this.client.del).bind(this.client);
    return delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
