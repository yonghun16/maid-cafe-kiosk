const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['coffee', 'ade', 'dessert']
  },
});

module.exports = mongoose.model('Product', productSchema);
