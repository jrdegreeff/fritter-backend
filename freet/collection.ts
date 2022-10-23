import type {HydratedDocument, Types} from 'mongoose';
import type {PopulatedFreet} from './model';
import FreetModel from './model';
import UserCollection from '../user/collection';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FreetCollection {
  /**
   * Add a freet to the collection
   *
   * @param {string} authorId - The id of the author of the freet
   * @param {string} parentId - The id of the parent freet
   * @param {string} content - The id of the content of the freet
   * @return {Promise<HydratedDocument<PopulatedFreet>>} - The newly created freet
   */
  static async addOne(authorId: Types.ObjectId | string, parent: Types.ObjectId | string, content: string): Promise<HydratedDocument<PopulatedFreet>> {
    const date = new Date();
    const freet = new FreetModel({
      authorId,
      dateCreated: date,
      ...(parent && {parent}),
      content,
      // dateModified: date
    });
    await freet.save(); // Saves freet to MongoDB
    return freet.populate('authorId');
  }

  /**
   * Find a freet by freetId
   *
   * @param {string} freetId - The id of the freet to find
   * @return {Promise<HydratedDocument<PopulatedFreet>> | Promise<null> } - The freet with the given freetId, if any
   */
  static async findOne(freetId: Types.ObjectId | string): Promise<HydratedDocument<PopulatedFreet>> {
    return FreetModel.findOne({_id: freetId}).populate('authorId');
  }

  /**
   * Get all the freets in the database
   *
   * @return {Promise<HydratedDocument<PopulatedFreet>[]>} - An array of all of the freets
   */
  static async findAll(): Promise<Array<HydratedDocument<PopulatedFreet>>> {
    // Retrieves freets and sorts them from most to least recent
    // return FreetModel.find({}).sort({dateModified: -1}).populate('authorId');
    return FreetModel.find({}).sort({dateCreated: -1}).populate('authorId');
  }

  /**
   * Get all the freets in by given author
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<PopulatedFreet>[]>} - An array of all of the freets
   */
  static async findAllByUsername(username: string): Promise<Array<HydratedDocument<PopulatedFreet>>> {
    const author = await UserCollection.findOneByUsername(username);
    return FreetModel.find({authorId: author._id}).sort({dateCreated: -1}).populate('authorId');
  }

  /**
   * Update a freet with the new content
   *
   * @param {string} freetId - The id of the freet to be updated
   * @param {string} content - The new content of the freet
   * @return {Promise<HydratedDocument<PopulatedFreet>>} - The newly updated freet
   */
/*
  static async updateOne(freetId: Types.ObjectId | string, content: string): Promise<HydratedDocument<PopulatedFreet>> {
    const freet = await FreetModel.findOne({_id: freetId});
    freet.content = content;
    freet.dateModified = new Date();
    await freet.save();
    return freet.populate('authorId');
  }
*/

  /**
   * Delete a freet with given freetId.
   *
   * @param {string} freetId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(freetId: Types.ObjectId | string): Promise<void> {
    await FreetModel.deleteOne({_id: freetId});
    await FreetModel.updateMany({parent: freetId}, {$unset: {parent: ""}});
  }

  /**
   * Delete all the freets by the given author
   *
   * @param {string} authorId - The id of author of freets
   */
  static async deleteMany(authorId: Types.ObjectId | string): Promise<void> {
    await FreetModel.deleteMany({authorId});
  }
}

export default FreetCollection;
