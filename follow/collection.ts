import {HydratedDocument, Types} from 'mongoose';
import type {PopulatedFollow} from './model';
import FollowModel from './model';
import UserCollection from '../user/collection';

class FollowCollection {

    /**
     * Create a follow document.
     * 
     * @param userId the id of the user whose document should be created
     */
    static async addOne(userId: Types.ObjectId): Promise<void> {
        const follow = new FollowModel({
            user: userId,
            followers: [],
            following: []
        });
        await follow.save();
    }

    /**
     * Find a follow document.
     * 
     * @param username the username of the user whose document should be found
     * @return the populated document
     */
     static async findOne(username: string): Promise<HydratedDocument<PopulatedFollow>> {
        const userId = (await UserCollection.findOneByUsername(username))._id;
        return FollowModel.findOne({user: userId})
                          .populate('user')
                          .populate('followers')
                          .populate('following');
    }

    /**
     * Determine whether a user is a follower of another user.
     * 
     * @param userId the potential follower
     * @param username the potential followed user
     * @return true if userId follows username, false otherwise
     */
    static async isFollower(userId: Types.ObjectId | string, username: string): Promise<Boolean> {
        const followingId = (await UserCollection.findOneByUsername(username))._id;
        const result = await FollowModel.findOne({user: new Types.ObjectId(userId), following: followingId}).exec();
        return result !== null;
    }

    /**
     * Destroy a follow document.
     * 
     * @param userId the id of the user whose document should be destroyed
     */
    static async deleteOne(userId: Types.ObjectId | string): Promise<void> {
        const follow = await FollowModel.findOne({user: userId}).exec();
        for (const follower of follow.followers) {
            this.removeFollow(follower, userId);
        }
        for (const following of follow.following) {
            this.removeFollow(userId, following);
        }
        follow.delete();
    }

    /**
     * Add a following relationship.
     * 
     * @param followerId the id of the follower account
     * @param followingUsername the username of the followed account
     */
    static async insertFollowByUsername(followerId: Types.ObjectId | string, followingUsername: string): Promise<void> {
        const followingId: Types.ObjectId = (await UserCollection.findOneByUsername(followingUsername))._id;
        this.insertFollow(followerId, followingId);
    }

    /**
     * Add a following relationship.
     * 
     * @param followerId the id of the follower account
     * @param followingUsername the username of the followed account
     */
     static async insertFollow(followerId: Types.ObjectId | string, followingId: Types.ObjectId | string): Promise<void> {
        await FollowModel.updateOne({user: followerId}, {$addToSet: {following: followingId}});
        await FollowModel.updateOne({user: followingId}, {$addToSet: {followers: followerId}});
    }

    /**
     * Remove a following relationship.
     * 
     * @param followerId the id of the follower account
     * @param followingUsername the username of the followed account
     */
    static async removeFollowByUsername(followerId: Types.ObjectId | string, followingUsername: string): Promise<void> {
        const followingId: Types.ObjectId = (await UserCollection.findOneByUsername(followingUsername))._id;
        this.removeFollow(followerId, followingId);
    }

    /**
     * Remove a following relationship.
     * 
     * @param followerId the id of the follower account
     * @param followingUsername the username of the followed account
     */
     static async removeFollow(followerId: Types.ObjectId | string, followingId: Types.ObjectId | string): Promise<void> {
        await FollowModel.updateOne({user: followerId}, {$pull: {following: followingId}});
        await FollowModel.updateOne({user: followingId}, {$pull: {followers: followerId}});
    }

}

export default FollowCollection;
