"use strict";
<<<<<<< HEAD
=======
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
>>>>>>> origin/master
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Upload = void 0;
<<<<<<< HEAD
const client_s3_1 = require("@aws-sdk/client-s3");
const bucketName = process.env.BUCKET_NAME;
const region = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_KEY;
=======
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const client_s3_1 = require("@aws-sdk/client-s3");
const bucketName = process.env.BUCKET_NAME;
const region = process.env.REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
>>>>>>> origin/master
const s3Client = new client_s3_1.S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});
const s3Upload = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    yield s3Client.send(new client_s3_1.PutObjectCommand(params));
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${file.originalname}`;
<<<<<<< HEAD
=======
    console.log(url, 'In s3 bucket');
>>>>>>> origin/master
    return url;
});
exports.s3Upload = s3Upload;
