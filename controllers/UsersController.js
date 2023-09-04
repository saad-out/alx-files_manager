import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { sha1Hash } from '../utils/auth';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (email === undefined) {
      res.statusCode = 400;
      return res.send({ error: 'Missing email' });
    }
    if (password === undefined) {
      res.statusCode = 400;
      return res.send({ error: 'Missing password' });
    }
    if (await dbClient.filterBy('users', { email }) !== null) {
      res.statusCode = 400;
      return res.send({ error: 'Already exist' });
    }
    const user = await dbClient.insertInto('users', { email, password: sha1Hash(password) });
    if (user !== null) {
      res.statusCode = 201;
      return res.send({ id: user.ops[0]._id, email: user.ops[0].email });
    }
    res.statusCode = 400;
    return res.send({ error: 'Error occured!' });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const strId = await redisClient.get(`auth_${token}`);
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
    res.statusCode = 200;
    return res.send({ id: user._id, email: user.email });
  }
}

export default UsersController;
