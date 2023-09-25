var mongoose = require('mongoose');

var addressSchema = new mongoose.Schema({
    address:{
        type:String
    }
});
module.exports = mongoose.model('Address',addressSchema);