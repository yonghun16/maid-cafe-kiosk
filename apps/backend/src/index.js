const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = 4000;

// 중요: YOUR_MONGODB_CONNECTION_STRING을 실제 주소로 바꿔주세요.
const MONGO_URI = 'mongodb+srv://yonghun16:ehswnjas16@cluster0.cxp6bau.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB에 성공적으로 연결되었습니다.'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

app.use(cors()); 
app.use(express.json());

// --- 상품(Product) API ---
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

// --- 주문(Order) API ---
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
