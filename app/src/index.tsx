import React, { FunctionComponent, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from "@auth0/auth0-react";
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
// import { InMemoryCache } from "apollo-cache-inmemory";
import { setContext } from '@apollo/client/link/context';
import { persistCache } from 'apollo-cache-persist';
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

    const client = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache()
    });

    useEffect(() => {
        if (user) {
            const authLink = setContext((_, { headers }) => {
                return {
                    headers: {
                        ...headers,
                        authorization: user?.sub,
                    }
                }
            });
            client.setLink(authLink.concat(httpLink));
            client.mutate({ mutation: AUTH_USER_LOGGEDIN, variables: { Auth0User: user } });
            const q = client.readQuery({ query: AUTH_USER });

            console.log({ q });
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
