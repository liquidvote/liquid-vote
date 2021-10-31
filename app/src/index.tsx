import React, { FunctionComponent, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from "@auth0/auth0-react";
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
// import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from '@apollo/client/link/context';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import localforage from "localforage";
import { useAuth0 } from "@auth0/auth0-react";
import env from '@env';

import { AUTH_USER, AUTH_USER_LOGGEDIN } from '@state/AuthUser/typeDefs';
import App from './App';
import './index.sass';

const AppolloAppWrapper: FunctionComponent<{}> = ({ }) => {

    const { user, isLoading } = useAuth0();

    const httpLink = createHttpLink({
        uri: env.graphql,
    });

    const cache = new InMemoryCache({
        typePolicies: {
            Group: {
                keyFields: [
                    "handle"
                ],
                fields: {
                    representativeRelation: {
                        read(_, { args, toReference }) {
                            return toReference({
                                __typename: 'UserRepresentativeGroupRelation',
                                groupId: args?.groupId,
                                representativeId: args?.representativeId,
                                representeeId: args?.representeeId,
                            });
                        }
                    },
                }
            },
            // User: {
            //     keyFields: ["handle"],
            // },
            // Question: {
            //     keyFields: [
            //         "questionText",
            //         "groupChannel", ["group"]
            //     ],
            // },
            UserRepresentativeGroupRelation: {
                keyFields: ["groupId", "representativeId", "representeeId"],
            },
            GroupMemberRelation: {
                keyFields: ["groupId", "userId"],
            },
            // Vote: {
            //     keyFields: ["_id"]
            // },
        },
    });

    // TODO: await before instantiating ApolloClient, else queries might run before the cache is persisted
    // persistCache({
    //     cache,
    //     storage: new LocalStorageWrapper(window.localStorage),
    // });

    const client = new ApolloClient({
        link: httpLink,
        credentials: 'include',
        cache,
        connectToDevTools: true
    });

    useEffect(() => {
        if (user) {
            const login = async () => {
                const authLink = await setContext((_, { headers }) => {
                    return {
                        headers: {
                            ...headers,
                            authorization: user?.sub,
                        }
                    }
                });
                await client.setLink(authLink.concat(httpLink));
                // TODO: perhaps there's a way to `reFetchObservableQueries` reacting to `setLink` instead of using a random setTimeout
                await client.mutate({
                    mutation: AUTH_USER_LOGGEDIN,
                    variables: { Auth0User: user }
                }).then(() => client.reFetchObservableQueries());
                await setTimeout(async () => await client.reFetchObservableQueries(), 1000);
            }
            login();
        } else {
            client.setLink(httpLink);
        }
    }, [user]);

    return (
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    );
}

const AuthWrapper: FunctionComponent<{}> = ({ }) => {
    return (
        <Auth0Provider
            domain="dev-pt9y9sro.eu.auth0.com"
            clientId="IcSZA266f1Ec3Ky6jImuLKvuqY0xlj7v"
            redirectUri={window.location.origin}
        >
            <AppolloAppWrapper />
        </Auth0Provider>
    );
};

ReactDOM.render(<AuthWrapper />, document.getElementById('app'));
