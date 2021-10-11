const { ApolloServer, gql } = require('apollo-server');

import { configServer } from "./server";

configServer({ ApolloServer, gql }).then((server: any) =>
    server.listen(3000).then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    })
);
