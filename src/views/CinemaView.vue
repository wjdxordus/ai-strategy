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
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </div>
        <p class="teaser-label">Coming Soon</p>
        <p class="teaser-desc">기록들이 영상으로 살아납니다.</p>
      </div>
    </section>

    <!-- 기능 예고 -->
    <section class="features">
      <div class="feature-row">
        <div class="feature-icon">✦</div>
        <div class="feature-text">
          <p class="feature-title">자동 편집</p>
          <p class="feature-desc">AI가 최적의 순간을 선별해 영상으로 만듭니다.</p>
        </div>
      </div>
      <div class="feature-sep" />
      <div class="feature-row">
        <div class="feature-icon">◈</div>
        <div class="feature-text">
          <p class="feature-title">음악 매칭</p>
          <p class="feature-desc">감정 태그에 맞는 배경 음악을 자동으로 선택합니다.</p>
        </div>
      </div>
      <div class="feature-sep" />
      <div class="feature-row">
        <div class="feature-icon">⬡</div>
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
.cinema { background: #fff; min-height: 100%; }

/* 히어로 */
.hero {
  padding: 52px 24px 48px;
  background: #1d1d1f;
}
.hero-eyebrow {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: #f5f5f7;
  letter-spacing: -1.5px;
  line-height: 1.05;
  margin-bottom: 12px;
}
.hero-sub {
  font-size: 17px;
  font-weight: 400;
  color: rgba(255,255,255,0.55);
  letter-spacing: -0.3px;
}

/* 예고 카드 */
.teaser { padding: 40px 20px; background: #f5f5f7; }
.teaser-card {
  background: #1d1d1f;
  border-radius: 20px;
  padding: 40px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
}
.teaser-icon {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.8);
  margin-bottom: 4px;
}
.teaser-label {
  font-size: 22px;
  font-weight: 700;
  color: #f5f5f7;
  letter-spacing: -0.5px;
}
.teaser-desc {
  font-size: 15px;
  color: rgba(255,255,255,0.5);
  letter-spacing: -0.2px;
  line-height: 1.6;
}

/* 기능 예고 */
.features { padding: 8px 20px 40px; background: #f5f5f7; }
.feature-row {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 22px 0;
}
.feature-icon {
  font-size: 22px;
  color: #1d1d1f;
  flex-shrink: 0;
  width: 32px;
  text-align: center;
  margin-top: 1px;
}
.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.3px;
  margin-bottom: 4px;
}
.feature-desc {
  font-size: 14px;
  color: #6e6e73;
  line-height: 1.6;
  letter-spacing: -0.1px;
}
.feature-sep {
  height: 0.5px;
  background: rgba(0,0,0,0.12);
}
</style>
