<template>
  <div class="sheet-overlay" @click.self="$emit('close')">
    <transition name="sheet-up" appear>
      <div class="sheet">
        <!-- 헤더 -->
        <div class="drag-handle" />
        <div class="sheet-header">
          <button class="btn-close" @click="$emit('close')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <span class="sheet-date">{{ formattedDate }}</span>
          <div style="width:32px" />
        </div>

        <!-- 탭 -->
        <div class="tabs">
          <button
            v-for="t in tabs" :key="t.key"
            class="tab-btn"
            :class="{ active: activeTab === t.key }"
            @click="activeTab = t.key"
          >{{ t.label }}</button>
        </div>

        <!-- 태그 목록 -->
        <div class="tag-grid">
          <button
            v-for="tag in currentTags" :key="tag"
            class="chip"
            @click="selectTag(tag)"
          >#{{ tag }}</button>
          <p v-if="!currentTags.length" class="empty-msg">태그가 없어요</p>
        </div>

        <!-- 직접 입력 -->
        <div class="input-row">
          <span class="hash-prefix">#</span>
          <input
            ref="tagInput"
            v-model="customTag"
            class="tag-input"
            placeholder="태그 입력"
            maxlength="20"
            @keyup.enter="addCustomTag"
          />
          <button class="btn-send" @click="addCustomTag">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
          <button class="btn-save" @click="$emit('close')">저장</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { store } from '../store'

const SEASONAL_TAGS = {
  spring: ['벚꽃','봄나들이','꽃구경','피크닉','소풍','봄바람','새학기','나들이','봄비','꽃놀이','봄햇살','봄옷','봄풍경','봄꽃','개나리','진달래','튤립','야외','따뜻한날','봄여행'],
  summer: ['여름','바다','수영장','휴가','해수욕','더위','아이스크림','맥주한캔','냉면','한강','장마','반바지','선크림','계곡','캠핑','수박','모기','열대야','불꽃','여름밤'],
  autumn: ['가을','단풍','은행나무','코스모스','추석','독서','캠핑','고구마','낙엽','가을하늘','가을바람','핫초코','가을소풍','붉은노을','쌀쌀함','감성','스웨터','가을사진','밤줍기','추수'],
  winter: ['눈','크리스마스','핫초코','연말','새해','스키','눈사람','코트','패딩','연말파티','겨울바다','뜨끈한국물','귤','크리스마스트리','포근함','눈꽃','겨울여행','동지','제야의종','겨울감성'],
}

function getSeason(dateStr) {
  const month = parseInt((dateStr || '').split('-')[1] || new Date().getMonth() + 1, 10)
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export default {
  name: 'TagAddSheet',
  props: { date: { type: String, required: true } },
  emits: ['add', 'close'],
  data() {
    return {
      activeTab: 'recent',
      customTag: '',
      tabs: [
        { key: 'recent', label: '최근' },
        { key: 'frequent', label: '자주 사용한' },
        { key: 'recommend', label: '추천' },
      ],
    }
  },
  computed: {
    formattedDate() {
      const [y, m, d] = this.date.split('-')
      return `${y}.${parseInt(m)}.${parseInt(d)}`
    },
    recentTags() {
      const sorted = [...store.records, ...store.todayRecords].sort((a, b) => a.date > b.date ? -1 : 1)
      const seen = new Set(); const result = []
      for (const r of sorted) {
        for (const t of (r.categoryTags || [])) {
          if (!seen.has(t)) { seen.add(t); result.push(t) }
          if (result.length >= 20) return result
        }
      }
      return result
    },
    frequentTags() {
      const freq = {}
      for (const r of [...store.records, ...store.todayRecords, ...store.memoryRecords])
        for (const t of (r.categoryTags || [])) freq[t] = (freq[t] || 0) + 1
      return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([tag]) => tag)
    },
    recommendTags() { return SEASONAL_TAGS[getSeason(this.date)] || [] },
    currentTags() {
      if (this.activeTab === 'recent') return this.recentTags
      if (this.activeTab === 'frequent') return this.frequentTags
      return this.recommendTags
    },
  },
  mounted() {
    setTimeout(() => { this.$refs.tagInput?.focus() }, 350)
  },
  methods: {
    selectTag(tag) { this.$emit('add', tag) },
    addCustomTag() {
      const tag = this.customTag.trim().replace(/^#/, '')
      if (!tag) return
      this.$emit('add', tag)
      this.customTag = ''
      this.$refs.tagInput?.focus()
    },
  },
}
</script>

<style scoped>
/* ─── 오버레이 ──────────────────────────── */
.sheet-overlay {
  position: fixed; inset: 0; z-index: 700;
  background: rgba(232,236,240,0.6);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; flex-direction: column; justify-content: flex-end;
}

/* ─── 시트 ──────────────────────────────── */
.sheet {
  background: var(--nm-bg);
  box-shadow: -6px -6px 18px #ffffff, 6px -6px 18px #c3c9d4;
  border-radius: 24px 24px 0 0;
  display: flex; flex-direction: column;
  max-height: 72vh;
  padding-bottom: env(safe-area-inset-bottom);
}

.drag-handle {
  width: 36px; height: 4px; border-radius: 2px;
  background: var(--nm-s1);
  margin: 12px auto 0; flex-shrink: 0;
}

/* ─── 헤더 ──────────────────────────────── */
.sheet-header {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 12px 18px 8px; flex-shrink: 0;
}
.sheet-date {
  font-size: 15px; font-weight: 700;
  color: var(--text); letter-spacing: -0.3px;
}
.btn-close {
  width: 32px; height: 32px;
  background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  border: none; border-radius: 50%;
  color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent; padding: 0;
}
.btn-close:active { box-shadow: var(--nm-in-sm); }

/* ─── 탭 ────────────────────────────────── */
.tabs {
  display: flex; gap: 8px;
  padding: 8px 18px 12px; flex-shrink: 0;
}
.tab-btn {
  background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  border: none; border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px; font-weight: 600;
  color: var(--text-sub);
  cursor: pointer; font-family: inherit;
  letter-spacing: -0.2px;
  transition: box-shadow 0.2s, color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.tab-btn.active {
  box-shadow: var(--nm-in-sm);
  color: var(--accent);
}

/* ─── 태그 그리드 ────────────────────────── */
.tag-grid {
  flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch;
  padding: 4px 18px 12px;
  display: flex; flex-wrap: wrap; gap: 8px; align-content: flex-start;
}
.chip {
  background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  border: none; border-radius: 20px;
  padding: 7px 14px;
  font-size: 13px; font-weight: 600;
  color: #00b894;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  letter-spacing: -0.1px;
}
.chip:active { box-shadow: var(--nm-in-sm); }
.empty-msg {
  font-size: 13px; color: var(--text-sub);
  width: 100%; text-align: center; padding: 20px 0;
}

/* ─── 입력 영역 ──────────────────────────── */
.input-row {
  display: flex; align-items: center;
  padding: 10px 14px;
  background: var(--nm-bg);
  box-shadow: 0 -3px 10px rgba(195,201,212,0.4);
  gap: 6px; flex-shrink: 0;
}
.hash-prefix {
  font-size: 17px; font-weight: 700;
  color: var(--text); flex-shrink: 0;
}
.tag-input {
  flex: 1; border: none; outline: none;
  font-size: 15px; font-weight: 400;
  color: var(--text); font-family: inherit;
  background: transparent; letter-spacing: -0.2px;
}
.tag-input::placeholder { color: var(--text-sub); }
.btn-send {
  width: 34px; height: 34px; border-radius: 50%;
  border: none;
  background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; flex-shrink: 0; -webkit-tap-highlight-color: transparent;
}
.btn-send:active { box-shadow: var(--nm-in-sm); }
.btn-save {
  border: none;
  background: var(--nm-bg);
  box-shadow: var(--nm-out-sm);
  color: var(--accent);
  font-size: 14px; font-weight: 700;
  padding: 8px 18px; border-radius: 20px;
  cursor: pointer; flex-shrink: 0;
  letter-spacing: -0.2px; -webkit-tap-highlight-color: transparent;
}
.btn-save:active { box-shadow: var(--nm-in-sm); }

/* ─── 애니메이션 ─────────────────────────── */
.sheet-up-enter-active { transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-up-enter { transform: translateY(100%); }
</style>
