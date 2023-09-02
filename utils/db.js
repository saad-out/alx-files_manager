import { MongoClient } from 'mongodb';

const host = process.argv.DB_HOST || 'localhost';
const port = process.argv.DB_PORT || '27017';
const dbName = process.argv.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    this.client = new MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });
    this._connected = false;
    this.client.connect()
      .then(() => {
        this._connected = true;
        this.db = this.client.db(dbName);
      });
  }

  isAlive() {
    return this._connected;
  }

  async nbUsers() {
    try {
      const nbDocs = await this.db.collection('users').estimatedDocumentCount();
      return nbDocs;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async nbFiles() {
    try {
      const nbDocs = await this.db.collection('files').estimatedDocumentCount();
      return nbDocs;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;