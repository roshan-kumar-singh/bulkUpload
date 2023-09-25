var mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/test");

// mongoose.connect('mongodb+srv://Emagz:EmagzWorldWide@cluster0.gzd8yd0.mongodb.net/?retryWrites=true&w=majority').then(
//   () => console.log('db is connected..')
// ).catch(err => console.log(err));

const express = require('express');
const app = express();

var userRouter = require('./routes/userRoute');
app.use('/',userRouter);

app.listen(4000,function(){
    console.log('app is running');
})