import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';

type ParameterizedFollow<U> = {
    _id: Types.ObjectId;
    user: U;
    followers: Array<U>;
    following: Array<U>;
};

type Follow = ParameterizedFollow<Types.ObjectId>;
export type PopulatedFollow = ParameterizedFollow<User>;

const FollowSchema = new Schema<Follow>({
    // The user
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'User'
    },
    // The accounts that follow the user
    followers: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }],
    // The accounts that the user is following
    following: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }]
});

const FollowModel = model<Follow>('Follow', FollowSchema);
export default FollowModel;
