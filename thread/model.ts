import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {PopulatedFreet} from '../freet/model';

type ParameterizedRatedChild<I> = {
    freet: I;
    rating: number;
}

type RatedChild = ParameterizedRatedChild<Types.ObjectId>;
export type PopulatedRatedChild = ParameterizedRatedChild<PopulatedFreet>;

const RatedChildSchema = new Schema<RatedChild>({
    // The freet
    freet: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Freet'
    },
    // The rating (0-1)
    rating: {
        type: Schema.Types.Number,
        required: true
    }
});

type ParameterizedThread<I> = {
    _id: Types.ObjectId;
    freet: I;
    lineage: Array<I>;
    children: Array<ParameterizedRatedChild<I>>;
};

type Thread = ParameterizedThread<Types.ObjectId>;
export type PopulatedThread = ParameterizedThread<PopulatedFreet>;

const ThreadSchema = new Schema<Thread>({
    // The freet
    freet: {
        type: Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'Freet'
    },
    // The lineage of the freet
    lineage: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Freet'
    }],
    // The children of the freet
    children: [RatedChildSchema]
});

const ThreadModel = model<Thread>('Thread', ThreadSchema);
export default ThreadModel;
