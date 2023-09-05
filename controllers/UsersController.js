import dbClient from '../utils/db';
// eslint-disable-next-line import/named
import { sha1Hash, getUserByToken } from '../utils/auth';

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
    const { user } = await getUserByToken(req);
    if (user === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    res.statusCode = 200;
    return res.send({ id: user._id, email: user.email });
  }
}

export default UsersController;
