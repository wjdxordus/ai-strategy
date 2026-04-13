<template>
  <div class="share-backdrop" @click.self="$emit('close')">
    <div class="share-sheet">

      <div class="sheet-handle" />

      <p class="sheet-title">공유하기</p>

      <div class="channel-row">
        <button class="channel-btn" @click="share('kakao')">
          <div class="channel-icon">
            <img src="/images/kakao.png" alt="카카오" />
          </div>
          <span class="channel-label">카카오</span>
        </button>

        <button class="channel-btn" @click="share('instagram')">
          <div class="channel-icon">
            <img src="/images/instagram.png" alt="인스타그램" />
          </div>
          <span class="channel-label">인스타그램</span>
        </button>

        <button class="channel-btn" @click="share('facebook')">
          <div class="channel-icon">
            <img src="/images/facebook.png" alt="페이스북" />
          </div>
          <span class="channel-label">페이스북</span>
        </button>

        <button class="channel-btn" @click="share('twitter')">
          <div class="channel-icon">
            <img src="/images/twitter.png" alt="트위터" />
          </div>
          <span class="channel-label">트위터</span>
        </button>
      </div>

      <button class="btn-cancel" @click="$emit('close')">취소</button>

    </div>
  </div>
</template>

<script>
export default {
  name: 'ShareSheet',
  props: {
    record: { type: Object, required: true },
  },
  emits: ['close'],
  methods: {
    share(channel) {
      const text = encodeURIComponent(this.record.aiRecord || '')
      const url = encodeURIComponent(window.location.href)

      if (channel === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
      } else if (channel === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
      } else if (channel === 'instagram') {
        window.open('https://www.instagram.com/', '_blank')
      } else if (channel === 'kakao') {
        window.open('https://www.kakaotalk.com/', '_blank')
      }

      this.$emit('close')
    },
  },
}
</script>

<style scoped>
.share-backdrop {
  position: fixed; inset: 0; z-index: 800;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: flex-end;
}

.share-sheet {
  width: 100%;
  background: var(--bg);
  border-radius: 20px 20px 0 0;
  padding: 12px 24px 0;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  animation: slide-up 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.sheet-handle {
  width: 36px; height: 4px;
  background: var(--border); border-radius: 2px;
  margin: 0 auto 18px;
}

.sheet-title {
  font-size: 15px; font-weight: 600;
  color: var(--text); letter-spacing: -0.3px;
  text-align: center; margin-bottom: 24px;
}

.channel-row {
  display: flex; justify-content: space-around;
  gap: 8px; margin-bottom: 28px;
}

.channel-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer;
  -webkit-tap-highlight-color: transparent; padding: 0;
}
.channel-btn:active .channel-icon { background: var(--accent-light); }

.channel-icon {
  width: 56px; height: 56px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  transition: background 0.15s;
}
.channel-icon img {
  width: 38px; height: 38px; object-fit: contain;
}

.channel-label {
  font-size: 11px; font-weight: 500;
  color: var(--text-sub); letter-spacing: -0.1px;
}

.btn-cancel {
  width: 100%;
  background: #f5f5f5; border: none;
  border-radius: var(--radius-lg);
  padding: 14px 0;
  font-size: 15px; font-weight: 600; font-family: inherit;
  color: var(--text-mid); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  margin-bottom: 8px;
}
.btn-cancel:active { background: #ebebeb; }
</style>
