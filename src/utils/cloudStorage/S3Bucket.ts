
import * as dotenv from "dotenv";

dotenv.config();

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";



const bucketName = process.env.BUCKET_NAME;
const region = process.env.REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

export const s3Upload = async (file: any) => {
    const params:any = {
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${file.originalname}`;

    return url;
};
