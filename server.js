const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// SPA 폴백: 모든 경로에서 index.html 반환
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[daily-log] 서버 실행 중: http://localhost:${PORT}`);
});
