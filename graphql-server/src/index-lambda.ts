const { ApolloServer, gql } = require('apollo-server-lambda');

import { configServer } from "./server";

let counter = 0;
exports.graphqlHandler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    counter++
    console.log(counter);

    configServer({ ApolloServer, gql }).then((server: any) => server.createHandler({
        cors: {
            origin: '*',
            credentials: true,
        },
    })).then((handler: any) => handler(event, context, callback));
};
