<template>
  <div class="mindmap-overlay" @click.self="$emit('close')">
    <div class="mindmap-container">

      <!-- 헤더 -->
      <div class="mindmap-header">
        <div class="mindmap-title-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="url(#hg)" stroke-width="2.2" stroke-linecap="round"
               stroke-linejoin="round" style="flex-shrink:0;overflow:visible">
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#146ef5"/>
                <stop offset="100%" stop-color="#8B5CF6"/>
              </linearGradient>
            </defs>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span class="mindmap-title">태그 마이닝맵</span>
        </div>
        <button class="mindmap-close" @click="$emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="#888" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="mindmap-toolbar">
        <span class="mindmap-desc">태그 연관도 기반 맥락 분석 · {{ totalTags }}개 태그</span>
        <div class="zoom-controls">
          <button class="zoom-btn" @click="zoomIn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="zoom-btn" @click="zoomFit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <button class="zoom-btn" @click="zoomOut">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>

      <!-- 마인드맵 캔버스 -->
      <div ref="mapEl" class="mindmap-canvas" />

      <!-- 범례 -->
      <div v-if="clusters.length" class="mindmap-legend">
        <div v-for="(c, i) in clusters" :key="i" class="legend-item">
          <span class="legend-dot" :style="{ background: clusterColors[i] }" />
          <span class="legend-label">{{ c.tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MindElixir from 'mind-elixir'
import 'mind-elixir/style.css'
import { store } from '../store'

const CLUSTER_COLORS = [
  '#146ef5',
  '#8B5CF6',
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  '#10b981',
]

export default {
  name: 'TagMindMap',
  data() {
    return {
      clusters: [],
      clusterColors: CLUSTER_COLORS,
      me: null,
    }
  },
  computed: {
    allRecords() {
      const all = [
        ...(store.records || []),
        ...(store.todayRecords || []),
      ]
      const seen = new Set()
      return all.filter(r => {
        if (seen.has(r.id)) return false
        seen.add(r.id)
        return true
      })
    },
    totalRecords() {
      return this.allRecords.length
    },
    totalTags() {
      const tags = new Set()
      for (const r of this.allRecords) {
        for (const t of (r.categoryTags || [])) tags.add(t)
      }
      return tags.size
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.buildAndRender()
    })
  },
  beforeDestroy() {
    if (this._cleanupDrag) this._cleanupDrag()
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler)
    if (this.me) {
      try { this.me.destroy && this.me.destroy() } catch (_) {}
    }
  },
  methods: {
    zoomIn() {
      if (!this.me) return
      try { this.me.scale(Math.min((this.me.scaleVal || 1) * 1.3, 3)) } catch (_) {}
    },
    zoomOut() {
      if (!this.me) return
      try { this.me.scale(Math.max((this.me.scaleVal || 1) / 1.3, 0.1)) } catch (_) {}
    },
    zoomFit() {
      if (!this.me) return
      try { this.me.scaleFit(); this.me.toCenter() } catch (_) {}
    },
    buildAndRender() {
      const records = this.allRecords
      if (!records.length) return

      // ── 1. 빈도 맵 & co-occurrence 행렬 ───────
      const freq = {}
      for (const r of records)
        for (const t of (r.categoryTags || [])) freq[t] = (freq[t] || 0) + 1
      if (!Object.keys(freq).length) return

      const cooc = {}
      const coKey = (a, b) => [a, b].sort().join('||')
      const getCooc = (a, b) => cooc[coKey(a, b)] || 0
      for (const r of records) {
        const tags = r.categoryTags || []
        for (let i = 0; i < tags.length; i++)
          for (let j = i + 1; j < tags.length; j++) {
            const k = coKey(tags[i], tags[j])
            cooc[k] = (cooc[k] || 0) + 1
          }
      }

      const allTags = Object.keys(freq)

      // ── 2. Union-Find 연결 컴포넌트 클러스터링 ─
      // co-occur하는 태그들을 같은 그룹으로 자동 묶음
      const parent = {}
      const find = (t) => { if (!parent[t]) parent[t] = t; return parent[t] === t ? t : (parent[t] = find(parent[t])) }
      const union = (a, b) => { parent[find(a)] = find(b) }

      for (const k of Object.keys(cooc)) {
        const [a, b] = k.split('||')
        union(a, b)
      }

      // 컴포넌트별로 태그 수집
      const compMap = {}
      for (const t of allTags) {
        const root = find(t)
        if (!compMap[root]) compMap[root] = []
        compMap[root].push(t)
      }

      // 각 컴포넌트 내부: 빈도 내림차순 정렬
      const components = Object.values(compMap)
        .map(tags => tags.sort((a, b) => freq[b] - freq[a]))
        .sort((a, b) => {
          // 컴포넌트 대표 빈도 (첫 태그 = 최고빈도)
          return freq[b[0]] - freq[a[0]]
        })

      // 상위 8개 컴포넌트 → 독립 클러스터
      // 나머지 → 빈도 유사한 클러스터에 병합
      const MAX_CLUSTERS = Math.min(8, components.length)
      const mainComps = components.slice(0, MAX_CLUSTERS)
      const extraComps = components.slice(MAX_CLUSTERS)

      // 남은 컴포넌트의 태그를 기존 클러스터에 순환 배분
      for (let i = 0; i < extraComps.length; i++) {
        mainComps[i % MAX_CLUSTERS].push(...extraComps[i])
      }

      this.clusters = mainComps.map(tags => ({ tag: tags[0], freq: freq[tags[0]] }))

      // ── 3. 각 클러스터 내 4단계 BFS 계층 트리 ─
      const maxFreq = Math.max(...Object.values(freq))
      const mkStyle = (t, color, level) => ({
        color,
        background: color + ['30', '20', '14', '0d'][Math.min(level, 3)],
        fontSize: Math.max(10, Math.round(13 - level * 1.2 + (freq[t] / maxFreq) * 4)) + 'px',
        fontWeight: freq[t] >= 3 ? '700' : freq[t] >= 2 ? '600' : '400',
      })

      // BFS: 해당 컴포넌트 내 태그들 간 co-occurrence 기반 4단계 트리 구성
      const buildTree = (compTags, color, clusterIdx) => {
        const center = compTags[0]  // 최고빈도 태그 = 루트
        const tagSet = new Set(compTags)
        const placed = new Set([center])

        // 레벨별 BFS
        const levelNodes = [[center]]  // level 0 = center (not rendered separately)
        for (let lvl = 0; lvl < 3; lvl++) {
          const nextLevel = []
          for (const p of levelNodes[lvl]) {
            // p와 co-occur하는 미배정 태그 (컴포넌트 내)
            const children = compTags
              .filter(t => !placed.has(t) && tagSet.has(t) && getCooc(p, t) > 0)
              .sort((a, b) => getCooc(p, b) - getCooc(p, a))
            for (const t of children) {
              if (!placed.has(t)) { placed.add(t); nextLevel.push(t) }
            }
          }
          levelNodes.push(nextLevel)
          if (nextLevel.length === 0) break
        }

        // 아직 미배정 태그 (co-occur 없이 같은 컴포넌트에 묶인 경우)
        const orphans = compTags.filter(t => !placed.has(t))

        // 노드 트리 재귀 생성
        const buildNode = (tag, lvl, id) => {
          const childTags = lvl < levelNodes.length - 1
            ? levelNodes[lvl + 1].filter(t => getCooc(tag, t) > 0)
            : []
          return {
            id,
            topic: tag,
            branchColor: color + ['', 'cc', 'aa', '88'][Math.min(lvl, 3)],
            style: mkStyle(tag, color, lvl),
            children: childTags.map((t, i) => buildNode(t, lvl + 1, `${id}_${i}`)),
          }
        }

        // center의 직접 자식 = levelNodes[1]
        const l1 = levelNodes[1] || []
        const children = [
          ...l1.map((t, i) => buildNode(t, 1, `c${clusterIdx}_l1_${i}`)),
          ...orphans.map((t, i) => ({
            id: `c${clusterIdx}_orp_${i}`,
            topic: t,
            branchColor: color + '66',
            style: mkStyle(t, color, 1),
          })),
        ]

        return { center, children }
      }

      const clusterNodes = mainComps.map((compTags, ci) => {
        const color = CLUSTER_COLORS[ci % CLUSTER_COLORS.length]
        const { center, children } = buildTree(compTags, color, ci)
        return {
          id: `cluster_${ci}`,
          topic: center,
          direction: ci % 2 === 0 ? 1 : 0,
          branchColor: color,
          style: mkStyle(center, color, 0),
          children,
        }
      })

      const mindData = {
        nodeData: {
          id: 'root',
          topic: 'Golden\nRecord',
          style: { color: '#fff', background: '#146ef5', fontSize: '14px', fontWeight: '700' },
          children: clusterNodes,
        },
      }

      // ── 4. Mind Elixir 초기화 ─────────────────
      // ★ --node-gap-x 를 작게 설정 — 이 값이 me-parent padding으로 사용돼
      //    크면 me-tpc(텍스트)가 박스 중앙 안쪽에 위치하고
      //    Mind Elixir 선이 me-tpc 좌표를 향해 그려지므로
      //    선이 박스 안쪽에서 출발하는 것처럼 보임
      const theme = {
        name: 'golden',
        palette: CLUSTER_COLORS,
        cssVar: {
          '--node-gap-x': '10px',   // me-parent 좌우 패딩 (작을수록 선이 박스 외곽에 닿음)
          '--node-gap-y': '6px',
          '--main-gap-x': '40px',   // 레벨 간 수평 간격
          '--main-gap-y': '10px',
          '--main-color': '#555',
          '--main-bgcolor': '#f0f4ff',
          '--main-bgcolor-transparent': '#f0f4ff00',
          '--color': '#444',
          '--bgcolor': '#fafbff',
          '--selected': '#e8f0fe',
          '--accent-color': '#146ef5',
          '--root-color': '#fff',
          '--root-bgcolor': '#146ef5',
          '--root-border-color': '#146ef5',
          '--root-radius': '20px',
          '--main-radius': '14px',
          '--topic-padding': '4px 10px',
          '--panel-color': '#333',
          '--panel-bgcolor': '#fff',
          '--panel-border-color': '#ddd',
          '--map-padding': '40px',
        },
      }

      try {
        const el = this.$refs.mapEl
        el.style.width = el.offsetWidth + 'px'
        el.style.height = el.offsetHeight + 'px'

        const me = new MindElixir({
          el,
          direction: 2,
          editable: false,
          contextMenu: false,
          toolBar: false,
          keypress: false,
          allowUndo: false,
          overflowHidden: true,
          handleWheel: true,
          scaleMin: 0.05,
          scaleMax: 3,
          theme,
        })
        me.init(mindData)
        this.me = me

        // ── 핵심: SVG 선을 DOM 첫 번째로 이동 → 노드보다 뒤에 그려짐
        // (position/z-index 사용 시 offsetTop 계산 기준이 바뀌어 선 위치가 틀어지므로
        //  CSS가 아닌 DOM 순서로 해결)
        if (me.lines && me.nodes) {
          me.nodes.insertBefore(me.lines, me.nodes.firstChild)
          if (me.labelContainer) me.nodes.insertBefore(me.labelContainer, me.nodes.firstChild)
        }

        setTimeout(() => {
          try { me.scaleFit(); me.toCenter() } catch (_) {}
        }, 100)

        // ── 커스텀 드래그-패닝 ────────────────────
        const canvas = this.$refs.mapEl
        let dragging = false, startX, startY, startTx, startTy

        const getTranslate = () => {
          const m = (me.map.style.transform || '').match(/translate3d\(\s*([^p]+)px,\s*([^p]+)px/)
          return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 }
        }
        const applyTransform = (tx, ty) => {
          me.map.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${me.scaleVal || 1})`
        }

        const onMouseDown = (e) => {
          if (e.button !== 0) return
          dragging = true
          startX = e.clientX; startY = e.clientY
          const t = getTranslate(); startTx = t.x; startTy = t.y
          canvas.classList.add('dragging')
          e.preventDefault()
        }
        const onMouseMove = (e) => {
          if (!dragging) return
          applyTransform(startTx + (e.clientX - startX), startTy + (e.clientY - startY))
        }
        const onMouseUp = () => { dragging = false; canvas.classList.remove('dragging') }

        const onTouchStart = (e) => {
          if (e.touches.length !== 1) return
          dragging = true
          startX = e.touches[0].clientX; startY = e.touches[0].clientY
          const t = getTranslate(); startTx = t.x; startTy = t.y
        }
        const onTouchMove = (e) => {
          if (!dragging || e.touches.length !== 1) return
          e.preventDefault()
          applyTransform(startTx + (e.touches[0].clientX - startX), startTy + (e.touches[0].clientY - startY))
        }
        const onTouchEnd = () => { dragging = false }

        canvas.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        canvas.addEventListener('touchstart', onTouchStart, { passive: true })
        canvas.addEventListener('touchmove', onTouchMove, { passive: false })
        canvas.addEventListener('touchend', onTouchEnd)

        this._cleanupDrag = () => {
          canvas.removeEventListener('mousedown', onMouseDown)
          window.removeEventListener('mousemove', onMouseMove)
          window.removeEventListener('mouseup', onMouseUp)
          canvas.removeEventListener('touchstart', onTouchStart)
          canvas.removeEventListener('touchmove', onTouchMove)
          canvas.removeEventListener('touchend', onTouchEnd)
        }

        this._resizeHandler = () => {
          el.style.width = ''
          el.style.height = ''
          this.$nextTick(() => {
            el.style.width = el.offsetWidth + 'px'
            el.style.height = el.offsetHeight + 'px'
            try { me.scaleFit(); me.toCenter() } catch (_) {}
          })
        }
        window.addEventListener('resize', this._resizeHandler)
      } catch (e) {
        console.warn('MindElixir init error:', e)
      }
    },
  },
}
</script>

<style scoped>
.mindmap-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* 모바일: 하단 시트 */
.mindmap-container {
  width: 100%;
  max-width: 480px;
  height: 88vh;
  background: #fafbff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* PC: 전체화면 모달 */
@media (min-width: 600px) {
  .mindmap-overlay {
    align-items: center;
  }
  .mindmap-container {
    max-width: calc(100vw - 48px);
    width: calc(100vw - 48px);
    height: calc(100vh - 48px);
    border-radius: 16px;
  }
}

.mindmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 4px;
  flex-shrink: 0;
  background: #fafbff;
}

.mindmap-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mindmap-title {
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(90deg, #146ef5, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
}

.mindmap-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  -webkit-tap-highlight-color: transparent;
}

.mindmap-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 20px 10px;
  flex-shrink: 0;
}

.mindmap-desc {
  font-size: 12px;
  color: #aaa;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.zoom-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--border, #d8d8d8);
  border-radius: 8px;
  background: #fff;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.zoom-btn:active {
  background: #f0f0f0;
}

.mindmap-canvas {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  background: #fafbff;
  cursor: grab;
}
.mindmap-canvas.dragging {
  cursor: grabbing;
}

/* 노드 텍스트 박스 */
.mindmap-canvas :deep(me-tpc) {
  cursor: default !important;
  border-radius: 18px !important;
}
.mindmap-canvas :deep(me-root > me-tpc) {
  border-radius: 24px !important;
  box-shadow: 0 2px 12px rgba(20,110,245,0.25) !important;
}

.mindmap-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding: 10px 20px 18px;
  flex-shrink: 0;
  background: #fafbff;
  border-top: 1px solid #eef0f5;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 11px;
  color: #666;
}
</style>
