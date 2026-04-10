<template>
  <div class="cinema">

    <!-- 히어로 -->
    <section class="hero">
      <p class="hero-eyebrow">일상기록</p>
      <h1 class="hero-title">시네마</h1>
      <p class="hero-sub">나의 기억으로 만든 영상</p>
    </section>

    <!-- 예고 카드 -->
    <section class="teaser">
      <div class="teaser-card">
        <div class="teaser-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <p class="teaser-label">Coming Soon</p>
        <p class="teaser-desc">기록들이 영상으로 살아납니다.</p>
      </div>
    </section>

    <!-- 기능 예고 -->
    <section class="features">
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <span class="feature-icon">✦</span>
        </div>
        <div class="feature-text">
          <p class="feature-title">자동 편집</p>
          <p class="feature-desc">AI가 최적의 순간을 선별해 영상으로 만듭니다.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <span class="feature-icon">◈</span>
        </div>
        <div class="feature-text">
          <p class="feature-title">음악 매칭</p>
          <p class="feature-desc">감정 태그에 맞는 배경 음악을 자동으로 선택합니다.</p>
        </div>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <span class="feature-icon">⬡</span>
        </div>
        <div class="feature-text">
          <p class="feature-title">월별 하이라이트</p>
          <p class="feature-desc">한 달간의 기억을 2분으로 압축합니다.</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
export default { name: 'CinemaView' }
</script>

<style scoped>
.cinema { background: var(--bg); min-height: 100%; }

/* ─── 히어로 ──────────────────────────────── */
.hero { padding: 52px 24px 44px; background: var(--bg); }
.hero-eyebrow {
  font-size: 10px; font-weight: 600;
  color: var(--text-sub); letter-spacing: 1.5px;
  text-transform: uppercase; margin-bottom: 10px;
}
.hero-title {
  font-size: 44px; font-weight: 600;
  color: var(--text); letter-spacing: -0.8px;
  line-height: 1.04; margin-bottom: 10px;
}
.hero-sub {
  font-size: 16px; font-weight: 400;
  color: var(--text-sub); letter-spacing: -0.16px;
}

/* ─── 예고 카드 ───────────────────────────── */
.teaser { padding: 0 20px 28px; }
.teaser-card {
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  border-radius: var(--radius-xl);
  padding: 44px 28px;
  display: flex; flex-direction: column;
  align-items: center; text-align: center; gap: 14px;
}
.teaser-icon {
  width: 72px; height: 72px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--accent); margin-bottom: 4px;
}
.teaser-label {
  font-size: 22px; font-weight: 600;
  color: var(--text); letter-spacing: -0.5px;
}
.teaser-desc {
  font-size: 16px; color: var(--text-sub);
  letter-spacing: -0.16px; line-height: 1.6;
}

/* ─── 기능 카드 ───────────────────────────── */
.features { padding: 0 20px 40px; display: flex; flex-direction: column; gap: 10px; }
.feature-card {
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  border-radius: var(--radius-lg);
  padding: 20px 18px;
  display: flex; align-items: flex-start; gap: 16px;
}
.feature-icon-wrap {
  width: 44px; height: 44px;
  background: var(--accent-light);
  border: 1px solid rgba(20,110,245,0.2);
  border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.feature-icon { font-size: 18px; color: var(--accent); }
.feature-title {
  font-size: 15px; font-weight: 600;
  color: var(--text); letter-spacing: -0.16px; margin-bottom: 4px;
}
.feature-desc {
  font-size: 14px; color: var(--text-sub);
  line-height: 1.60; letter-spacing: -0.16px;
}
</style>
