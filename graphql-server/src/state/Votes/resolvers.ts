import { ObjectID } from 'mongodb';

import { updateQuestionVotingStats } from '../Questions/resolvers';

export const VoteResolvers = {
    Query: {
        Vote: async (_source, { questionText, group, channel }, { mongoDB, s3, AuthUser }) => {

            const Vote = await mongoDB.collection("Votes")
                .findOne({ questionText, group, channel });

            return {
                ...Vote,
                thisUserIsAdmin: Vote.createdBy === AuthUser?.LiquidUser?.handle,
            };
        },
    },
    Mutation: {
        editVote: async (_source, {
            Vote, questionText, choiceText, group, channel
        }, {
            mongoDB, s3, AuthUser
        }) => {

            console.log({ position: Vote.position === null });

            const Vote_ = !!AuthUser && await mongoDB.collection("Votes")
                .findOne({
                    questionText,
                    choiceText,
                    'groupChannel.group': group,
                    'groupChannel.channel': channel,
                    user: ObjectID(AuthUser?._id)
                });

            const Group_ = !!AuthUser && await mongoDB.collection("Groups")
                .findOne({
                    handle: group
                });

            const savedVote = (!!AuthUser && !Vote_) ?
                (await mongoDB.collection("Votes").insertOne({
                    'questionText': questionText,
                    'choiceText': choiceText,
                    'groupChannel': { group, channel },
                    'position': Vote.position,
                    'forWeight': Vote.position === 'for' ? 1 : 0,
                    'againstWeight': Vote.position === 'against' ? 1 : 0,
                    'isDirect': true,
                    'representatives': [],

                    'lastEditOn': Date.now(),
                    'createdOn': Date.now(),
                    'createdBy': AuthUser.LiquidUser.handle,
                    'user': AuthUser._id
                }))?.ops[0] : (
                    !!AuthUser &&
                    Vote.position === null &&
                    Vote_.user.toString() === AuthUser._id.toString()
                ) ? (
                    await mongoDB.collection("Votes").findOneAndUpdate(
                        { _id: Vote_._id },
                        {
                            $set: {
                                'position': Vote_.representatives.length === 0 ? null : 'delegated',
                                'forWeight': Vote_.representatives.length === 0 ? 0 :
                                    (Vote_.representatives.reduce(
                                        (acc, curr) => acc + curr.forWeight, 0
                                    ) / Vote_.representatives.length) || 0,
                                'againstWeight': Vote_.representatives.length === 0 ? 0 :
                                    (Vote_.representatives.reduce(
                                        (acc, curr) => acc + curr.againstWeight, 0
                                    ) / Vote_.representatives.length) || 0,
                                'isDirect': Vote_.representatives.length === 0 ? true : false,
                                'lastEditOn': Date.now(),
                            },
                        },
                        {
                            returnNewDocument: true,
                            returnOriginal: false
                        }
                    )
                )?.value : (
                    !!AuthUser &&
                    Vote_.user.toString() === AuthUser._id.toString()
                ) ? (
                    await mongoDB.collection("Votes").findOneAndUpdate(
                        { _id: Vote_._id },
                        {
                            $set: {
                                'position': Vote.position,
                                'forWeight': Vote.position === 'for' ? 1 : 0,
                                'againstWeight': Vote.position === 'against' ? 1 : 0,
                                'isDirect': true,
                                'lastEditOn': Date.now(),
                            },
                        },
                        {
                            returnNewDocument: true,
                            returnOriginal: false
                        }
                    )
                )?.value : null;

            console.log({
                savedVote
            })

            const representeesAndVote = !!AuthUser && (await mongoDB.collection("UserRepresentations")
                .aggregate([{
                    $match: {
                        representativeId: ObjectID(AuthUser._id),
                        groupId: ObjectID(Group_._id),
                        isRepresentingYou: true
                    }
                }, {
                    $lookup: {
                        from: 'Votes',
                        let: {
                            representee: "$representeeId"
                        },
                        pipeline: [
                            {
                                $match: {
                                    questionText,
                                    choiceText,
                                    'groupChannel.group': group,
                                    'groupChannel.channel': channel,
                                    $expr: {
                                        $eq: [
                                            "$user",
                                            { "$toObjectId": "$$representee" }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: 'Vote'
                    }
                }])
                .toArray()
            );

            console.log({
                representeesAndVote
            })

            const updatedRepresenteesVotes = !!representeesAndVote && await Promise.all(representeesAndVote?.map(async (r) => {
                return !r.Vote.length ?
                    (await mongoDB.collection("Votes").insertOne({
                        'questionText': questionText,
                        'choiceText': choiceText,
                        'groupChannel': { group, channel },
                        'position': Vote.position,
                        'forWeight': Vote.position === 'for' ? 1 : 0,
                        'againstWeight': Vote.position === 'against' ? 1 : 0,
                        'isDirect': false,
                        'representatives': [{
                            'representativeId': AuthUser._id,
                            'representativeHandle': AuthUser.LiquidUser.handle,
                            'representativeAvatar': AuthUser.LiquidUser.avatar,
                            'representativeName': AuthUser.LiquidUser.name,
                            'position': Vote.position,
                            'forWeight': Vote.position === 'for' ? 1 : 0,
                            'againstWeight': Vote.position === 'against' ? 1 : 0,
                            'lastEditOn': Date.now(),
                            'createdOn': Date.now(),
                        }],
                        'lastEditOn': Date.now(),
                        'createdOn': Date.now(),
                        'createdBy': AuthUser.LiquidUser.handle,
                        'user': r.representeeId // ⚠️ huuuuum - id, should be handle. but handle not great
                    }))?.ops[0] : (async () => {

                        const Vote_ = r.Vote[0];
                        const isDirect = Vote_?.isDirect;
                        const userRepresentativeVote_ = Vote_?.representatives?.find(
                            v => v.representativeHandle === AuthUser.LiquidUser.handle
                        );

                        const representativesToUpdate = Vote_.representatives.reduce(
                            (acc, curr) => [
                                ...acc,
                                // removes previous representative object
                                ...(curr.representativeHandle !== AuthUser.LiquidUser.handle) ? [curr] : []
                            ],
                            [{
                                'representativeId': AuthUser._id,
                                'representativeHandle': AuthUser.LiquidUser.handle,
                                'representativeAvatar': AuthUser.LiquidUser.avatar,
                                'representativeName': AuthUser.LiquidUser.name,
                                'position': Vote.position,
                                'forWeight': Vote.position === 'for' ? 1 : 0,
                                'againstWeight': Vote.position === 'against' ? 1 : 0,
                                'lastEditOn': Date.now(),
                                'createdOn': userRepresentativeVote_?.createdOn || Date.now(),
                            }]
                        );

                        return (await mongoDB.collection("Votes").findOneAndUpdate(
                            { _id: Vote_._id },
                            {
                                $set: {
                                    'position': isDirect ? Vote_.position : 'delegated',
                                    'forWeight': isDirect ? Vote_.forWeight :
                                        (representativesToUpdate.reduce(
                                            (acc, curr) => acc + curr.forWeight, 0
                                        ) / representativesToUpdate.length) || 0,
                                    'againstWeight': isDirect ? Vote_.againstWeight :
                                        (representativesToUpdate.reduce(
                                            (acc, curr) => acc + curr.againstWeight, 0
                                        ) / representativesToUpdate.length) || 0,
                                    'representatives': representativesToUpdate,
                                    'lastEditOn': Date.now(),
                                },
                            },
                            {
                                returnNewDocument: true,
                                returnOriginal: false
                            }
                        ))?.value
                    })()
            }));

            // Update Question Stats
            const QuestionStats = !!AuthUser && await updateQuestionVotingStats({
                questionText,
                choiceText,
                group,
                channel,
                mongoDB,
                AuthUser
            });

            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats,
                representeeVotes: updatedRepresenteesVotes
            };
        },
    },
};