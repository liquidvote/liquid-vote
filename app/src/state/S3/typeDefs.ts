import { gql, useMutation } from '@apollo/client';

export const UPLOADURL = gql`
  mutation(
      $imageType: String!
    ) {
        UploadURL(
            imageType: $imageType
        ) {
            url
            command
        }
    }
`;