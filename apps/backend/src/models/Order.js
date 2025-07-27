// =======================================================
// 파일: apps/backend/src/models/Order.js
// 역할: '주문' 정보를 어떤 형태로 저장할지 정의하는 설계도입니다.
// =======================================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // 주문 내역 (어떤 상품을 몇 개 주문했는지)
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
  }],
  // 총 주문 금액
  totalPrice: { type: Number, required: true },
  // 주문 시각 (기본값: 현재 시각)
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
