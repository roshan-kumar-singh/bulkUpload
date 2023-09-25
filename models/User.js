var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    mobile: {
        type:Number
    }
});
module.exports = mongoose.model('User',userSchema);