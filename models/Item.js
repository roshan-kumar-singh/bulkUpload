var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    code:{
        type:String
    },
    name:{
        type:String
    },
    description:{
        type:String
    },
    shopeCode:{
        type:String
    },
    images: [{ type: Map, of: String }],
    
});
module.exports = mongoose.model('item',itemSchema);