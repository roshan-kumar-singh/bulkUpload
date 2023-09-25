const mongoose = require('mongoose');


// Define a mongoose schema
const ImageSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String,
  });
  
module.exports = mongoose.model('Image', ImageSchema);