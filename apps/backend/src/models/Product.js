// =======================================================
// 파일: apps/backend/src/models/Product.js
// 역할: 데이터베이스에 '상품' 정보를 어떤 형태로 저장할지 정의하는 설계도입니다.
// =======================================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // name, price, imageUrl 등은 @repo/types의 Product 인터페이스와 일치시킵니다.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['coffee', 'ade', 'dessert'] // 카테고리는 이 세 가지 중 하나여야 합니다.
  },
});

// 다른 파일에서 이 설계도를 사용할 수 있도록 내보냅니다.
module.exports = mongoose.model('Product', productSchema);

