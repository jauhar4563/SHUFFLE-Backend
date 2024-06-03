"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       let dest: string='';
//       console.log("multer");
//       if (file.mimetype.startsWith('image/')) {
//         dest = 'src/public/chat/images/';
//         console.log(file);
//         console.log(dest)
//       } else if (file.mimetype.startsWith('video/')) {
//         dest = 'src/public/chat/videos/';
//         console.log(file);
//         console.log(dest)
//       } else if(file.mimetype.startsWith('audio/')) {
//         dest = 'src/public/chat/audios/';
//         console.log(file)
//       }else{
//         // console.log(file)
//       }
//       cb(null, dest);
//     },  
//     filename: (req, file, cb) => {
//       cb(null,file.originalname);
//     },
// });
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage: storage });
