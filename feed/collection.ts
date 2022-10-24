import {HydratedDocument, Types} from 'mongoose';
import type {PopulatedFeed} from './model';
import FeedModel from './model';
import UserCollection from '../user/collection';
import FreetCollection from '../freet/collection';

class FeedCollection {

    /**
     * Create a feed.
     * 
     * @param userId the id of the user who owns the feed
     * @param name the name of the feed
     * @return the populated feed
     */
    static async addOne(userId: Types.ObjectId | string, name: string): Promise<HydratedDocument<PopulatedFeed>> {
        const feed = new FeedModel({
            owner: userId,
            name,
            sources: [],
            items: []
        });
        await feed.save();
        return await feed.populate('owner sources items');
    }

    /**
     * Find a feed.
     * 
     * @param userId the id of the user who owns the feed
     * @param name the name of the feed
     * @return the populated feed
     */
    static async findOne(userId: Types.ObjectId | string, name: string): Promise<HydratedDocument<PopulatedFeed>> {
        return await FeedModel.findOne({owner: userId, name})
                        .populate('owner')
                        .populate('sources')
                        .populate('items');
    }

    /**
     * Delete a feed.
     * 
     * @param userId the id of the user who owns the feed
     * @param name the name of the feed
     */
    static async deleteOne(userId: Types.ObjectId | string, name: string): Promise<void> {
        await FeedModel.deleteOne({owner: userId, name});
    }

    /**
     * Delete all feeds owned by a user.
     * And remove the user from all feeds.
     * 
     * @param userId the id of the user who owns the feeds
     */
    static async deleteMany(userId: Types.ObjectId | string): Promise<void> {
        await FeedModel.deleteMany({owner: userId});
        const items = await FreetCollection.findAllFreetIdsByUserId(userId);
        await FeedModel.updateMany({sources: userId}, {$pullAll: {items}});
        await FeedModel.updateMany({sources: userId}, {$pull: {sources: userId}});
    }

    /**
     * Add a source to a feed.
     * 
     * @param userId the id of the user who owns the feed
     * @param name the name of the feed
     * @param source the username of the source to add
     */
    static async addSource(userId: Types.ObjectId | string, name: string, source: string) : Promise<void> {
        const sourceId = (await UserCollection.findOneByUsername(source))._id;
        await FeedModel.updateOne({owner: userId, name}, {$addToSet: {sources: sourceId}});
        const items = await FreetCollection.findAllFreetIdsByUserId(sourceId);
        await FeedModel.updateOne({owner: userId, name}, {$addToSet: {items: {$each: items}}});
    }

    /**
     * Determine whether a feed has a particular source.
     * 
     * @param userId the id of the user who owns the feed
     * @param name the name of the feed
     * @param source the username of the source to look for
     */
    static async hasSource(userId: Types.ObjectId | string, name: string, source: string) : Promise<Boolean> {
        const sourceId = (await UserCollection.findOneByUsername(source))._id;
        const result = await FeedModel.findOne({owner: userId, name, sources: sourceId});
        return result !== null;
    }

    /**
     * Remove a source from a feed.
     * 
     * @param userId the id of the user who owns the feed
     * @param name the name of the feed
     * @param source the username of the source to remove
     */
    static async removeSource(userId: Types.ObjectId | string, name: string, source: string) : Promise<void> {
        const sourceId = (await UserCollection.findOneByUsername(source))._id;
        await FeedModel.updateOne({owner: userId, name}, {$pull: {sources: sourceId}});
        const items = await FreetCollection.findAllFreetIdsByUserId(sourceId);
        await FeedModel.updateOne({owner: userId, name}, {$pullAll: {items}});
    }

    /**
     * Add an item to all feeds which contain its source.
     * 
     * @param sourceId the id of the source of the item
     * @param itemId the id of the item
     */
    static async addItem(sourceId: Types.ObjectId | string, itemId: Types.ObjectId | string): Promise<void> {
        await FeedModel.updateMany({sources: sourceId}, {$addToSet: {items: itemId}});
    }

    /**
     * Remove an item from all feeds which contain its source.
     * 
     * @param sourceId the id of the source of the item
     * @param itemId the id of the item
     */
    static async removeItem(sourceId: Types.ObjectId | string, itemId: Types.ObjectId | string): Promise<void> {
        await FeedModel.updateMany({sources: sourceId}, {$pull: {items: itemId}});
    }

}

export default FeedCollection;
