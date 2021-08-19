import { ApolloServer, gql } from "apollo-server";
const MongoClient = require("mongodb").MongoClient;
const AWS = require("aws-sdk");

const atlasCredentials = require("../credentials/atlas-credentials.json");
import { BookTypeDefs, BookResolvers } from "./state/BooksDemo";
import { AuthUserTypeDefs, AuthUserResolvers } from "./state/AuthUser";
import { UserTypeDefs, UserResolvers } from "./state/Users";
import { GroupTypeDefs, GroupResolvers } from "./state/Groups";
import { QuestionTypeDefs, QuestionResolvers } from "./state/Questions";
import { VoteTypeDefs, VoteResolvers } from "./state/Votes";
import { InviteTypeDefs, InviteResolvers } from "./state/Invites";

AWS.config.loadFromPath("./credentials/aws-credentials.json");
AWS.config.update({ region: "eu-west-1" });

const mongoClient = new MongoClient(
    `mongodb+srv://${atlasCredentials.username}:${atlasCredentials.password}@aiaiaiaminhavida.oobyz.mongodb.net/Enron?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

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

mongoClient.connect(async (err) => {
    const mongoDB = mongoClient.db("LiquidVote");
  
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
        context: async ({ req }) => {
            const token = req.headers.authorization || null;

            const AuthUser = token && await mongoDB.collection("Users")
                .findOne({ 'Auth0User.sub': token });

            // console.log({ ContextAuthUser: AuthUser });

            return { AuthUser, mongoDB, AWS };
        },
    });

    // The `listen` method launches a web server.
    server.listen().then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
});
