const mongoose = require('mongoose');

const savedProductSchema = new mongoose.Schema({
    id: Number,
    name: String,
    image_thumb_url: String
});

module.exports = mongoose.model( 'products', savedProductSchema );
