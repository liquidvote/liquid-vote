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
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

import { AUTH_USER, AUTH_USER_LOGGEDIN } from '@state/AuthUser/typeDefs';
import App from './App';
import './index.sass';

console.log({
    env
});

if (env?.environment === "production") {
    Sentry.init({
        dsn: "https://4a194e29ed7d4f55ab8dd0d51fe7b701@o1069562.ingest.sentry.io/6064301",
        integrations: [new Integrations.BrowserTracing({
            tracingOrigins: ["::1"],
        })],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
                console.log('SW registered: ', registration);
            }).catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
        });
    }
}

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
            useRefreshTokens={true}
            cacheLocation="localstorage"
        >
            <AppolloAppWrapper />
        </Auth0Provider>
    );
};

ReactDOM.render(<AuthWrapper />, document.getElementById('app'));
