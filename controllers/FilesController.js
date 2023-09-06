// eslint-disable-next-line import/named
import { getUserByToken } from '../utils/auth';

class FilesController {
  static async postUpload(req, res) {
    const { user } = await getUserByToken(req);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;
    console.log(`name: ${name}, type: ${type}, parentId: ${parentId}, isPublic: ${isPublic}, data: ${data}`);

    return res.status(200).send({ status: 'OK' });
  }
}

export default FilesController;
