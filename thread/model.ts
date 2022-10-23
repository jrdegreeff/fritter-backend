import type {Types} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {PopulatedFreet} from '../freet/model';

type ParameterizedThread<I> = {
    _id: Types.ObjectId;
    freet: I;
    lineage: Array<I>;
    children: Array<I>;
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
    children: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Freet'
    }]
});

const ThreadModel = model<Thread>('Thread', ThreadSchema);
export default ThreadModel;
