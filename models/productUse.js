const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: String,
    value: String,
    updateAt: {type : Date, default: Date.now}
})
module.exports = mongoose.model('Product',ProductSchema);