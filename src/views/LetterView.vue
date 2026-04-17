<template>
  <div class="letter-wrap">

    <!-- 상단 이미지 -->
    <div class="letter-hero">
      <img src="/images/edu.jpeg" class="hero-img" alt="AI 전략과정" />
      <div class="hero-scrim" />
      <div class="hero-label">5주간의 여정</div>
    </div>

    <!-- 편지 카드 -->
    <div class="letter-card">
      <div class="letter-header">
        <span class="letter-date">2026. 04. 17</span>
        <span class="letter-from">AI 전략과정 수료를 앞두고</span>
      </div>

      <div class="letter-body" ref="letterBody">
        <span class="typed-text">{{ displayedText }}</span>
        <span class="cursor" :class="{ hidden: isDone }">|</span>
      </div>

      <!-- 다음 버튼 -->
      <transition name="fade-up">
        <button v-if="isDone" class="next-btn" @click="goNext">
          <span>앱 시작하기</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </transition>
    </div>

  </div>
</template>

<script>
const LETTER = `함께한 모든 분들께,

지난 5주간, 저희는 단순히 AI를 배운 것이 아니라
서로를 배웠습니다.

낯선 개념 앞에서 함께 머리를 맞대고,
밤늦게까지 자료를 다듬던 그 순간들,
조원 한 명 한 명이 없었다면 결코 완성할 수 없었을
결과물들이 이제 우리의 공동 작품으로 남았습니다.

때로는 막막했고, 때로는 지쳤지만
웃음과 격려로 서로를 붙잡아 준 덕분에
여기까지 올 수 있었습니다.

이 과정을 위해 깊이 고민하고 준비해 주신
교수님과 조교님께 진심으로 감사드립니다.
단순한 강의가 아닌, 생각하는 힘을 길러 주셨습니다.

그리고 이 교육이 가능하도록 지원해 주신
모든 분들께도 깊은 감사를 전합니다.
여러분의 헌신이 있었기에, 우리의 5주가
빛날 수 있었습니다.

이 경험은 기술이 아닌 사람으로 기억될 것입니다.
교육을 위해 힘써주신 1조에서 5조 모든 분들 
정말 고생하셨습니다.

— AI전략과정에 참여하고 지원해주신 모든분들께`

export default {
  name: 'LetterView',
  data() {
    return {
      displayedText: '',
      isDone: false,
      _timer: null,
    }
  },
  mounted() {
    this.startTyping()
  },
  beforeDestroy() {
    clearTimeout(this._timer)
  },
  methods: {
    startTyping() {
      let idx = 0
      const chars = [...LETTER]  // 유니코드 안전 split
      const speed = 28           // ms per character

      const type = () => {
        if (idx < chars.length) {
          this.displayedText += chars[idx++]
          this.$nextTick(() => {
            const el = this.$refs.letterBody
            if (el) el.scrollTop = el.scrollHeight
          })
          this._timer = setTimeout(type, speed)
        } else {
          this.isDone = true
        }
      }
      this._timer = setTimeout(type, 600)  // 초기 딜레이
    },
    goNext() {
      this.$router.push('/process')
    },
  },
}
</script>

<style scoped>
.letter-wrap {
  min-height: 100dvh;
  background: #faf7f4;
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
}

/* ── 히어로 이미지 ── */
.letter-hero {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  flex-shrink: 0;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.08) 0%,
    rgba(0,0,0,0.55) 100%
  );
}
.hero-label {
  position: absolute;
  bottom: 16px;
  left: 20px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.5px;
}

/* ── 편지 카드 ── */
.letter-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: -16px 16px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 2px 8px rgba(0,0,0,0.06),
    0 12px 32px rgba(0,0,0,0.08);
  padding: 24px 24px 20px;
  z-index: 1;
}

.letter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0ebe4;
}
.letter-date {
  font-size: 11px;
  color: #aaa;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.letter-from {
  font-size: 11px;
  color: #bbb;
  font-weight: 400;
}

/* ── 타이핑 텍스트 ── */
.letter-body {
  flex: 1;
  font-size: 15px;
  line-height: 1.85;
  color: #2a2a2a;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-y: auto;
  max-height: 52vh;
  letter-spacing: -0.1px;
}

.cursor {
  display: inline-block;
  width: 2px;
  background: #146ef5;
  animation: blink 0.75s step-end infinite;
  margin-left: 1px;
  vertical-align: text-bottom;
  height: 1em;
}
.cursor.hidden { display: none; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* ── 다음 버튼 ── */
.next-btn {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #146ef5 0%, #8B5CF6 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: -0.2px;
  -webkit-tap-highlight-color: transparent;
}
.next-btn:active {
  opacity: 0.88;
  transform: scale(0.98);
}

/* ── 트랜지션 ── */
.fade-up-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-up-enter {
  opacity: 0;
  transform: translateY(12px);
}
</style>
