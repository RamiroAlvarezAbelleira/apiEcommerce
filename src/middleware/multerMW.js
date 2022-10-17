const path = require('path');
const multer = require('multer');


function multerMW(folderName, fileSpec) { 
    
    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        folder = path.join(__dirname, '../../public/images/' + folderName);
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        let fileName = fileSpec + Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

return multer({storage});

}
module.exports = multerMW;