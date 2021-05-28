import { gql, useMutation } from '@apollo/client';

export const AUTH_USER_LOGGEDIN = gql`
  mutation ($Auth0User: JSON!) {
    authUserLoggedIn(Auth0User: $Auth0User)
  }
`;