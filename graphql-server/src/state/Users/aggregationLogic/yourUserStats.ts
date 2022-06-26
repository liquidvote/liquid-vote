import { ObjectId } from 'mongodb';
import { votesInCommonPipelineForVotes } from './votesInCommonPipelineForVotes';

export const yourUserStatsAgg = ({ AuthUser }) =>  [{
    '$lookup': {
        'as': 'yourStats',
        'from': 'Votes',
        'let': {
            'userId': '$_id',
        },
        'pipeline': [
            {
                '$match': {
                    '$and': [
                        {
                            '$expr': {
                                '$eq': [
                                    '$user', new ObjectId(AuthUser._id)
                                ]
                            }
                        },
                    ],
                }
            },
            ...votesInCommonPipelineForVotes()
        ]
    }
}, {
    '$addFields': {
        'yourStats': { '$first': '$yourStats' }
    }
}]