const { ApolloServer, gql } = require('apollo-server-lambda');
const MongoClient = require("mongodb").MongoClient;

const atlasCredentials = require("../credentials/atlas-credentials.json");

const mongoClient = new MongoClient(
    `mongodb+srv://${atlasCredentials.username}:${atlasCredentials.password}@aiaiaiaminhavida.oobyz.mongodb.net/Enron?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
    },
};

// const LiquidVoteDB = (mongoClient.connect()).db("LiquidVote");

// const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//     playground: {
//         endpoint: "/dev/graphql"
//     }
// });

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

const createHandler = async () => {
    const DBConnection = (await getDBConnection());
    const server = new ApolloServer({
        typeDefs,
        resolvers
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

    createHandler().then(handler => handler(event, context, callback));
};



// server.createHandler({
//     cors: {
//         origin: '*',
//         credentials: true,
//     },
// });