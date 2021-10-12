// This server config serves both for `apollo-server` and `apollo-server-lambda`
// which helps us use both locally and not depend only on `sls offline` which is crazy slow.

// The big drawback is that not all config options are available on both,
// so only muttually available configs can be used

const MongoClient = require("mongodb").MongoClient;

const atlasCredentials = require("../../credentials/atlas-credentials.json");
import { AuthUserTypeDefs, AuthUserResolvers } from "../state/AuthUser";
import { UserTypeDefs, UserResolvers } from "../state/Users";
import { GroupTypeDefs, GroupResolvers } from "../state/Groups";
import { QuestionTypeDefs, QuestionResolvers } from "../state/Questions";
import { VoteTypeDefs, VoteResolvers } from "../state/Votes";
import { InviteTypeDefs, InviteResolvers } from "../state/Invites";
import { S3TypeDefs, S3Resolvers } from "../state/S3";
import { ArgumentTypeDefs, ArgumentResolvers } from "../state/Arguments";
import { ArgumentUpVotesTypeDefs, ArgumentUpVotesResolvers } from "../state/ArgumentUpVotes";

const mongoClient = new MongoClient(
    `mongodb+srv://${atlasCredentials.username}:${atlasCredentials.password}@aiaiaiaminhavida.oobyz.mongodb.net/Enron?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

let LiquidVoteDBCached = null
const getDBConnection = async () => {
    if (LiquidVoteDBCached === null) {
        console.log('db not cached');
        const LiquidVoteDB = (await mongoClient.connect()).db("LiquidVote");
        LiquidVoteDBCached = LiquidVoteDB;
        return LiquidVoteDBCached;
    } else {
        console.log('db cached');
        return LiquidVoteDBCached;
    }
}


export const configServer = async ({ ApolloServer, gql }) => {

    const QueryTypeDefs = gql`
        scalar JSON

        type Query {
            _empty: String
            # TypeDefs Merged in Bellow, from "./state/*/typeDefs"
        }
        type Mutation {
            _empty: String
            # TypeDefs Merged in Bellow, from "./state/*/typeDefs"
        }
    `;

    const DBConnection = (await getDBConnection());
    const server = new ApolloServer({
        typeDefs: [
            QueryTypeDefs,
            AuthUserTypeDefs,
            UserTypeDefs,
            GroupTypeDefs,
            QuestionTypeDefs,
            VoteTypeDefs,
            InviteTypeDefs,
            S3TypeDefs,
            ArgumentTypeDefs,
            ArgumentUpVotesTypeDefs
        ],
        resolvers: {
            ...AuthUserResolvers,
            ...UserResolvers,
            ...GroupResolvers,
            ...QuestionResolvers,
            ...VoteResolvers,
            ...InviteResolvers,
            ...S3Resolvers,
            ...ArgumentResolvers,
            ...ArgumentUpVotesResolvers,
            Query: {
                ...AuthUserResolvers.Query,
                ...UserResolvers.Query,
                ...GroupResolvers.Query,
                ...QuestionResolvers.Query,
                ...VoteResolvers.Query,
                ...InviteResolvers.Query,
                // ...S3Resolvers.Query
                ...ArgumentResolvers.Query,
                ...ArgumentUpVotesResolvers.Query
            },
            Mutation: {
                ...AuthUserResolvers.Mutation,
                ...UserResolvers.Mutation,
                ...GroupResolvers.Mutation,
                ...QuestionResolvers.Mutation,
                ...VoteResolvers.Mutation,
                ...InviteResolvers.Mutation,
                ...S3Resolvers.Mutation,
                ...ArgumentResolvers.Mutation,
                ...ArgumentUpVotesResolvers.Mutation
            }
        },
        context: async ({ req, event }) => {
            const token = req?.headers.authorization || event?.headers.authorization || event?.headers.Authorization || null;

            const AuthUser = !!token && await DBConnection.collection("Users")
                .findOne({ 'Auth0User.sub': token });

            return { AuthUser, mongoDB: DBConnection };
        },
    });
    return server;
};

