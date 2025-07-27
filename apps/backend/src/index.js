require('dotenv').config(); // ✅ 1. 파일 최상단에 이 코드를 추가합니다.
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = 4000;

// ✅ 2. 이제 코드에서 직접 주소를 쓰는 대신, process.env에서 값을 불러옵니다.
// process.env.MONGO_URI는 .env 파일에 있는 MONGO_URI 값을 가리킵니다.
const MONGO_URI = process.env.MONGO_URI;

// 만약 MONGO_URI가 없다면 에러를 발생시켜 서버 실행을 중지합니다.
if (!MONGO_URI) {
  console.error('❌ 에러: MONGO_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1); // 프로세스 종료
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB에 성공적으로 연결되었습니다.'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// ... (나머지 코드는 이전과 동일합니다) ...
app.use(cors()); 
app.use(express.json());

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: '상품을 불러오는 중 오류가 발생했습니다.' });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, price, imageUrl, category } = req.body;
  const product = new Product({ name, price, imageUrl, category });
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: '상품 추가 중 오류가 발생했습니다.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    await product.deleteOne();
    res.json({ message: '상품이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '상품 삭제 중 오류가 발생했습니다.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
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

app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
