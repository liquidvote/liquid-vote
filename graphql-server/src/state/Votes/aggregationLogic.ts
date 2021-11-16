import { ObjectId } from 'mongodb';

export const representeesAndVoteAgg = ({
    efficientOrThorough,
    representativeId,
    isRepresentingYou, // false, for when removing vote
    groupId,
    groupHandle,
    questionText,
    choiceText
}) => [
        {
            $match: {
                representativeId: new ObjectId(representativeId),
                // OR
                groupId: new ObjectId(groupId),
                // OR
                // TAGS
                isRepresentingYou
            }
        },
        // TODO: Ensure no repeat representatives (from group and tag(s))
        {
            $lookup: {
                as: 'Vote',
                from: 'Votes',
                let: {
                    representee: "$representeeId"
                },
                pipeline: [
                    {
                        $match: {
                            questionText,
                            choiceText,
                            'groupChannel.group': groupHandle,
                            $expr: {
                                $eq: [
                                    "$user",
                                    { "$toObjectId": "$$representee" }
                                ]
                            },
                            // isDirect: false
                            // saves even if direct,
                            // so that if representee changes to null
                            // we already have the representatives
                        }
                    }
                ]
            }
        },
        {
            $addFields: { Vote: { '$first': '$Vote' } },
        },
        ...(efficientOrThorough === 'thorough') ? [{
            $lookup: {
                as: 'representatives',
                from: 'UserRepresentations',
                let: {
                    representee: "$representeeId"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$representeeId",
                                    { "$toObjectId": "$$representee" }
                                ]
                            },
                            groupId: ObjectId(groupId),
                            isRepresentingYou: true
                        }
                    },
                    {
                        $lookup: {
                            as: 'vote',
                            from: 'Votes',
                            let: {
                                representativeId: "$representativeId"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        questionText,
                                        choiceText,
                                        'groupChannel.group': groupHandle,
                                        $expr: {
                                            $eq: [
                                                "$user",
                                                { "$toObjectId": "$$representativeId" }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $addFields: {
                                        representativeId: "$$representativeId"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $match: {
                            $expr: { $gt: [{ $size: "$vote" }, 0] }
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                '$first': '$vote',
                            }
                        }
                    }
                ],
            }
        }] : []
    ];

export const representativeVotesAgg = ({
    groupHandle,
    groupId,
    representativeId,
    representeeId,
    efficientOrThorough
}) => [
        {
            $match: {
                'groupChannel.group': groupHandle,
                // questionText: 'lt-1',
                $expr: {
                    $eq: [
                        "$user",
                        { "$toObjectId": representativeId }
                    ]
                }
            }
        },
        {
            $lookup: {
                as: 'RepresenteeVote',
                from: 'Votes',
                let: {
                    questionText: "$questionText",
                    choiceText: "$choiceText",
                    group: "$groupChannel.group"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$questionText", "$$questionText"] },
                                    { $eq: ["$choiceText", "$$choiceText"] },
                                    { $eq: ["$groupChannel.group", "$$group"] },
                                    { $eq: ["$user", { "$toObjectId": representeeId }] }
                                ]
                            }
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                RepresenteeVote: {
                    '$first': '$RepresenteeVote',
                }

            }
        },
        ...(efficientOrThorough === 'thorough') ? [{
            $lookup: {
                as: 'RepresenteeRepresentativesVotes',
                from: 'UserRepresentations',
                let: {
                    questionText: "$questionText",
                    choiceText: "$choiceText",
                    group: "$groupChannel.group"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$representeeId",
                                    { "$toObjectId": representeeId }
                                ]
                            },
                            groupId: ObjectId(groupId),
                            isRepresentingYou: true // HUM!
                        }
                    },
                    {
                        $lookup: {
                            as: 'vote',
                            from: 'Votes',
                            let: {
                                representativeId: "$representativeId",
                                questionText: "$$questionText",
                                choiceText: "$$choiceText",
                                group: "$$group"
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$questionText", "$$questionText"] },
                                                { $eq: ["$choiceText", "$$choiceText"] },
                                                { $eq: ["$groupChannel.group", "$$group"] },
                                                { $eq: ["$user", { "$toObjectId": "$$representativeId" }] }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $addFields: {
                                        representativeId: "$$representativeId"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $match: {
                            $expr: { $gt: [{ $size: "$vote" }, 0] }
                        }
                    },
                    {
                        $replaceRoot: {
                            newRoot: {
                                '$first': '$vote',
                            }
                        }
                    }
                ],
            }
        }] : []
    ];