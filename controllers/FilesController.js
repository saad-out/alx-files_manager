import { v4 as uuidv4 } from 'uuid';
import { ObjectID } from 'mongodb';
import fs from 'fs/promises';
import dbClient from '../utils/db';
import createParentFolders from '../utils/file';
// eslint-disable-next-line import/named
import { getUserByToken } from '../utils/auth';

const TYPES = ['folder', 'file', 'image'];
const folderPath = process.argv.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { user } = await getUserByToken(req);
    if (!user) {
      res.statusCode = 401;
      return res.send({ error: 'Unauthorized' });
    }
    const {
      name,
      type,
      parentId,
      isPublic,
      data,
    } = req.body;
    if (!name) {
      res.statusCode = 400;
      return res.send({ error: 'Missing name' });
    }
    if (!type || TYPES.indexOf(type) === -1) {
      res.statusCode = 400;
      return res.send({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      res.statusCode = 400;
      return res.send({ error: 'Missing data' });
    }
    if (parentId) {
      const parentFile = await dbClient.filterBy('files', { _id: new ObjectID(parentId) });
      if (!parentFile) {
        res.statusCode = 400;
        return res.send({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        res.statusCode = 400;
        return res.send({ error: 'Parent is not a folder' });
      }
    }
    let filename = '';
    if (type !== 'folder') {
      filename = `${folderPath}`;
      if (parentId) {
        filename += `/${parentId}`;
      }
      filename += `/${uuidv4()}`;
    } else {
      filename = null;
    }
    const objectData = {
      userId: user._id,
      name,
      type,
    };
    objectData.parentId = parentId ? new ObjectID(parentId) : 0;
    objectData.isPublic = isPublic || false;
    if (type !== 'folder') {
      objectData.localPath = filename;
    }
    if (type !== 'folder') {
      createParentFolders(filename);
      await fs.writeFile(filename, Buffer.from(data, 'base64', { recursive: true }));
    }
    const file = await dbClient.insertInto('files', objectData);
    if (file === null) {
      res.statusCode = 400;
      return res.send({ error: 'Error creating file' });
    }
    objectData.id = file.ops[0]._id;
    delete objectData._id;
    delete objectData.localPath;
    res.statusCode = 201;
    return res.send(objectData);
  }
}

export default FilesController;
