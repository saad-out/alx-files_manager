import dbClient from '../utils/db';
// eslint-disable-next-line import/named
import { getUserByToken } from '../utils/auth';

const acceptedTypes = ['folder', 'file', 'image'];

class FilesController {
  static async postUpload(req, res) {
    const { user } = await getUserByToken(req);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;
    console.log(`name: ${name}, type: ${type}, parentId: ${parentId}, isPublic: ${isPublic}, data: ${data}`);

    // Validate parameters
    if (!name) return res.status(400).send({ error: 'Missing name' });
    if (!type || !acceptedTypes.includes(type)) return res.status(400).send({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).send({ error: 'Missing data' });
    if (parentId !== 0) {
      const parent = await dbClient.filterBy('files', { _id: parentId });
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

    return res.status(200).send({ status: 'OK' });
  }
}

export default FilesController;
