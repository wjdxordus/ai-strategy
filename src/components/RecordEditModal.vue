<template>
  <div class="edit-screen">

    <!-- 헤더 -->
    <div class="edit-header">
      <button class="btn-icon" @click="close">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <span class="header-date">{{ formattedDate }}</span>
      <button class="btn-done" @click="save" :disabled="saving">완료</button>
    </div>

    <!-- 스크롤 콘텐츠 -->
    <div class="edit-body">

      <!-- 날씨 / 시간 / 위치 -->
      <div class="meta-row">
        <span class="meta-weather">{{ draft.weather.emoji }}</span>
        <span class="meta-time">{{ draft.time }}</span>
        <svg class="meta-pin" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span class="meta-location">{{ draft.location }}</span>
      </div>

      <!-- 기록 텍스트 -->
      <div class="section">
        <textarea
          class="record-textarea"
          v-model="draft.aiRecord"
          placeholder="기록 내용을 입력하세요"
          rows="4"
        />
      </div>

      <!-- 사진 -->
      <div class="section">
        <div class="photo-outer">
          <div class="photo-wrap">
            <img v-if="draft.thumbnail" :src="draft.thumbnail" class="photo-img" alt="기록 사진" />
            <div v-else class="photo-placeholder" :style="{ background: draft.gradient }" />
            <button class="btn-photo-x" @click="changePhoto" aria-label="사진 변경">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- 태그 -->
      <div class="section tags-section">
        <span v-for="(tag, i) in draft.emotionTags" :key="'e' + i" class="tag tag-emotion">
          <span>{{ tag.icon }}&thinsp;{{ tag.label }}</span>
          <button class="tag-del" @click="removeEmotionTag(i)">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </span>
        <span v-for="(tag, i) in draft.categoryTags" :key="'c' + i" class="tag tag-category">
          <span>#&thinsp;{{ tag }}</span>
          <button class="tag-del" @click="removeCategoryTag(i)">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </span>
        <button class="btn-add-tag" @click="showTagSheet = true">태그추가</button>
      </div>

      <div style="height: 48px" />
    </div>

    <!-- 태그 추가 시트 -->
    <TagAddSheet v-if="showTagSheet" :date="draft.date" @add="addTag" @close="showTagSheet = false" />

    <!-- 사진 분석 로딩 -->
    <transition name="fade">
      <div v-if="analyzing" class="analyzing-overlay">
        <div class="analyzing-card">
          <div class="analyzing-spinner" />
          <p class="analyzing-text">{{ analyzingStep || '사진을 분석하고\n기록을 만들고 있어요' }}</p>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import { store, updateRecord } from '../store'
import { fetchWeather } from '../services/weather'
import { uploadFile, analyzePhoto } from '../services/dify'
import TagAddSheet from './TagAddSheet.vue'

export default {
  name: 'RecordEditModal',
  components: { TagAddSheet },
  props: { record: { type: Object, required: true } },
  emits: ['close'],
  data() {
    return {
      draft: {
        ...this.record,
        emotionTags: [...(this.record.emotionTags || [])],
        categoryTags: [...(this.record.categoryTags || [])],
      },
      saving: false,
      analyzing: false,
      analyzingStep: '',
      showTagSheet: false,
    }
  },
  computed: {
    formattedDate() {
      const [y, m, d] = (this.draft.date || '').split('-')
      return y ? `${y}.${parseInt(m)}.${parseInt(d)}` : ''
    },
  },
  mounted() {
    if (!window.DailyLogBridge) window.DailyLogBridge = {}
    window.DailyLogBridge.onPhotoPicked = this.handlePhotoPicked
    document.body.style.overflow = 'hidden'
  },
  beforeDestroy() {
    if (window.DailyLogBridge?.onPhotoPicked === this.handlePhotoPicked)
      delete window.DailyLogBridge.onPhotoPicked
    document.body.style.overflow = ''
  },
  methods: {
    close() { this.$emit('close') },
    removeEmotionTag(i) { this.draft.emotionTags = this.draft.emotionTags.filter((_, idx) => idx !== i) },
    removeCategoryTag(i) { this.draft.categoryTags = this.draft.categoryTags.filter((_, idx) => idx !== i) },
    addTag(tag) {
      const t = tag.trim().replace(/^#/, '')
      if (t && !this.draft.categoryTags.includes(t))
        this.draft.categoryTags = [...this.draft.categoryTags, t]
    },
    changePhoto() {
      if (typeof window.Android !== 'undefined' && window.Android.pickPhoto) {
        window.Android.pickPhoto()
      } else {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.style.position = 'fixed'
        input.style.top = '-9999px'
        input.style.opacity = '0'
        document.body.appendChild(input)

        input.onchange = (e) => {
          const file = e.target.files[0]
          document.body.removeChild(input)
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => this.handlePhotoPicked(JSON.stringify({
            thumbnail: ev.target.result, lat: this.draft.lat, lng: this.draft.lng,
            timestamp: Date.now(), locationLabel: this.draft.location,
          }))
          reader.readAsDataURL(file)
        }

        // 취소 시 DOM 정리
        const cleanup = () => {
          if (document.body.contains(input)) document.body.removeChild(input)
          window.removeEventListener('focus', cleanup)
        }
        window.addEventListener('focus', cleanup, { once: true })

        input.click()
      }
    },
    async handlePhotoPicked(jsonStr) {
      let picked
      try { picked = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr }
      catch (e) { console.error('[EditModal] 파싱 오류:', e); return }

      this.analyzing = true
      try {
        const { thumbnail, lat, lng, timestamp, locationLabel } = picked
        const location = locationLabel || this.draft.location
        const d = new Date(timestamp || Date.now())
        const time = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`

        // 1단계: 날씨 조회
        this.analyzingStep = '날씨 정보 조회 중...'
        const weather = await fetchWeather(lat || this.draft.lat, lng || this.draft.lng, timestamp)

        // 2단계: 사진 업로드
        this.analyzingStep = '사진 업로드 중...'
        const uploadFileId = await uploadFile(thumbnail)

        // 3단계: AI 분석
        this.analyzingStep = 'AI가 기록을 만들고 있어요...'
        const generated = await analyzePhoto(uploadFileId, location, weather)

        this.draft = {
          ...this.draft,
          thumbnail,
          lat: lat || this.draft.lat,
          lng: lng || this.draft.lng,
          location,
          time,
          weather,
          aiRecord: generated.aiRecord,
          emotionTags: generated.emotionTags,
          categoryTags: generated.categoryTags,
        }
      } catch (e) {
        console.error('[EditModal] 사진 처리 오류:', e)
        this.analyzingStep = '오류가 발생했어요'
        await new Promise(r => setTimeout(r, 1500))
      } finally {
        this.analyzing = false
        this.analyzingStep = ''
      }
    },
    async save() {
      this.saving = true
      try {
        updateRecord(this.record.id, {
          thumbnail: this.draft.thumbnail, lat: this.draft.lat, lng: this.draft.lng,
          location: this.draft.location, time: this.draft.time, weather: this.draft.weather,
          aiRecord: this.draft.aiRecord, emotionTags: this.draft.emotionTags, categoryTags: this.draft.categoryTags,
        })
        this.$emit('close')
      } finally { this.saving = false }
    },
  },
}
</script>

<style scoped>
/* ─── 풀스크린 ──────────────────────────── */
.edit-screen {
  position: fixed; inset: 0; z-index: 500;
  background: var(--bg);
  display: flex; flex-direction: column;
  padding-top: env(safe-area-inset-top);
}

/* ─── 헤더 ──────────────────────────────── */
.edit-header {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 14px 18px; flex-shrink: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.header-date {
  font-size: 15px; font-weight: 600;
  color: var(--text); letter-spacing: -0.4px;
}
.btn-icon {
  width: 36px; height: 36px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 50%; color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0; -webkit-tap-highlight-color: transparent;
}
.btn-icon:active { background: #f5f5f5; }
.btn-done {
  background: var(--accent); border: 1px solid var(--accent);
  color: #fff; font-size: 14px; font-weight: 600;
  padding: 8px 18px; border-radius: var(--radius-pill);
  cursor: pointer; letter-spacing: -0.16px; font-family: inherit;
  -webkit-tap-highlight-color: transparent;
}
.btn-done:disabled { background: var(--bg); border-color: var(--border); color: var(--text-sub); }
.btn-done:not(:disabled):active { background: var(--accent-hover); border-color: var(--accent-hover); }

/* ─── 스크롤 영역 ────────────────────────── */
.edit-body {
  flex: 1; overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: env(safe-area-inset-bottom);
}

/* ─── 메타 행 ───────────────────────────── */
.meta-row {
  display: flex; align-items: center; gap: 6px;
  padding: 16px 20px 6px; background: var(--bg);
}
.meta-weather { font-size: 16px; flex-shrink: 0; }
.meta-time { font-size: 13px; font-weight: 500; color: var(--text-mid); flex-shrink: 0; }
.meta-pin { color: var(--text-sub); flex-shrink: 0; }
.meta-location {
  font-size: 13px; font-weight: 500; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ─── 섹션 ──────────────────────────────── */
.section { padding: 12px 20px 0; }

/* ─── 기록 textarea ─────────────────────── */
.record-textarea {
  width: 100%; background: var(--bg);
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 14px 16px;
  font-size: 15px; font-weight: 400;
  color: var(--text); line-height: 1.60;
  letter-spacing: -0.16px; font-family: inherit;
  resize: none; outline: none; -webkit-appearance: none;
  transition: border-color 0.2s;
}
.record-textarea:focus { border-color: var(--accent); }
.record-textarea::placeholder { color: var(--text-sub); }

/* ─── 사진 ──────────────────────────────── */
.photo-outer {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.photo-wrap {
  position: relative; border-radius: var(--radius-xl); overflow: hidden;
  background: var(--bg);
}
.photo-img { width: 100%; display: block; object-fit: cover; aspect-ratio: 4 / 3; }
.photo-placeholder { width: 100%; aspect-ratio: 4 / 3; }
.btn-photo-x {
  position: absolute; top: 10px; right: 10px;
  width: 28px; height: 28px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  color: #fff; display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.btn-photo-x:active { background: rgba(0,0,0,0.7); }

/* ─── 태그 ──────────────────────────────── */
.tags-section { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 8px 5px 11px;
  border-radius: var(--radius-pill); font-size: 12px; font-weight: 500;
  letter-spacing: -0.1px;
  border: 1px solid var(--border); background: var(--bg);
}
.tag-emotion { color: var(--text-mid); }
.tag-category {
  color: var(--accent);
  border-color: rgba(20,110,245,0.25); background: var(--accent-light);
}
.tag-del {
  display: flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border: none; background: none;
  cursor: pointer; padding: 0; opacity: 0.5;
  -webkit-tap-highlight-color: transparent; color: inherit;
}
.tag-del:active { opacity: 1; }
.btn-add-tag {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  padding: 5px 14px; font-size: 12px; font-weight: 600; font-family: inherit;
  color: var(--accent); cursor: pointer; letter-spacing: -0.1px;
  -webkit-tap-highlight-color: transparent;
}
.btn-add-tag:active { background: var(--accent-light); border-color: rgba(20,110,245,0.25); }

/* ─── 분석 팝업 ─────────────────────────── */
.analyzing-overlay {
  position: fixed; inset: 0;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 600;
}
.analyzing-card {
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  border-radius: var(--radius-xl);
  padding: 36px 40px;
  display: flex; flex-direction: column;
  align-items: center; gap: 18px; min-width: 220px;
}
.analyzing-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.analyzing-text {
  font-size: 15px; font-weight: 600;
  color: var(--text); letter-spacing: -0.16px;
  line-height: 1.55; text-align: center;
}

/* ─── 트랜지션 ──────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
