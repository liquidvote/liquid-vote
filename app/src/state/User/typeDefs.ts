import { gql, useMutation } from '@apollo/client';

export const USER = gql`
  query($handle: String!) {
    User(handle: $handle)
  }
`;

export const EDIT_USER = gql`
  mutation ($User: JSON!) {
    editUser(User: $User)
  }
`;