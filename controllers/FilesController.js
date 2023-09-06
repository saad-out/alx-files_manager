// eslint-disable-next-line import/named
import { getUserByToken } from '../utils/auth';

class FilesController {
  static async postUpload(req, res) {
    const { user } = await getUserByToken(req);
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    return res.status(200).send({ status: 'OK' });
  }
}

export default FilesController;
