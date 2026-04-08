<template>
  <div class="home">

    <!-- 헤더 -->
    <div class="header">
      <div class="header-date">{{ todayLabel }}</div>
      <div class="header-title">오늘의 기록</div>
    </div>

    <!-- 필름 슬라이더 -->
    <div class="film-area">
      <!-- 상단 스프로킷 -->
      <div class="sprocket-bar sprocket-top" />

      <!-- 슬라이드 -->
      <div class="film-strip" ref="strip" @scroll.passive="onScroll">
        <div
          v-for="(rec, i) in todayRecords"
          :key="rec.id"
          class="film-slide"
          :class="{ active: i === activeIndex }"
        >
          <div class="film-photo" :style="photoStyle(rec)">
            <div class="photo-gradient" />
            <div class="photo-location">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {{ rec.location }}
            </div>
            <div class="photo-time">{{ rec.time }}</div>
          </div>
        </div>
      </div>

      <!-- 하단 스프로킷 -->
      <div class="sprocket-bar sprocket-bottom" />

      <!-- 인디케이터 -->
      <div class="dots" v-if="todayRecords.length > 1">
        <span
          v-for="(r, i) in todayRecords"
          :key="i"
          class="dot"
          :class="{ active: i === activeIndex }"
        />
      </div>
    </div>

    <!-- 기록 상세 (슬라이드에 따라 변환) -->
    <transition name="content-swap" mode="out-in">
      <div class="content" :key="activeIndex">

        <section class="section">
          <div class="section-eyebrow">
            <span>AI 코멘트</span>
            <span class="badge">자동 생성</span>
          </div>
          <p class="ai-text">{{ currentRecord.aiComment }}</p>
        </section>

        <div class="divider" />

        <section class="section">
          <div class="section-eyebrow">감정</div>
          <div class="chip-row">
            <span v-for="tag in currentRecord.emotionTags" :key="tag.label" class="chip">
              {{ tag.icon }}&thinsp;{{ tag.label }}
            </span>
          </div>
        </section>

        <div class="divider" />

        <section class="section">
          <div class="section-eyebrow">카테고리</div>
          <div class="chip-row">
            <span v-for="tag in currentRecord.categoryTags" :key="tag" class="chip">
              #&thinsp;{{ tag }}
            </span>
          </div>
        </section>

        <div class="divider" />

        <section class="section">
          <div class="section-eyebrow">메모</div>
          <textarea
            v-model="localNote"
            class="note-input"
            placeholder="오늘을 기록하세요..."
            rows="4"
          />
        </section>

        <div style="height: 100px" />
      </div>
    </transition>

    <!-- 저장 버튼 -->
    <button class="save-btn" :class="{ saved: isSaved }" @click="save">
      <transition name="fade" mode="out-in">
        <span v-if="!isSaved" key="a">저장</span>
        <span v-else key="b">저장됨 ✓</span>
      </transition>
    </button>

  </div>
</template>

<script>
import { store } from '../store'

export default {
  name: 'HomeView',
  data() {
    // 각 기록의 메모를 독립적으로 관리
    const noteMap = {}
    store.records.forEach(r => { noteMap[r.id] = r.userNote || '' })
    return {
      activeIndex: 0,
      isSaved: false,
      noteMap,
    }
  },
  computed: {
    todayRecords() {
      // 실제 운영 시 오늘 날짜 필터; 데모에서는 전체 표시
      return store.records
    },
    currentRecord() {
      return this.todayRecords[this.activeIndex] || this.todayRecords[0]
    },
    localNote: {
      get() { return this.noteMap[this.currentRecord?.id] || '' },
      set(val) { this.$set(this.noteMap, this.currentRecord.id, val) },
    },
    todayLabel() {
      const d = new Date()
      const days = ['일', '월', '화', '수', '목', '금', '토']
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`
    },
  },
  methods: {
    photoStyle(rec) {
      if (rec.thumbnail) {
        return { backgroundImage: `url(${rec.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      }
      return { background: rec.gradient }
    },
    onScroll() {
      const el = this.$refs.strip
      if (!el || !el.children.length) return
      const slideWidth = el.children[0].offsetWidth
      const gap = 12
      const index = Math.round(el.scrollLeft / (slideWidth + gap))
      this.activeIndex = Math.max(0, Math.min(index, this.todayRecords.length - 1))
    },
    save() {
      const rec = store.records.find(r => r.id === this.currentRecord.id)
      if (rec) rec.userNote = this.localNote
      this.isSaved = true
      setTimeout(() => { this.isSaved = false }, 2000)
    },
  },
}
</script>

<style scoped>
.home {
  background: #fff;
  min-height: 100%;
}

/* 헤더 */
.header {
  padding: 28px 24px 20px;
}
.header-date {
  font-size: 11px;
  font-weight: 500;
  color: #86868b;
  letter-spacing: 0.2px;
  margin-bottom: 6px;
  text-transform: uppercase;
}
.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

/* 필름 영역 */
.film-area {
  background: #1a1a1a;
  position: relative;
}

/* 스프로킷 바 */
.sprocket-bar {
  height: 22px;
  background:
    repeating-linear-gradient(
      to right,
      transparent 0px,
      transparent 5px,
      rgba(255, 255, 255, 0.82) 5px,
      rgba(255, 255, 255, 0.82) 17px,
      transparent 17px,
      transparent 24px
    ) center / 100% 12px no-repeat,
    #1a1a1a;
}
.sprocket-top { margin-bottom: 8px; }
.sprocket-bottom { margin-top: 8px; }

/* 슬라이더 */
.film-strip {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  gap: 12px;
  padding: 0 10%;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.film-strip::-webkit-scrollbar { display: none; }

/* 슬라이드 */
.film-slide {
  flex-shrink: 0;
  width: 80%;
  scroll-snap-align: center;
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.35s;
  transform: scale(0.92);
  opacity: 0.55;
}
.film-slide.active {
  transform: scale(1);
  opacity: 1;
}

/* 사진 */
.film-photo {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background-size: cover;
  background-position: center;
}
.photo-gradient {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 30%),
    linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 35%, transparent 60%);
}
.photo-location {
  position: absolute;
  bottom: 16px;
  left: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.92);
  letter-spacing: -0.2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  z-index: 1;
}
.photo-time {
  position: absolute;
  top: 14px;
  right: 14px;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.1px;
  z-index: 1;
}

/* 인디케이터 */
.dots {
  display: flex;
  justify-content: center;
  gap: 5px;
  padding: 10px 0 12px;
}
.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.3s, background 0.3s;
}
.dot.active {
  width: 16px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.88);
}

/* 기록 상세 */
.content { padding: 0; }

.section { padding: 20px 24px; }

.section-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.badge {
  font-size: 10px;
  font-weight: 500;
  color: #1d1d1f;
  background: #f5f5f7;
  padding: 2px 8px;
  border-radius: 20px;
  letter-spacing: 0;
  text-transform: none;
}

.divider {
  height: 0.5px;
  background: #e5e5ea;
  margin: 0 24px;
}

.ai-text {
  font-size: 15px;
  line-height: 1.75;
  color: #1d1d1f;
}

.chip-row { display: flex; gap: 7px; flex-wrap: wrap; }
.chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.1px;
  background: #f5f5f7;
  color: #1d1d1f;
}

.note-input {
  width: 100%;
  background: #f5f5f7;
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  color: #1d1d1f;
  line-height: 1.6;
  resize: none;
  outline: none;
  font-family: inherit;
  transition: background 0.2s;
  -webkit-font-smoothing: antialiased;
}
.note-input:focus { background: #ebebed; }
.note-input::placeholder { color: #aeaeb2; }

/* 저장 버튼 */
.save-btn {
  position: fixed;
  right: 20px;
  bottom: calc(56px + env(safe-area-inset-bottom) + 16px);
  height: 44px;
  padding: 0 22px;
  border-radius: 22px;
  background: #1d1d1f;
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition: background 0.25s, transform 0.15s;
  z-index: 100;
  -webkit-font-smoothing: antialiased;
}
.save-btn:active { transform: scale(0.95); }
.save-btn.saved { background: #34c759; }

/* 콘텐츠 전환 트랜지션 */
.content-swap-enter-active {
  transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.content-swap-leave-active {
  transition: opacity 0.16s ease;
}
.content-swap-enter {
  opacity: 0;
  transform: translateY(12px);
}
.content-swap-leave-to {
  opacity: 0;
}

/* 저장 버튼 텍스트 전환 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
