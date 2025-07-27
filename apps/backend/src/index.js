const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// 임시 테스트용 API
app.get('/api/test', (req, res) => {
  res.json({ message: "안녕하세요! 백엔드 서버입니다! 👋" });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
