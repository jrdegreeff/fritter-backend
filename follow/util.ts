import type {HydratedDocument} from 'mongoose';
import type {PopulatedFollow} from './model';

type FollowResponse = {
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
    return {
        user: follow.user.username,
        followers: follow.followers.map(u => u.username),
        following: follow.following.map(u => u.username)
    };
};

export {
    constructFollowResponse
};
