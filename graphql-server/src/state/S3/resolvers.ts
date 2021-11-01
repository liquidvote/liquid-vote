import { ObjectId } from 'mongodb';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import * as fs from 'fs';

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
        }
    },
};

// export const UploadWebImage = async (_source, {
//     imageUrl, imageType
// }, { mongoDB, AuthUser }) => {

//     const file = imageUrl;
//     const fileStream = fs.createReadStream(file);

//     const Key = `avatars/${((Date.now()) + parseInt(Math.random() * 100 as any))}.${imageType}`;

//     const command = new PutObjectCommand({
//         Bucket: 'images.liquid-vote.com',
//         Key,
//         Body: fileStream
//     });

//     const response = await s3Client.send(command);
// };