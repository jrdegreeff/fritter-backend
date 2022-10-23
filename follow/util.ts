import type {HydratedDocument} from 'mongoose';
import type {PopulatedFollow} from './model';

export type FollowResponse = {
    user: string;
    followers: Array<string>;
    following: Array<string>;
};

/**
 * Transform a raw Follow object from the database into an object to be presented to the frontend.
 * 
 * @param follow the object to be transformed
 * @return the corresponding response object
 */
const constructFollowResponse = (follow: HydratedDocument<PopulatedFollow>): FollowResponse => {
    const followCopy: PopulatedFollow = {
        ...follow.toObject({
            versionKey: false // Cosmetics; prevents returning of __v property
        })
    };
    return {
        user: followCopy.user.username,
        followers: followCopy.followers.map(u => u.username),
        following: followCopy.following.map(u => u.username)
    };
};

export {
    constructFollowResponse
};
