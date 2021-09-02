import { ApolloServer, gql } from "apollo-server-lambda";//"apollo-server";
const MongoClient = require("mongodb").MongoClient;
// const AWS = require("aws-sdk");

const atlasCredentials = require("../credentials/atlas-credentials.json");
import { BookTypeDefs, BookResolvers } from "./state/BooksDemo";
import { AuthUserTypeDefs, AuthUserResolvers } from "./state/AuthUser";
import { UserTypeDefs, UserResolvers } from "./state/Users";
import { GroupTypeDefs, GroupResolvers } from "./state/Groups";
import { QuestionTypeDefs, QuestionResolvers } from "./state/Questions";
import { VoteTypeDefs, VoteResolvers } from "./state/Votes";
import { InviteTypeDefs, InviteResolvers } from "./state/Invites";

// AWS.config.loadFromPath("./credentials/aws-credentials.json");
// AWS.config.update({ region: "eu-west-1" });

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

// const s3 = new AWS.S3({
//     accessKeyId: awsCredentials.accessKeyId,
//     secretAccessKey: awsCredentials.secretAccessKey,
// });


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

const createHandler = async () => {
    const DBConnection = (await getDBConnection());
    const server = new ApolloServer({
        typeDefs: [
            QueryTypeDefs,
            BookTypeDefs,
            AuthUserTypeDefs,
            UserTypeDefs,
            GroupTypeDefs,
            QuestionTypeDefs,
            VoteTypeDefs,
            InviteTypeDefs
        ],
        resolvers: {
            ...BookResolvers,
            ...AuthUserResolvers,
            ...UserResolvers,
            ...GroupResolvers,
            ...QuestionResolvers,
            ...VoteResolvers,
            ...InviteResolvers,
            Query: {
                ...BookResolvers.Query,
                ...AuthUserResolvers.Query,
                ...UserResolvers.Query,
                ...GroupResolvers.Query,
                ...QuestionResolvers.Query,
                ...VoteResolvers.Query,
                ...InviteResolvers.Query
            },
            Mutation: {
                // ...BookResolvers.Mutation,
                ...AuthUserResolvers.Mutation,
                ...UserResolvers.Mutation,
                ...GroupResolvers.Mutation,
                ...QuestionResolvers.Mutation,
                ...VoteResolvers.Mutation,
                ...InviteResolvers.Mutation
            }
        },
        context: async ({ event }) => {
            const token = event.headers.authorization || event.headers.Authorization || null;

            const AuthUser = token && await DBConnection.collection("Users")
                .findOne({ 'Auth0User.sub': token });

            // console.log({ headers: event.headers, token, AuthUser });

            return { AuthUser, mongoDB: DBConnection, AWS: null };
        },
    });
    return server.createHandler({
        cors: {
            origin: '*',
            credentials: true,
        },
    });
};

let counter = 0;
exports.graphqlHandler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    counter++
    console.log(counter);

    createHandler().then((handler: any) => handler(event, context, callback));
};

