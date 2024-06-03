import multer from "multer"

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

const storage = multer.memoryStorage();

export const upload = multer({ storage: storage });

