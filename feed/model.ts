import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type {PopulatedFreet} from '../freet/model';

type ParameterizedFeed<U,S,I> = {
    _id: Types.ObjectId;
    owner: U;
    name: string;
    sources: Array<S>;
    items: Array<I>;
};

type Feed = ParameterizedFeed<Types.ObjectId,Types.ObjectId,Types.ObjectId>;
export type PopulatedFeed = ParameterizedFeed<User,User,PopulatedFreet>;

const FeedSchema = new Schema<Feed>({
    // The owner of the feed
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // The name of the feed
    name: {
        type: Schema.Types.String,
        required: true
    },
    // The sources of the feed
    sources: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }],
    // The items in the feed
    items: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Freet'
    }]
});

const FeedModel = model<Feed>('Feed', FeedSchema);
export default FeedModel;
