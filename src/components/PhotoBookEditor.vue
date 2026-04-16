<template>
  <div class="pbe" ref="wrapper">

    <!-- Loading -->
    <div v-if="loading" class="pbe-loading">
      <div class="pbe-spinner"></div>
      <p class="pbe-loading-text">포토북 준비 중...</p>
    </div>

    <!-- Canvas -->
    <div class="pbe-canvas-area" v-show="!loading">
      <canvas ref="canvas"></canvas>
    </div>

    <!-- Navigation -->
    <div class="pbe-nav" v-show="!loading">
      <button class="pbe-nav-btn" :disabled="currentPage === 0" @click="changePage(-1)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <div class="pbe-nav-center">
        <span class="pbe-page-label">{{ pageLabel }}</span>
        <div class="pbe-dots">
          <span
            v-for="i in dotCount" :key="i"
            class="pbe-dot"
            :class="{ active: isDotActive(i - 1) }"
            @click="jumpToPage(i - 1)"
          />
        </div>
      </div>
      <button class="pbe-nav-btn" :disabled="currentPage >= totalPages - 1" @click="changePage(1)">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>

  </div>
</template>

<script>
import { store } from '../store'

const FABRIC_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js'
const GRAD_BLUE   = '#F2A8C0'  // 연한 벚꽃 핑크
const GRAD_PURPLE = '#FAD4A8'  // 연한 봄 살구

function loadFabricJS() {
  return new Promise((resolve, reject) => {
    if (window.fabric) { resolve(); return }
    const s = document.createElement('script')
    s.src = FABRIC_CDN
    s.onload  = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

function loadImage(url) {
  return new Promise((resolve) => {
    window.fabric.Image.fromURL(
      url,
      img => resolve(img),
      { crossOrigin: 'anonymous' }
    )
  })
}

function hGradient(cw, c1, c2) {
  return new window.fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: { x1: 0, y1: 0, x2: cw, y2: 0 },
    colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }],
  })
}

function diagGradient(cw, ch, c1, c2) {
  return new window.fabric.Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: { x1: 0, y1: 0, x2: cw, y2: ch },
    colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }],
  })
}

function mkRect(opts) {
  return new window.fabric.Rect({ selectable: false, evented: false, ...opts })
}

function mkText(str, opts) {
  return new window.fabric.Text(String(str), {
    fontFamily: "'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif",
    selectable: false, evented: false,
    ...opts,
  })
}

function mkCircle(opts) {
  return new window.fabric.Circle({ selectable: false, evented: false, ...opts })
}

function mkLine(pts, opts) {
  return new window.fabric.Line(pts, { selectable: false, evented: false, ...opts })
}

export default {
  name: 'PhotoBookEditor',
  data() {
    return {
      store,
      loading: true,
      fc: null,
      cw: 0,
      ch: 0,
      currentPage: 0,
    }
  },
  computed: {
    photoRecords() {
      return [...store.records]
        .filter(r => r.thumbnail)
        .sort((a, b) => a.date.localeCompare(b.date))
    },
    pages() {
      const result = [{ type: 'cover' }]
      const recs = this.photoRecords
      let i = 0
      while (i < recs.length) {
        const rem = recs.length - i
        // 3~4장씩 분배: 나머지가 4 이하면 그대로, rem%3===1이면 4장 묶어 외줄 1장 방지
        const size = rem <= 4 ? rem : (rem % 3 === 1 ? 4 : 3)
        result.push({ type: 'content', records: recs.slice(i, i + size) })
        i += size
      }
      result.push({ type: 'end' })
      return result
    },
    totalPages() { return this.pages.length },
    dotCount()   { return Math.min(this.totalPages, 9) },
    pageLabel() {
      if (this.currentPage === 0) return '표지'
      if (this.currentPage === this.totalPages - 1) return '마지막 장'
      return `${this.currentPage} / ${this.totalPages - 2}`
    },
  },
  async mounted() {
    await loadFabricJS()
    this.initCanvas()
    await this.renderPage(0)
    this.loading = false
  },
  beforeDestroy() {
    if (this.fc) this.fc.dispose()
  },
  methods: {
    initCanvas() {
      const wrapW = this.$refs.wrapper.clientWidth
      const cw = wrapW - 32
      const ch = Math.round(cw * 1.42)
      this.cw = cw
      this.ch = ch
      this.fc = new window.fabric.Canvas(this.$refs.canvas, {
        width: cw, height: ch,
        selection: false,
        preserveObjectStacking: true,
      })
    },

    isDotActive(i) {
      const ratio = (this.currentPage) / (this.totalPages - 1)
      const dot   = Math.round(ratio * (this.dotCount - 1))
      return i === dot
    },

    async jumpToPage(dotIdx) {
      const ratio = dotIdx / (this.dotCount - 1)
      const page  = Math.round(ratio * (this.totalPages - 1))
      await this.goToPage(page)
    },

    async changePage(dir) {
      const next = this.currentPage + dir
      if (next < 0 || next >= this.totalPages) return
      await this.goToPage(next)
    },

    async goToPage(n) {
      this.loading = true
      this.currentPage = n
      await this.renderPage(n)
      this.loading = false
    },

    async renderPage(idx) {
      const { fc } = this
      fc.clear()
      const page = this.pages[idx]
      if      (page.type === 'cover')   await this.drawCover()
      else if (page.type === 'content') await this.drawContent(page.records)
      else                              await this.drawEnd()
      fc.renderAll()
    },

    /* ── Cover ─────────────────────────────── */
    async drawCover() {
      const { fc, cw, ch } = this

      // 배경 그라데이션
      fc.add(mkRect({ left: 0, top: 0, width: cw, height: ch, fill: diagGradient(cw, ch, GRAD_BLUE, GRAD_PURPLE) }))

      // 타이틀: "2026's Album" 한 줄
      const outerPad = 20
      const titleY = 48
      fc.add(mkText("2026's Album", {
        left: outerPad, top: titleY,
        fontSize: 26, fontWeight: '800', fill: 'rgba(110,35,55,0.88)',
        originX: 'left', originY: 'center',
      }))

      // 2×2 사진 그리드
      const gap = 10          // 사진 사이 간격
      const colOffset = 20    // 2열을 1열보다 아래로 내리는 오프셋
      const gridTop = titleY + 28
      const cellW = Math.floor((cw - outerPad * 2 - gap) / 2)
      const cellH = Math.floor((ch - gridTop - outerPad - gap - colOffset) / 2)

      const sample = this.photoRecords.slice(0, 4)
      const col2X = outerPad + cellW + gap
      const gridPositions = [
        { x: outerPad, y: gridTop },
        { x: col2X,    y: gridTop + colOffset },
        { x: outerPad, y: gridTop + cellH + gap },
        { x: col2X,    y: gridTop + colOffset + cellH + gap },
      ]

      for (let i = 0; i < Math.min(sample.length, 4); i++) {
        const { x, y } = gridPositions[i]
        try {
          const img = await loadImage(sample[i].thumbnail)
          const scale = Math.max(cellW / img.width, cellH / img.height)
          const scaledW = img.width * scale
          const scaledH = img.height * scale

          // 절대좌표로 위치 설정 → Group이 내부 상대좌표로 재계산
          img.set({
            left: x + (cellW - scaledW) / 2,
            top:  y + (cellH - scaledH) / 2,
            scaleX: scale,
            scaleY: scale,
          })

          const border = new window.fabric.Rect({
            left: x, top: y, width: cellW, height: cellH,
            fill: 'transparent',
            stroke: 'rgba(255,255,255,0.40)',
            strokeWidth: 1.5,
            rx: 6, ry: 6,
          })

          // clipPath는 Group 중심 기준 상대좌표
          const clip = new window.fabric.Rect({
            width: cellW, height: cellH,
            originX: 'center', originY: 'center',
            rx: 6, ry: 6,
          })

          const group = new window.fabric.Group([img, border], {
            clipPath: clip,
            selectable: true,
            hoverCursor: 'move',
          })
          fc.add(group)
        } catch (e) { /* 사진 없으면 스킵 */ }
      }
    },

    /* ── Content page ───────────────────────── */
    async drawContent(records) {
      const { fc, cw, ch } = this

      // 표지와 동일한 대각선 그라데이션 배경
      fc.add(mkRect({ left: 0, top: 0, width: cw, height: ch, fill: diagGradient(cw, ch, GRAD_BLUE, GRAD_PURPLE) }))

      // 표지와 동일한 장식 원
      ;[
        { r: 90,  l: -35, t: -35, o: 0.09 },
        { r: 52,  l: cw - 42, t: 14, o: 0.10 },
        { r: 118, l: cw - 72, t: ch - 96, o: 0.07 },
        { r: 58,  l: 8, t: ch - 76, o: 0.09 },
        { r: 36,  l: cw * 0.40, t: ch * 0.08, o: 0.06 },
      ].forEach(({ r, l, t, o }) =>
        fc.add(mkCircle({ radius: r, left: l, top: t, fill: `rgba(255,255,255,${o * 1.8})`, stroke: '' }))
      )

      // 월 표시 (흰색)
      const d = new Date(records[0].date)
      const monthStr = `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}`
      fc.add(mkText(monthStr, {
        left: cw / 2, top: 22,
        fontSize: 13, fontWeight: '600', fill: 'rgba(110,35,55,0.65)',
        originX: 'center', originY: 'center',
      }))

      // 시드 기반 결정론적 랜덤 (같은 페이지 = 같은 레이아웃)
      const seed = records.reduce((s, r) => s + (r.date ? parseInt(r.date.replace(/-/g, '')) : 0), 0)
      const rng = (i) => {
        const x = Math.sin((seed + i) * 9301 + 49297) * 233280
        return Math.abs(x - Math.floor(x))
      }

      const n = Math.min(records.length, 4)
      let layouts

      if (n >= 4) {
        // 4장: 상단 2장 + 하단 2장, 서로 살짝 겹침
        const pw = Math.round(cw * 0.54)
        const ph = Math.round(ch * 0.33)
        const baseRots = [-8, 5, -5, 7]
        layouts = [
          { x: cw * 0.02, y: ch * 0.11, maxW: pw, maxH: ph, rot: baseRots[0] + rng(0) * 4 - 2 },
          { x: cw * 0.40, y: ch * 0.13, maxW: pw, maxH: ph, rot: baseRots[1] + rng(1) * 4 - 2 },
          { x: cw * 0.04, y: ch * 0.52, maxW: pw, maxH: ph, rot: baseRots[2] + rng(2) * 4 - 2 },
          { x: cw * 0.38, y: ch * 0.55, maxW: pw, maxH: ph, rot: baseRots[3] + rng(3) * 4 - 2 },
        ]
      } else if (n === 3) {
        // 3장: 좌상단 → 우중단 → 하단 캐스케이드 겹침
        const baseRots = [-8, 5, -3]
        layouts = [
          { x: cw * 0.02, y: ch * 0.11, maxW: cw * 0.63, maxH: ch * 0.40, rot: baseRots[0] + rng(0) * 4 - 2 },
          { x: cw * 0.30, y: ch * 0.25, maxW: cw * 0.60, maxH: ch * 0.37, rot: baseRots[1] + rng(1) * 4 - 2 },
          { x: cw * 0.07, y: ch * 0.52, maxW: cw * 0.73, maxH: ch * 0.38, rot: baseRots[2] + rng(2) * 4 - 2 },
        ]
      } else if (n === 2) {
        layouts = [
          { x: cw * 0.02, y: ch * 0.11, maxW: cw - 32, maxH: ch * 0.40, rot: -2 + rng(0) * 2 - 1 },
          { x: cw * 0.12, y: ch * 0.54, maxW: cw * 0.68, maxH: ch * 0.36, rot:  2 + rng(1) * 2 - 1 },
        ]
      } else {
        layouts = [{ x: 16, y: 50, maxW: cw - 32, maxH: ch * 0.72, rot: -1 + rng(0) * 2 - 1 }]
      }

      // 드로우 순서를 섞어 랜덤 스택(겹침) 효과
      const drawOrder = Array.from({ length: n }, (_, i) => i)
      for (let s = n - 1; s > 0; s--) {
        const j = Math.floor(rng(s + 20) * (s + 1))
        ;[drawOrder[s], drawOrder[j]] = [drawOrder[j], drawOrder[s]]
      }

      for (const i of drawOrder) {
        const { x, y, maxW, maxH, rot } = layouts[i]
        await this.drawPolaroid(fc, records[i], x, y, maxW, maxH, rot, false)
      }
    },

    /* ── Polaroid helper ────────────────────── */
    async drawPolaroid(fc, record, x, y, maxW, maxH, rot, showCaption) {
      let img
      try {
        img = await loadImage(record.thumbnail)
      } catch (e) { return }

      const scaleX = maxW / img.width
      const scaleY = (showCaption ? maxH * 0.78 : maxH) / img.height
      const scale  = Math.min(scaleX, scaleY)
      const pw = Math.round(img.width  * scale)
      const ph = Math.round(img.height * scale)
      const pad = 8
      const capH = showCaption ? 44 : 0
      const frameW = pw + pad * 2
      const frameH = ph + pad + capH + 4

      // Group contents (relative to group center after Fabric auto-calc)
      const frame = mkRect({
        left: 0, top: 0,
        width: frameW, height: frameH,
        fill: '#ffffff',
        shadow: new window.fabric.Shadow({ color: 'rgba(200,80,120,0.18)', blur: 18, offsetX: 2, offsetY: 5 }),
        rx: 3, ry: 3,
      })
      img.set({ left: pad, top: pad, scaleX: scale, scaleY: scale })

      const objects = [frame, img]

      if (showCaption && record.date) {
        const dateStr = record.date.replace(/^2026-/, '').replace('-', '/') + '  ' + (record.time || '')
        objects.push(mkText(dateStr, {
          left: pad, top: pad + ph + 6,
          fontSize: 9, fill: '#aaa', fontWeight: '400',
        }))
      }
      if (showCaption && record.location) {
        const loc = record.location.length > 16 ? record.location.slice(0, 16) + '…' : record.location
        objects.push(mkText('📍 ' + loc, {
          left: pad, top: pad + ph + 19,
          fontSize: 10, fill: '#555', fontWeight: '600',
        }))
      }

      const group = new window.fabric.Group(objects, {
        left: x,
        top: y,
        angle: rot,
        selectable: true,
        hoverCursor: 'move',
      })
      fc.add(group)
    },

    /* ── End page ───────────────────────────── */
    async drawEnd() {
      const { fc, cw, ch } = this

      // 표지와 동일한 대각선 그라데이션 배경
      fc.add(mkRect({ left: 0, top: 0, width: cw, height: ch, fill: diagGradient(cw, ch, GRAD_BLUE, GRAD_PURPLE) }))

      // 표지와 동일한 장식 원
      ;[
        { r: 100, l: -40, t: -40, o: 0.10 },
        { r: 60,  l: cw - 50, t: 20, o: 0.12 },
        { r: 140, l: cw - 80, t: ch - 110, o: 0.08 },
        { r: 70,  l: 10, t: ch - 90, o: 0.10 },
        { r: 40,  l: cw * 0.4, t: ch * 0.12, o: 0.07 },
      ].forEach(({ r, l, t, o }) =>
        fc.add(mkCircle({ radius: r, left: l, top: t, fill: `rgba(255,255,255,${o * 1.8})`, stroke: '' }))
      )

      fc.add(mkText('계속될', {
        left: cw / 2, top: ch * 0.35,
        fontSize: 34, fontWeight: '800', fill: 'rgba(110,35,55,0.90)',
        originX: 'center', originY: 'center',
      }))
      fc.add(mkText('나의 이야기', {
        left: cw / 2, top: ch * 0.35 + 46,
        fontSize: 34, fontWeight: '800', fill: 'rgba(110,35,55,0.70)',
        originX: 'center', originY: 'center',
      }))

      fc.add(mkLine([cw * 0.3, ch * 0.35 + 78, cw * 0.7, ch * 0.35 + 78], {
        stroke: 'rgba(110,35,55,0.20)', strokeWidth: 1,
      }))

      fc.add(mkText('Golden Record', {
        left: cw / 2, top: ch * 0.35 + 100,
        fontSize: 13, fontWeight: '500', fill: 'rgba(110,35,55,0.45)',
        originX: 'center', originY: 'center',
      }))

      // 마지막 사진 폴라로이드
      const last = this.photoRecords[this.photoRecords.length - 1]
      if (last) {
        const sz = Math.round(cw * 0.38)
        await this.drawPolaroid(fc, last, cw / 2 - sz / 2 - 12, ch * 0.60, sz, sz, -3, false)
      }
    },
  },
}
</script>

<style scoped>
.pbe {
  display: flex; flex-direction: column;
  align-items: center; gap: 16px;
  padding: 8px 16px 20px;
}

/* ── Canvas ── */
.pbe-canvas-area canvas {
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(212,97,138,0.10),
    0 12px 32px rgba(232,160,96,0.18);
  display: block;
}

/* ── Loading ── */
.pbe-loading {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 14px; height: 300px; width: 100%;
}
.pbe-spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(212,97,138,0.2);
  border-top-color: #D4618A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pbe-loading-text {
  font-size: 13px; color: rgba(212,97,138,0.7); font-weight: 500;
}

/* ── Nav ── */
.pbe-nav {
  width: 100%; display: flex;
  align-items: center; justify-content: space-between;
  gap: 8px;
}
.pbe-nav-btn {
  width: 38px; height: 38px; border-radius: 50%;
  border: 1.5px solid rgba(212,97,138,0.2);
  background: rgba(255,255,255,0.9);
  color: #555; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.pbe-nav-btn:not(:disabled):active {
  background: linear-gradient(90deg, #D4618A, #E8A060);
  color: #fff; border-color: transparent;
}
.pbe-nav-btn:disabled { opacity: 0.3; cursor: default; }

.pbe-nav-center {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 6px;
}
.pbe-page-label {
  font-size: 12px; font-weight: 600;
  background: linear-gradient(90deg, #D4618A, #E8A060);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pbe-dots {
  display: flex; gap: 5px;
}
.pbe-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #d8d8d8;
  transition: width 0.3s, background 0.3s, border-radius 0.3s;
  cursor: pointer;
}
.pbe-dot.active {
  width: 16px; border-radius: 3px;
  background: linear-gradient(90deg, #D4618A, #E8A060);
}
</style>
