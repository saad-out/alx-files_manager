import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'mongodb';
import dbClient from '../utils/db';
// eslint-disable-next-line import/named
import { getUserByToken } from '../utils/auth';

const acceptedTypes = ['folder', 'file', 'image'];
const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { user } = await getUserByToken(req);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validate parameters
    if (!name) return res.status(400).send({ error: 'Missing name' });
    if (!type || !acceptedTypes.includes(type)) return res.status(400).send({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).send({ error: 'Missing data' });
    if (parentId !== 0) {
      const parentIdObj = new ObjectID(parentId);
      const parent = await dbClient.filterBy('files', { _id: parentIdObj });
      if (!parent) return res.status(400).send({ error: 'Parent not found' });
      if (parent.type !== 'folder') return res.status(400).send({ error: 'Parent is not a folder' });
    }

    // Create file
    const file = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    };
    if (type === 'folder') {
      const newFolder = await dbClient.insertInto('files', file);
      file.id = newFolder.insertedId;
      delete file._id;
      return res.status(201).send(file);
    }
    file.localPath = `${folderPath}/${uuidv4()}`;
    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(file.localPath, Buffer.from(data, 'base64'));
    const result = await dbClient.insertInto('files', file);
    const newFile = { ...result.ops[0], id: result.insertedId };
    delete newFile._id;
    delete newFile.localPath;
    return res.status(201).send(newFile);
  }

  static async getShow(req, res) {
    const { user } = await getUserByToken(req);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    const fileId = new ObjectID(req.params.id);
    const file = await dbClient.filterBy('files', { _id: fileId, userId: user._id });
    if (!file) return res.status(404).send({ error: 'Not found' });
    file.id = file._id;
    delete file._id;
    return res.status(200).send(file);
  }

  static async getIndex(req, res) {
    const user = await getUserByToken(req);
    console.log(user);
    if (user === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const parentId = req.query.parentId || 0;
    const page = req.query.page || 0;
    const limit = 20;
    const skip = page * limit;
    const docs = await dbClient.db.collection('files').aggregate([
      { $match: { parentId } },
      { $skip: skip },
      { $limit: limit },
    ]);
    return res.status(200).send(await docs.toArray());
  }

  static async putPublish(req, res) {
    const obj = await getUserByToken(req);
    const id = new ObjectID(req.params.id);
    if (obj === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const file = await dbClient.filterBy('files', { userId: obj.user._id, _id: id });
    if (file === null) {
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }
    file.isPublic = true;
    res.statusCode = 200;
    return res.send(file);
  }

  static async putUnpublish(req, res) {
    const obj = await getUserByToken(req);
    const id = new ObjectID(req.params.id);
    if (obj === null) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const file = await dbClient.filterBy('files', { userId: obj.user._id, _id: id });
    if (file === null) {
      res.statusCode = 404;
      return res.send({ error: 'Not found' });
    }
    file.isPublic = false;
    res.statusCode = 200;
    return res.send(file);
  }
}

export default FilesController;
