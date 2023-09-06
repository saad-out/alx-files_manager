import dbClient from '../utils/db'
import redisClient from '../utils/redis'

function findUser(req) {
  const token = req.headers['x-token'];
  const user_id = redisClient.get(`auth_${token}`);
  return dbClient.filterBy('users', { _id: user_id });
}

export default class FilesController {
  static getShow(req, res) {
    const user = findUser(req);
    const id = req.params.id
    if (user === null) {
      res.statusCode = 401;
      return res.send({error: 'Unauthorized'});
    }
    const file = dbClient.filterBy('files', {_id: id, userId: user._id});
    if (file === null) {
      res.statusCode = 404;
      return res.send({error: 'Not found'});
    }
    return file;
  }

  static getIndex(req, res) {
    const user = findUser(req);
    if (user === null) {
        res.statusCode = 401;
        return res.send({ error: 'Unauthorized'});
    }
    const parentId = req.query.parentId;
    const page = req.query.page;
    const limit = 20;
    const skip = page * limit
    const docs = dbClient.db.collection('files').find({ parentId }).aggregate(
      [{ $skip: skip }, { $limit: limit }]
    );
    return docs.toArray();
  }

  static putPublish(req, res) {
    const user = findUser(req);
    const id = req.params.id;
    if (user === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized'});
    }
    const file = dbClient.filterBy('files',  { userId: user._id, _id: id });
    if (file === null) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
    }
    file.isPublic = true;
    res.statusCode = 200;
    return res.send(file);
  }

  static putUnpublish(req, res) {
    const user = findUser(req);
    const id = req.params.id;
    if (user === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized'});
    }
    const file = dbClient.filterBy('files',  { userId: user._id, _id: id });
    if (file === null) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
    }
    file.isPublic = false;
    res.statusCode = 200;
    return res.send(file);
  }
}
