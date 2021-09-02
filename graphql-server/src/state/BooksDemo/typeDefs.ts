import { gql } from "apollo-server-lambda";

export const BookTypeDefs = gql`
    extend type Query {
        books: [Book]
    }

    type Book {
        title: String
        author: String
    }
`;