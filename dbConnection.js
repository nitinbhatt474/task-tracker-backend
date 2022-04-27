import { MongoClient, ObjectId } from "mongodb";

class DBConnection {
  constructor() {
    this.client = new MongoClient(process.env.DB_URL);
    this.dbName = process.env.DB_NAME;
  }

  connect = async () => {
    try {
      await this.client.connect();
    } catch (e) {
      throw e;
    }
  };

  close = async () => {
    await this.client.close();
  };

  /**
   * inserts the document in the collection, set _id field if you want to maintain
   * uniqueness in data
   * @param {object} collection name of collection in which you want to insert document
   * @param {object} document document that you want to insert in JSON format
   */
  insert = async (collection, document) => {
    try {
      const result = await this.client
        .db(this.dbName)
        .collection(collection)
        .insertOne(document);
      return result;
    } catch (e) {
      throw e;
    }
  };

  /**
   * returns the documents present in the database that matches the query.
   * @param {object} collection Name of the collection whose data you want to get
   * @param {object} document query document, should be empty if you want to fetch all records.
   * @returns the array representation of documents.
   */
  find = async (collection, document) => {
    const cursor = this.client
      .db(this.dbName)
      .collection(collection)
      .find(document);

    const result = await cursor.toArray();
    return result;
  };

  /**
   * updates a document which matches the filter query.
   * @param {object} collection name of collection whose document is to be updated
   * @param {object} document the updated document with the taskName
   * @returns the result whether the document was updated or not
   */
  updateOne = async (collection, document) => {
    if (document._id === undefined) throw Error("The id of task is missing");
    const id = document._id;
    delete document._id;
    const result = await this.client
      .db(this.dbName)
      .collection(collection)
      .updateOne({ _id: ObjectId(id) }, { $set: document });
    return result;
  };

  /**
   * updates multiple documents which matches the filter query.
   * @param {object} collection name of collection whose document is to be updated
   * @param {object} filter condition of the documents to be updated
   * @param {object} document the updated document with the taskName
   * @returns the result whether the document was updated or not
   */
  updateMany = async (collection, filter, document) => {
    const result = await this.client
      .db(this.dbName)
      .collection(collection)
      .updateMany(filter, { $set: document });
    return result;
  };

  /**
   * deletes a document based on its _id
   * @param {Object} collection collection of the document you want to delete
   * @param {string} _id contains the _id of the task to be deleted
   */
  deleteOne = async (collection, _id) => {
    if (_id === undefined) throw Error("id of task is missing");
    const result = await this.client
      .db(this.dbName)
      .collection(collection)
      .deleteOne({ _id: ObjectId(_id) });

    return result;
  };

  findOne = async (collection, _id) => {
    if (_id === undefined) throw Error("id of task is missing");
    const result = await this.find(collection, { _id: ObjectId(_id) });
    return result;
  };
}

export default DBConnection;
