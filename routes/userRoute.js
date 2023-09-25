const express = require("express");
const user = express();

const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');

user.use(bodyParser.urlencoded({ extended:true }));
user.use(express.static(path.resolve(__dirname, 'public')));

const storage=multer.diskStorage({
    destination:(req, file,cb)=>{
        cb(null,'./public/uploads')
    },
    filenames:(req,file,cb)=>{
        cb(null,file.originalname);
    }
})

const upload = multer({storage:storage});

const storage1 = multer.memoryStorage();
const upload1 = multer({ storage1 });

const userController = require('../controllers/userController')


user.post('/importUser',upload.single('file'),userController.importUser);
user.post('/upload', upload1.single('imageZip'), userController.uploadImage);

module.exports = user;