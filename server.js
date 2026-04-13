const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// 사진/폰트/이미지: 30일 캐시 (내용이 바뀌지 않는 정적 에셋)
app.use('/photos', express.static(path.join(__dirname, 'dist', 'photos'), {
  maxAge: '30d',
  immutable: true,
}))
app.use('/fonts', express.static(path.join(__dirname, 'dist', 'fonts'), {
  maxAge: '30d',
  immutable: true,
}))
app.use('/images', express.static(path.join(__dirname, 'dist', 'images'), {
  maxAge: '30d',
  immutable: true,
}))

// JS/CSS 번들: 1년 캐시 (Vite가 콘텐츠 해시로 파일명 관리)
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), {
  maxAge: '1y',
  immutable: true,
}))

// HTML: 캐시 없음 (항상 최신 버전 확인)
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: 0,
  etag: true,
}))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`[daily-log] 서버 실행 중: http://localhost:${PORT}`)
})
