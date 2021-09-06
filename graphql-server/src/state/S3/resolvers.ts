import { ObjectId } from 'mongodb';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const awsCredentials = require("../../../credentials/aws-credentials.json");

const s3Client = new S3Client({
    credentials: { ...awsCredentials },
    region: 'eu-west-1'
});

export const S3Resolvers = {
    Query: {
    },
    Mutation: {
        UploadURL: async (_source, {
            imageType
        }, { mongoDB, AuthUser }) => {

            const Key = `avatars/${((Date.now()) + parseInt(Math.random() * 100 as any))}.${imageType}`;

            const command = new PutObjectCommand({
                Bucket: 'images.liquid-vote.com',
                Key,
                ContentType: `image/${imageType}`
            });
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

            return {
                url,
                command
            };
        },
    },
};