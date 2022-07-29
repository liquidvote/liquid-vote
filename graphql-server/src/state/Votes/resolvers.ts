import { ObjectId } from 'mongodb';
const { promises: fs } = require("fs");

import { updateQuestionVotingStats } from '../Questions/resolvers';
import { VotersAgg, representeesAndVoteAgg, representativeVotesAgg, VotesGeneralAggregateLogic } from './aggregationLogic';

export const VoteResolvers = {
    Query: {
        Vote: async (_source, { questionText, group, channel }, { mongoDB, AuthUser }) => {
            const Vote = await mongoDB.collection("Votes")
                .findOne({ questionText, group, channel });

            return {
                ...Vote,
                thisUserIsAdmin: Vote.createdBy === AuthUser?._id,
            };
        },
        Votes: async (_source, {
            questionText,
            choiceText,
            groupHandle,
            userHandle,
            followsOnly,
            type = 'directVotesMade',
            sortBy
        }, { mongoDB, AuthUser }) => {

            console.log({ followsOnly });

            const User = !!userHandle && await mongoDB.collection("Users")
                .findOne({ 'LiquidUser.handle': userHandle });

            const VotesSpecificAggregateLogic = await (async (type, routeParams) => {
                return {
                    'all': () => VotesGeneralAggregateLogic({}),
                    'directFor': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'position': 'for',
                                // 'isDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.directFor': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }, {
                            '$eq': [
                                '$$v.userVote.position', 'for'
                            ]
                        }],
                        ...routeParams
                    }),
                    'directAgainst': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'position': 'against',
                                // 'isDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.directAgainst': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }, {
                            '$eq': [
                                '$$v.userVote.position', 'against'
                            ]
                        }],
                        ...routeParams
                    }),
                    'directVotesMade': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'isDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.direct': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }],
                        ...routeParams
                    }),
                    'directVotesInAgreement': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'youAndUserDetails.InAgreement': true,
                                // 'youAndUserDetails.bothDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.InAgreement': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }],
                        ...routeParams
                    }),
                    'directVotesInDisagreement': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // TODO: Get disagreement count
                                // 'youAndUserDetails.InAgreement': false,
                                // 'youAndUserDetails.bothDirect': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.InDisagreement': { $gt: 0 }
                            }
                        }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', true
                            ]
                        }],
                        ...routeParams
                    }),
                    'indirectVotes': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                position: "delegated",
                                isDirect: false,
                                'representatives.0': { $exists: true }
                            }
                        }],
                        // filterAfterMerge: [{
                        //     '$match': {
                        //         'Count.representing': { $gt: 0 }
                        //     }
                        // }],
                        choiceFilters: [{
                            '$eq': [
                                '$$v.userVote.isDirect', false
                            ]
                        }, {
                            '$eq': [
                                '$$v.userVote.position', 'delegated'
                            ]
                        }],
                        ...routeParams
                    }),
                    'indirectVotesMade': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // position: "delegated",
                                // isDirect: false
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.representing': { $gt: 0 }
                            }
                        }],
                        ...routeParams
                    }),
                    'indirectVotesMadeForUser': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // position: "delegated",
                                // isDirect: false
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.delegated': { $gt: 0 }
                            }
                        }],
                        ...routeParams
                    }),
                    'indirectVotesMadeByYou': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                // 'youAndUserDetails.yourVoteMadeForUser': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.yourVoteMadeForUser': { $gt: 0 }
                            }
                        }],
                        ...routeParams
                    }),
                    'indirectVotesMadeForYou': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                //     'youAndUserDetails.yourVoteMadeByUser': true
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'youAndUserDetailsCount.yourVoteMadeByUser': { $gt: 0 }
                            }
                        }],
                        ...routeParams
                    }),
                    'directVotesMadeByYou': () => VotesGeneralAggregateLogic({
                        filterAfterYourVoteAndBooleans: [{
                            '$match': {
                                'user': new ObjectId(AuthUser?._id), // stays
                                // 'isDirect': true,
                                // 'position': { $ne: null }
                            }
                        }],
                        filterAfterMerge: [{
                            '$match': {
                                'Count.direct': { $gt: 0 }
                            }
                        }],
                        ...routeParams
                    }),
                }[type]();
            })(type, {
                questionText,
                choiceText,
                groupHandle,
                userHandle,
                User,
                AuthUser,
                sortBy,
                followsOnly
            });


            // const writeToDebugFile = fs.writeFile(
            //     process.cwd() + '/debug' + '/votes_' + type + '.json',
            //     JSON.stringify(VotesSpecificAggregateLogic, null, 2),
            //     { encoding: 'utf8' }
            // );

            const Votes = (await mongoDB.collection("Votes").aggregate(VotesSpecificAggregateLogic).toArray())
                .map(v => ({
                    // _id: Math.random()*1000000,
                    ...v,

                    // get `yourVote`s into `question` and `question.choices`
                    question: {
                        ...v.question,
                        _id: `choiceaggregate_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
                        choices: v.question?.choices?.map(c => ({
                            ...c,
                            userVote: !!v.choiceVotes?.find(cv => cv.userVote?.choiceText === c.text)?.userVote ? ({
                                ...v.choiceVotes?.find(cv => cv.userVote.choiceText === c.text)?.userVote,
                                user: v.user,
                                groupChannel: v.groupChannel,
                                // _id: `userChoiceVote_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}_${c.text}`,
                            }) : null,
                            yourVote: !!v.choiceVotes?.find(cv => cv.userVote?.choiceText === c.text)?.yourVote ? ({
                                ...v.choiceVotes?.find(cv => cv.userVote.choiceText === c.text)?.yourVote,
                                user: AuthUser.LiquidUser,
                                groupChannel: v.groupChannel,
                                // _id: `yourVote_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}_${c.text}`,
                            }) : null
                        })),
                        yourVote: {
                            ...v.yourVote,
                            user: AuthUser.LiquidUser,
                            // _id: `yourVote_${type}_${questionText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
                        },
                        userVote: {
                            ...v.userVote,
                            user: v.user,
                            // _id: `userVote_${type}_${questionText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
                        }
                    },
                    // _id: `choiceaggregate_${type}_${questionText}_${choiceText}_${groupHandle}_${userHandle}_${v.user?.handle}_${v.questionText}`,
                }));;

            console.log({
                type,
                VotesL: Votes?.length,
                // VotesR: Votes.map(v => v?.yourVote?.representatives)
            });

            return Votes;
        },
        VotesTest: async (_source, { args }, { mongoDB, AuthUser }) => {

            // check poll stats against Votes

            // check user stats against Votes
            const users = await mongoDB.collection("Users").find().toArray();
            const usersWithStats = await Promise.all(users.map(async (u) => ({
                ...u,
                // TODO: replace getUserStats
                // stats: await getUserStats({ userId: u._id, mongoDB })
            })));
            const usersVoteQueryStats = await Promise.all(usersWithStats.map(async (u: any) => ({
                ...u,
                voteQueryStats: {
                    directVotesMade: (await VoteResolvers.Query.Votes(_source, {
                        questionText: null,
                        choiceText: null,
                        groupHandle: null,
                        userHandle: u.LiquidUser.handle,
                        type: 'directVotesMade',
                        sortBy: null,
                        followsOnly: false
                    }, { mongoDB, AuthUser })).length,
                    indirectVotesMadeByUser: (await VoteResolvers.Query.Votes(_source, {
                        questionText: null,
                        choiceText: null,
                        groupHandle: null,
                        userHandle: u.LiquidUser.handle,
                        type: 'indirectVotesMade',
                        sortBy: null,
                        followsOnly: false
                    }, { mongoDB, AuthUser })).length,
                    indirectVotesMadeForUser: (await VoteResolvers.Query.Votes(_source, {
                        questionText: null,
                        choiceText: null,
                        groupHandle: null,
                        userHandle: u.LiquidUser.handle,
                        type: 'indirectVotesMadeForUser',
                        sortBy: null,
                        followsOnly: false
                    }, { mongoDB, AuthUser })).length,
                }
            })));

            console.log({ usersVoteQueryStats: usersVoteQueryStats?.length })
            // check group stats against Votes

            return {
                // users: usersVoteQueryStats?.map((u: any) => ({
                //     handle: u?.LiquidUser?.handle,
                //     stats: u?.stats,
                //     voteQueryStats: u?.voteQueryStats
                // }))
            }
        }
    },
    Mutation: {
        editVote: async (_source, {
            Vote, questionText, choiceText, group
        }, {
            mongoDB, AuthUser
        }) => {

            if (!AuthUser) { return };

            // const question = await mongoDB.collection("Questions").findOne({
            //     questionText,
            //     'groupChannel.group': group,
            //     choiceText
            // });

            const Group_ = !!AuthUser && await mongoDB.collection("Groups")
                .findOne({
                    handle: group
                });

            const Vote_ = !!AuthUser && await mongoDB.collection("Votes")
                .findOne({
                    questionText,
                    choiceText,
                    'groupChannel.group': group,
                    // 'groupChannel.channel': channel,
                    user: new ObjectId(AuthUser?._id)
                });

            const savedVote = !!AuthUser && (await mongoDB.collection("Votes")
                .findOneAndUpdate({
                    'questionText': questionText,
                    'choiceText': choiceText,
                    'groupChannel': { group },
                    user: new ObjectId(AuthUser?._id)
                }, {
                    $set: {
                        'position': Vote.position,
                        'forWeight': Vote.position === 'for' ? 1 : 0,
                        'againstWeight': Vote.position === 'against' ? 1 : 0,
                        'isDirect': !!Vote.position,
                        ...(Vote?.position === null) ? {
                            'position': 'delegated',
                            'forWeight': Vote_.representatives.length === 0 ? 0 :
                                (Vote_.representatives.reduce(
                                    (acc, curr) => acc + curr.forWeight, 0
                                ) / Vote_.representatives.length) || 0,
                            'againstWeight': Vote_.representatives.length === 0 ? 0 :
                                (Vote_.representatives.reduce(
                                    (acc, curr) => acc + curr.againstWeight, 0
                                ) / Vote_.representatives.length) || 0,
                            // 'isDirect': Vote_.representatives.length === 0 ? true : false,
                        } : {
                            'position': Vote.position,
                            'forWeight': Vote.position === 'for' ? 1 : 0,
                            'againstWeight': Vote.position === 'against' ? 1 : 0,
                            'isDirect': true,
                            'representatives': Vote_?.representatives || [],
                        },
                        lastEditOn: Date.now()
                    },
                    $setOnInsert: {
                        'questionText': questionText,
                        'choiceText': choiceText,
                        'groupChannel': { group },
                        'createdOn': Date.now(),
                        'createdBy': AuthUser._id,
                        'user': AuthUser._id
                    }
                },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ))?.value;

            const representeeVotes = await updateRepresenteesVote({
                efficientOrThorough: "efficient",
                // efficient - gets other representatives from a previously calculated list
                // thorough - gets other representatives from a query

                representativeId: AuthUser._id,
                isRepresentingYou: true, // false, for when removing vote
                groupId: Group_._id,
                groupHandle: group,
                questionText,
                choiceText,
                representativeVote: savedVote,

                AuthUser,
                mongoDB,
            });

            // Update Question Stats
            const QuestionStats = !!AuthUser && await updateQuestionVotingStats({
                questionText,
                choiceText,
                group,
                mongoDB,
                AuthUser
            });

            // Update User Stats
            // Update Group Stats
            // Update Tags Stats

            console.log({ savedVote });

            return {
                ...savedVote,
                thisUserIsAdmin: true,
                QuestionStats,
                representeeVotes
            };
        },
    },
};

export const updateRepresentedVote = async ({
    questionText,
    choiceText,
    groupHandle,
    representeeId,
    // representativesVotes,
    existingVote,

    thoroughRepresentatives,
    representativeVote,
    isRepresentingYou,

    AuthUser,
    mongoDB
}) => {

    const representativesToUpdate = thoroughRepresentatives ||
        (!!existingVote?.representatives?.length ? existingVote?.representatives : [])?.reduce(
            (acc, curr) => [
                ...acc,
                // removes previous representative object
                ...(
                    curr.representativeId.toString() !== representativeVote.user.toString()
                ) ? [curr] : []
            ],
            [
                ...(!!isRepresentingYou) ? [{
                    'representativeId': representativeVote.user,
                    'position': representativeVote.position,
                    'forWeight': representativeVote.forWeight,
                    'againstWeight': representativeVote.againstWeight,
                    'lastEditOn': Date.now(),
                    'createdOn': representativeVote?.createdOn || Date.now(),
                }] : []
            ]
        );

    const dbDoc = !!AuthUser && (await mongoDB.collection("Votes")
        .findOneAndUpdate({
            'questionText': questionText,
            'choiceText': choiceText,
            'groupChannel': { group: groupHandle },
            'user': new ObjectId(representeeId)
        }, {
            $set: {
                'position': existingVote?.isDirect ? existingVote.position : 'delegated',
                'forWeight': existingVote?.isDirect ? existingVote.forWeight :
                    (representativesToUpdate.reduce(
                        (acc, curr) => acc + curr.forWeight, 0
                    ) / representativesToUpdate.length) || 0,
                'againstWeight': existingVote?.isDirect ? existingVote.againstWeight :
                    (representativesToUpdate.reduce(
                        (acc, curr) => acc + curr.againstWeight, 0
                    ) / representativesToUpdate.length) || 0,
                'representatives': representativesToUpdate,

                lastEditOn: existingVote?.isDirect ? existingVote?.lastEditOn : Date.now()
            },
            $setOnInsert: {
                'questionText': questionText,
                'choiceText': choiceText,
                'groupChannel': { group: groupHandle },
                'user': new ObjectId(representeeId),
                isDirect: false,
                createdOn: Date.now()
            }
        },
            {
                upsert: true,
                returnDocument: 'after'
            }
        ))?.value;

    return dbDoc;
};

// Update ALL representeeS votes for a SINGLE Vote
export const updateRepresenteesVote = async ({
    efficientOrThorough = "efficient",
    // efficient - gets other representatives from a previously calculated list
    // thorough - gets other representatives from a query

    representativeId,
    isRepresentingYou, // false, for when removing vote
    groupId,
    groupHandle,
    questionText,
    choiceText,
    representativeVote,

    AuthUser,
    mongoDB,
}) => {

    const representeesAndVote = !!representativeId && (
        await mongoDB.collection("UserRepresentations")
            .aggregate(representeesAndVoteAgg({
                efficientOrThorough,
                representativeId,
                isRepresentingYou, // false, for when removing vote
                groupId,
                groupHandle,
                questionText,
                choiceText
            }))
            .toArray()
    );

    const updatedRepresenteesVotes = !!representeesAndVote &&
        await Promise.all(representeesAndVote?.map(async (r) => {

            const RepresenteeVote = r?.Vote;

            return await updateRepresentedVote({
                questionText,
                choiceText,
                groupHandle,
                representeeId: r.representeeId,
                // representativesVotes: representativesToUpdate,
                existingVote: RepresenteeVote,
                thoroughRepresentatives: r?.representatives,
                representativeVote,
                isRepresentingYou,

                AuthUser,
                mongoDB
            })
        }));

    return updatedRepresenteesVotes;
};

// Update a SINGLE representee's voteS for ALL group/tag votes made by representative
export const updateRepresenteesVotes = async ({
    efficientOrThorough = "efficient",
    // efficient - gets other representatives from a previously calculated list
    // thorough - gets other representatives from a query

    representeeId,
    representativeId,
    isRepresentingYou, // false, for when removing vote
    groupId,
    groupHandle,

    AuthUser,
    mongoDB,
}) => {
    const representativeVotes = !!representativeId && (
        await mongoDB.collection("Votes")
            .aggregate(representativeVotesAgg({
                groupHandle,
                groupId,
                representativeId,
                representeeId,
                efficientOrThorough
            }))
            .toArray()
    );

    // console.log("updateRepresenteesVotes: - representativeVotes.length: " + representativeVotes.length);

    // const writeToDebugFile = await fs.writeFile(
    //     process.cwd() + '/debug' + '/representativeVotesAgg.json',
    //     JSON.stringify({
    //         representativeVotesAgg: representativeVotesAgg({
    //             groupHandle,
    //             groupId,
    //             representativeId,
    //             representeeId,
    //             efficientOrThorough
    //         })
    //     }, null, 2),
    //     { encoding: 'utf8' }
    // );

    // const writeToDebugFile2 = await fs.writeFile(
    //     process.cwd() + '/debug' + '/representativeVotes.json',
    //     JSON.stringify({ representativeVotes }, null, 2),
    //     { encoding: 'utf8' }
    // );

    const updatedRepresenteeVotes = await Promise.all(representativeVotes.map(async (v) => {
        return await updateRepresentedVote({
            questionText: v.questionText,
            choiceText: v.choiceText,
            groupHandle: v.groupChannel.group,
            representeeId: representeeId,
            existingVote: v?.RepresenteeVote,

            thoroughRepresentatives: v?.RepresenteeRepresentativesVotes,
            representativeVote: v,
            isRepresentingYou,

            AuthUser,
            mongoDB
        })
    }));

    return updatedRepresenteeVotes;
}

// Update All representeeS votes on a Specific Question
// for when a tag is added/removed or debug
export const updateQuestionDelegatedVotes = async ({
    efficientOrThorough = "efficient",
    groupId,
    groupHandle,
    questionText,
}) => {

    // nullify indirect votes

    // direct votes
    // representees

    // update representee votes

}
