var mongoose = require('mongoose');

var itemVariationSchema = new mongoose.Schema({
    itemId:{
        type: mongoose.Schema.Types.ObjectId,
    ref: 'Item' 
    },
    size:{
        type:String
    },
    diamond:[{
        size: { type: String },
        quality: { type: Number },
    }],
    stone:[{
        size: { type: String },
        quality: { type: Number },
    }]
    
});
module.exports = mongoose.model('itemVariation',itemVariationSchema);