import { ObjectID } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { getAuthorizationHeader, extractCredentials, sha1Hash } from '../utils/auth';

class AuthController {
  static async getConnect(req, res) {
    const decodedAuthHeader = getAuthorizationHeader(req);
    if (!decodedAuthHeader) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const [email, password] = extractCredentials(decodedAuthHeader);
    if (!email || !password) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const user = await dbClient.filterBy('users', { email });
    if (user === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const passwd = sha1Hash(password);
    if (user.password !== passwd) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 86400);
    res.statusCode = 200;
    return res.send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    const id = new ObjectID(strId);
    if (id === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const user = await dbClient.filterBy('users', { _id: id });
    if (user === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    res.statusCode = 204;
    return res.send();
  }
}

export default AuthController;
