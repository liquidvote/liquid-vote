export const QuestionsInCommonAgg = ({ questionText, group }) => [
    {
        '$match': {
            'questionText': questionText,
            'groupChannel.group': group
        }
    }, {
        '$lookup': {
            "as": "Voters",
            "from": "Votes",
            "let": {
                "questionText": "$questionText",
                "group": "$groupChannel.group"
            },
            "pipeline": [{
                "$match": {
                    "$and": [{
                        "$expr": {
                            "$eq": ["$questionText", "$$questionText"]
                        }
                    }, {
                        "$expr": {
                            "$eq": ["$groupChannel.group", "$$group"]
                        }
                    }, {
                        "$expr": {
                            "$eq": ["$isDirect", true]
                        }
                    }]
                }
            }, {
                "$group": {
                    "_id": {
                        "user": "$user"
                    },
                    "count": {
                        "$sum": 1
                    },
                    "originalQuestionVotes": {
                        "$push": "$$ROOT"
                    },
                }
            }, {
                "$addFields": {
                    "voter": "$_id.user",
                    "group": "$$group"
                }
            }]
        }
    }, {
        '$unwind': {
            'path': '$Voters'
        }
    }, {
        '$replaceRoot': {
            'newRoot': '$Voters'
        }
    },

    {
        '$lookup': {
            "as": "AllVoterVotes",
            "from": "Votes",
            "let": {
                "voter": "$voter",
                "group": "$group",
                "originalQuestionVotes": "$originalQuestionVotes"
            },
            "pipeline": [{
                "$match": {
                    "$and": [{
                        "$expr": {
                            "$eq": ["$user", {
                                "$toObjectId": "$$voter"
                            }]
                        }
                    }, {
                        "$expr": {
                            "$eq": ["$isDirect", true]
                        }
                    },
                    // LIMITATION: due to the heavy query it's currently limited within the group
                    {
                        "$expr": {
                            "$eq": ["$groupChannel.group", "$$group"]
                        }
                    }]
                }
            },
            {
                "$addFields": {
                    'originalQuestionVote': '$$originalQuestionVotes'
                }
            },
            {
                "$unwind": {
                    'path': '$originalQuestionVote'
                }
            },
            {
                "$group": {
                    "_id": {
                        'questionText': '$questionText',
                        'group': '$groupChannel.group',
                        "choiceText": "$choiceText",
                        "originalQuestionVoteChoiceText": "$originalQuestionVote.choiceText",
                    },
                    "count": {
                        "$sum": 1
                    },
                    "bothPositions": {
                        "$push": {
                            'originalQuestionVotePosition': '$originalQuestionVote.position',
                            'position': '$position',
                            'for_for': {
                                $cond: [
                                    {
                                        "$and": [
                                            { $eq: ['$originalQuestionVote.position', 'for'] },
                                            { $eq: ['$position', 'for'] }
                                        ]
                                    }, 1, 0
                                ]
                            },
                            'for_against': {
                                $cond: [
                                    {
                                        "$and": [
                                            { $eq: ['$originalQuestionVote.position', 'for'] },
                                            { $eq: ['$position', 'against'] }
                                        ]
                                    }, 1, 0
                                ]
                            },
                            'against_for': {
                                $cond: [
                                    {
                                        "$and": [
                                            { $eq: ['$originalQuestionVote.position', 'against'] },
                                            { $eq: ['$position', 'for'] }
                                        ]
                                    }, 1, 0
                                ]
                            },
                            'against_against': {
                                $cond: [
                                    {
                                        "$and": [
                                            { $eq: ['$originalQuestionVote.position', 'against'] },
                                            { $eq: ['$position', 'against'] }
                                        ]
                                    }, 1, 0
                                ]
                            }
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        'questionText': '$_id.questionText',
                        'group': '$_id.group',
                    },
                    "count": {
                        "$sum": 1
                    },
                    "choices": {
                        "$push": {
                            'choiceText': '$_id.choiceText',
                            'originalQuestionVoteChoiceText': '$_id.originalQuestionVoteChoiceText',
                            'originalQuestionVotePosition': '$_id.originalQuestionVote.position',
                            'bothPositions': { '$first': '$bothPositions' },
                        }
                    }
                }
            }
            ]
        },
    },








    {
        '$unwind': {
            'path': '$AllVoterVotes'
        }
    },

    {
        "$unwind": {
            'path': '$AllVoterVotes.choices'
        }
    },

    {
        '$group': {

            "_id": {
                'questionText': '$AllVoterVotes._id.questionText',
                'group': '$AllVoterVotes._id.group',
                "choiceText": '$AllVoterVotes.choices.choiceText',
                "originalQuestionVoteChoiceText": '$AllVoterVotes.choices.originalQuestionVoteChoiceText',
            },

            "count": {
                "$sum": 1,
            },
            "for_for": {
                "$sum": "$AllVoterVotes.choices.bothPositions.for_for",
            },
            "for_against": {
                "$sum": "$AllVoterVotes.choices.bothPositions.for_against",
            },
            "against_for": {
                "$sum": "$AllVoterVotes.choices.bothPositions.against_for",
            },
            "against_against": {
                "$sum": "$AllVoterVotes.choices.bothPositions.against_against",
            }
        }
    },



    {
        '$group': {
            "_id": {
                "questionText": "$_id.questionText",
                "group": "$_id.group"
            },
            "count": {
                "$sum": 1
            },
            "choices": {
                "$push": {
                    'choiceText': '$_id.choiceText',
                    'originalQuestionVoteChoiceText': '$_id.originalQuestionVoteChoiceText',
                    'stats': {
                        "for_for": "$for_for",
                        "for_against": "$for_against",
                        "against_for": "$against_for",
                        "against_against": "$against_against"

                    }
                }
            }

        }
    }, {
        '$sort': {
            'count': -1
        }
    }, {
        '$lookup': {
            'as': 'question',
            'from': 'Questions',
            'let': {
                'questionText': '$_id.questionText',
                'group': '$_id.group',
                'count': '$count',
                "choices": "$choices"
            },
            'pipeline': [
                {
                    '$match': {
                        '$and': [
                            {
                                '$expr': {
                                    '$eq': [
                                        '$questionText', '$$questionText'
                                    ]
                                }
                            }, {
                                '$expr': {
                                    '$eq': [
                                        '$groupChannel.group', '$$group'
                                    ]
                                }
                            }
                        ]
                    }
                }, {
                    '$addFields': {
                        'votersInCommonStats': {
                            'voterCount': '$$count',
                            "choices": "$$choices"
                        }
                    }
                }
            ]
        }
    },
    {
        '$match': {
            'question.0': { $exists: true }
        }
    },
    {
        '$replaceRoot': {
            'newRoot': {
                '$first': '$question'
            }
        }
    }
];