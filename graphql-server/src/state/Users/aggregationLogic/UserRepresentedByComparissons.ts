import { ObjectId } from 'mongodb';

import { votesInCommonPipelineForVotes } from "./votesInCommonPipelineForVotes";

export const userRepresentedByComparissons = ({ groupHandle, AuthUserId }) => [
    {
        '$lookup': {
            'as': 'directVotesMade_byRepresentative',
            'from': 'Votes',
            'let': {
                'userId': '$_id.representative',
                'group': groupHandle
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$user', '$$userId'
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': [
                                        '$isDirect', true
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$ne': [
                                        '$position', null
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': [
                                        '$groupChannel.group', '$$group'
                                    ]
                                }
                            },
                        ],
                    }
                },
            ]
        }
    },
    {
        '$addFields': {
            'stats': {
                'directVotesMade': {
                    $size: '$directVotesMade_byRepresentative'
                }
            }
        }
    },
    {
        '$lookup': {
            'as': 'yourStats_forRepresentative',
            'from': 'Votes',
            'let': {
                'userId': '$_id.representative',
                'group': groupHandle
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$user', new ObjectId(AuthUserId)
                                    ]
                                }
                            },
                            {
                                '$expr': {
                                    '$eq': [
                                        '$groupChannel.group', '$$group'
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
            'yourStats': { '$first': '$yourStats_forRepresentative' }
        }
    }
]