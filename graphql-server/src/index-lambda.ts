const { ApolloServer, gql } = require('apollo-server-lambda');
const Sentry = require("@sentry/serverless");

Sentry.AWSLambda.init({
    dsn: "https://9af61052682a4b4c93b0c78026b22624@o1069562.ingest.sentry.io/6722028",
  
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });

import { configServer } from "./server";

let counter = 0;
exports.graphqlHandler = Sentry.AWSLambda.wrapHandler((event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    counter++
    console.log(counter);

    configServer({ ApolloServer, gql }).then((server: any) => server.createHandler({
        cors: {
            origin: '*',
            credentials: true,
        },
    })).then((handler: any) => handler(event, context, callback));
});
