import { ObjectId } from 'mongodb';

import { votesInCommonPipelineForVotes } from "./votesInCommonPipelineForVotes";

export const userRepresentingComparissons = ({ groupHandle, AuthUserId }) => [
    {
        '$lookup': {
            'as': 'directVotesMade_byRepresentee',
            'from': 'Votes',
            'let': {
                'userId': '$_id.representee',
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
                    $size: '$directVotesMade_byRepresentee'
                }
            }
        }
    },
    {
        '$lookup': {
            'as': 'yourStats_forRepresentee',
            'from': 'Votes',
            'let': {
                'userId': '$_id.representee',
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
            'yourStats': { '$first': '$yourStats_forRepresentee' }
        }
    }
]