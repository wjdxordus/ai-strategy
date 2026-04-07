<template>
  <div class="home">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-date">{{ todayLabel }}</div>
      <div class="header-title">오늘의 기록</div>
    </div>

    <!-- 대표 사진 -->
    <div class="photo-wrapper">
      <div
        class="photo"
        :style="photoStyle"
      >
        <!-- 위치 배지 -->
        <div class="photo-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {{ record.location }}
        </div>
      </div>
    </div>

    <!-- 본문 영역 -->
    <div class="content">

      <!-- AI 코멘트 -->
      <div class="section">
        <div class="section-label">
          <span class="section-icon">✨</span> AI 코멘트
          <span class="section-badge">자동 생성</span>
        </div>
        <div class="ai-comment-card">
          <p class="ai-comment-text">{{ record.aiComment }}</p>
        </div>
      </div>

      <!-- 감정 태그 -->
      <div class="section">
        <div class="section-label">
          <span class="section-icon">💭</span> 감정
        </div>
        <div class="tag-scroll">
          <span
            v-for="tag in record.emotionTags"
            :key="tag.label"
            class="tag tag-emotion"
          >{{ tag.icon }} {{ tag.label }}</span>
        </div>
      </div>

      <!-- 카테고리 태그 -->
      <div class="section">
        <div class="section-label">
          <span class="section-icon">🏷️</span> 카테고리
        </div>
        <div class="tag-scroll">
          <span
            v-for="tag in record.categoryTags"
            :key="tag"
            class="tag tag-category"
          ># {{ tag }}</span>
        </div>
      </div>

      <!-- 추가 메모 -->
      <div class="section">
        <div class="section-label">
          <span class="section-icon">✏️</span> 추가 메모
        </div>
        <textarea
          v-model="userNote"
          class="note-input"
          placeholder="오늘의 느낌을 자유롭게 기록하세요..."
          rows="4"
        />
      </div>

      <div style="height: 80px" />
    </div>

    <!-- 플로팅 저장 버튼 -->
    <button class="fab" :class="{ saved: isSaved }" @click="save">
      <transition name="fab-icon" mode="out-in">
        <svg v-if="!isSaved" key="save" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg v-else key="done" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </transition>
      <span class="fab-label">{{ isSaved ? '저장됨' : '저장' }}</span>
    </button>

  </div>
</template>

<script>
import { store } from '../store'

export default {
  name: 'HomeView',
  data() {
    return {
      isSaved: false,
      userNote: store.todayNote,
    }
  },
  computed: {
    record() {
      return store.featuredRecord
    },
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
    todayLabel() {
      const d = new Date()
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`
    },
  },
  methods: {
    save() {
      store.todayNote = this.userNote
      this.isSaved = true
      setTimeout(() => { this.isSaved = false }, 2000)
    },
  },
}
</script>

<style scoped>
.home { background: #F7F8FC; min-height: 100%; }

/* 헤더 */
.header {
  padding: 20px 20px 12px;
  background: #F7F8FC;
}
.header-date { font-size: 12px; color: #AAAAAA; margin-bottom: 2px; }
.header-title { font-size: 22px; font-weight: 700; color: #1A1A2E; }

/* 사진 */
.photo-wrapper { position: relative; }
.photo {
  width: 100%;
  aspect-ratio: 4 / 3;
  position: relative;
  overflow: hidden;
}
.photo::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.45), transparent);
}
.photo-location {
  position: absolute;
  bottom: 14px; left: 14px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  padding: 5px 10px;
  border-radius: 20px;
  max-width: calc(100% - 28px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 본문 */
.content { padding: 0 16px; }

.section { margin-top: 20px; }
.section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}
.section-icon { font-size: 15px; }
.section-badge {
  font-size: 10px;
  background: #FFF0F0;
  color: #FF6B6B;
  padding: 2px 7px;
  border-radius: 10px;
  font-weight: 500;
  margin-left: 2px;
}

/* AI 코멘트 */
.ai-comment-card {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  border-left: 3px solid #FF6B6B;
}
.ai-comment-text {
  font-size: 14px;
  line-height: 1.7;
  color: #333;
}

/* 태그 */
.tag-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}
.tag {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  padding: 6px 13px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  flex-shrink: 0;
}
.tag-emotion {
  background: #FFF0F0;
  color: #E85555;
}
.tag-category {
  background: #EEF2FF;
  color: #5C7AFF;
}

/* 메모 */
.note-input {
  width: 100%;
  background: #fff;
  border: 1.5px solid #F0F0F0;
  border-radius: 14px;
  padding: 14px;
  font-size: 14px;
  color: #1A1A2E;
  line-height: 1.6;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}
.note-input:focus { border-color: #FF6B6B; }
.note-input::placeholder { color: #CCCCCC; }

/* FAB */
.fab {
  position: fixed;
  right: 20px;
  bottom: calc(64px + env(safe-area-inset-bottom) + 16px);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.45);
  transition: transform 0.15s, background 0.3s;
  z-index: 100;
}
.fab:active { transform: scale(0.93); }
.fab.saved {
  background: linear-gradient(135deg, #45C48A, #0FB08B);
  box-shadow: 0 4px 16px rgba(69, 196, 138, 0.45);
}
.fab-label { font-size: 9px; font-weight: 600; }
.fab-icon-enter-active, .fab-icon-leave-active { transition: opacity 0.15s, transform 0.15s; }
.fab-icon-enter { opacity: 0; transform: scale(0.6); }
.fab-icon-leave-to { opacity: 0; transform: scale(1.3); }
</style>
