// =======================================================
// 파일: apps/backend/src/index.js (기존 파일 수정)
// 역할: 실제 서버를 구동하고 API 요청을 처리하는 메인 파일입니다.
// =======================================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ✅ 1. 모델 불러오기: Product와 Order 모델을 인식시킵니다.
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = 4000;

// ✅ 2. 데이터베이스 연결
// 중요: 'YOUR_MONGODB_CONNECTION_STRING' 부분에 실제 MongoDB 주소를 넣어야 합니다.
const MONGO_URI = 'mongodb+srv://yonghun16:ehswnjas16@cluster0.cxp6bau.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB에 성공적으로 연결되었습니다.'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));


// 미들웨어 설정
app.use(cors()); 
app.use(express.json());


// ✅ 3. API 엔드포인트에서 모델 사용하기
// A. 모든 상품 목록을 가져오는 API
app.get('/api/products', async (req, res) => {
  try {
    // Product 모델을 사용해서 데이터베이스와 통신합니다.
    const products = await Product.find(); 
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: '상품을 불러오는 중 오류가 발생했습니다.' });
  }
});

// B. 새로운 주문을 생성하는 API
app.post('/api/orders', async (req, res) => {
  try {
    // Order 모델을 사용해서 새로운 주문을 만듭니다.
    const newOrder = new Order({
      items: req.body.items,
      totalPrice: req.body.totalPrice,
    });
    await newOrder.save(); 
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: '주문을 처리하는 중 오류가 발생했습니다.' });
  }
});


// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
