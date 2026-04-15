<template>
  <!-- outer: 뉴모피즘 shadow (overflow: hidden 없음) -->
  <div class="record-card-outer">
    <!-- inner: 이미지 클리핑 -->
    <div class="record-card">

      <!-- 사진 영역 -->
      <div class="card-photo" :style="photoStyle">
        <div class="photo-scrim" />
        <!-- 우측 상단 버튼 그룹 -->
        <div class="photo-actions">
          <button class="btn-photo-action" @click.stop="store.sharingRecord = record" aria-label="공유하기">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button class="btn-photo-action" @click.stop="$emit('edit', record)" aria-label="편집">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
        <div class="photo-meta">
          <span class="meta-weather">{{ record.weather.emoji }}</span>
          <span class="meta-time">{{ record.time }}</span>
          <span class="meta-sep" />
          <svg class="meta-pin" width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span class="meta-location">{{ record.location }}</span>
        </div>
      </div>

      <!-- 기록 바디 -->
      <div class="card-body">
        <p class="ai-record">{{ record.aiRecord }}</p>

        <!-- 감정 태그 -->
        <div v-if="record.emotionTags && record.emotionTags.length" class="tag-row">
          <span v-for="tag in record.emotionTags" :key="tag.label" class="tag tag-emotion">
            #{{ tag.label }}
          </span>
        </div>

        <!-- 카테고리 태그 -->
        <div v-if="record.categoryTags && record.categoryTags.length" class="tag-row">
          <span v-for="tag in record.categoryTags" :key="tag" class="tag tag-category">
            #&thinsp;{{ tag }}
          </span>
        </div>

      </div>

    </div>
  </div>
</template>

<script>
import { store } from '../store'

export default {
  name: 'RecordCard',
  props: {
    record: { type: Object, required: true },
  },
  emits: ['edit'],
  data() {
    return { store }
  },
  computed: {
    photoStyle() {
      if (this.record.thumbnail) {
        return {
          backgroundImage: `url(${this.record.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      }
      return { background: this.record.gradient }
    },
  },
}
</script>

<style scoped>
/* ─── 외부 래퍼 ─────────────────────────── */
.record-card-outer {
  border-radius: var(--radius-xl);
  border: none;
  box-shadow: var(--shadow);
  flex-shrink: 0;
  background: #ffffff;
}

/* ─── 내부 카드 (이미지 클리핑) ────────────── */
.record-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: transparent;
}

/* ─── 사진 ──────────────────────────────── */
.card-photo {
  position: relative; width: 100%;
  aspect-ratio: 4 / 3;
  background-size: cover; background-position: center;
}
.photo-scrim {
  position: absolute; inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, transparent 25%),
    linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 40%, transparent 65%);
}
.photo-meta {
  position: absolute; bottom: 12px; left: 14px; right: 14px;
  z-index: 1; display: flex; align-items: center; gap: 5px; overflow: hidden;
}
.meta-weather { font-size: 14px; flex-shrink: 0; }
.meta-time { font-size: 11px; color: rgba(255,255,255,0.72); flex-shrink: 0; }
.meta-sep { flex-shrink: 0; width: 1px; height: 10px; background: rgba(255,255,255,0.3); margin: 0 2px; }
.meta-pin { color: rgba(255,255,255,0.8); flex-shrink: 0; }
.meta-location {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.95); letter-spacing: -0.16px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ─── 사진 우측 상단 버튼 그룹 ─────────── */
.photo-actions {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  display: flex; gap: 6px;
}
.btn-photo-action {
  width: 30px; height: 30px; border-radius: 50%; border: none;
  background: rgba(0,0,0,0.38);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  color: rgba(255,255,255,0.9);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.btn-photo-action:active { background: rgba(0,0,0,0.6); }

/* ─── 기록 바디 ─────────────────────────── */
.card-body {
  position: relative; z-index: 1;
  padding: 16px;
  background: #ffffff;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  display: flex; flex-direction: column; gap: 10px;
}
.ai-record {
  font-size: 14px; font-weight: 400; color: rgba(20,20,30,0.88);
  line-height: 1.60; letter-spacing: -0.16px;
  display: -webkit-box; -webkit-line-clamp: 3;
  -webkit-box-orient: vertical; overflow: hidden;
}
.tag-row { display: flex; flex-wrap: wrap; gap: 6px; }
.tag {
  padding: 4px 10px; border-radius: var(--radius-pill);
  font-size: 11px; font-weight: 500; letter-spacing: -0.1px;
  border: none;
}
.tag-emotion {
  color: rgba(50,15,100,0.9);
  background: rgba(139,92,246,0.1);
  border: 1px solid rgba(139,92,246,0.2);
}
.tag-category {
  color: rgba(20,20,30,0.5);
  background: transparent;
}

</style>
