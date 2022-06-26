import { ObjectId } from 'mongodb';
import { votesInCommonPipelineForVotes } from './votesInCommonPipelineForVotes';

export const yourUserStatsAgg = ({ AuthUser, groupHandle }) => [{
    '$lookup': {
        'as': 'yourStats_',
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
                        ...(!!groupHandle) ? [
                            {
                                '$expr': {
                                    '$eq': ['$groupChannel.group', groupHandle]
                                }
                            }
                        ] : [],
                    ],
                }
            },

            ...votesInCommonPipelineForVotes(),
        ]
    },
},
...(!groupHandle) ? [
    {
        '$addFields': {
            'yourStats': { '$first': '$yourStats_' }
        }
    }
] : [{
    '$addFields': {
        'groupStats.yourStats': { '$first': '$yourStats_' }
    }
}],
]