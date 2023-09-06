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

  async filterBy(collection, query) {
    try {
      const result = await this.db.collection(collection).findOne(query);
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async insertInto(collection, obj) {
    try {
      const res = await this.db.collection(collection).insertOne(obj);
      return res;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async updateOne(collection, query, update) {
    try {
      const res = await this.db.collection(collection).updateOne(query, { $set: update });
      return res;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
