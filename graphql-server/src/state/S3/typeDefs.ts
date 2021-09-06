import { gql } from "apollo-server-lambda";

export const S3TypeDefs = gql`
    type UploadObject {
        url: JSON,
        command: JSON
    }

    # extend type Query {
    #     # UploadURL(imageType: String): UploadObject
    # }

    extend type Mutation {
        UploadURL(imageType: String): UploadObject
    }
`;
