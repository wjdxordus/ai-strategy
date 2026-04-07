<template>
  <div class="cinema">
    <div class="header">
      <div class="header-title">시네마</div>
      <div class="header-sub">나의 기록 영상</div>
    </div>
    <div class="coming-soon">
      <div class="coming-icon">🎬</div>
      <div class="coming-title">Coming Soon</div>
      <div class="coming-desc">기록들로 만들어진 영상을<br>곧 만나볼 수 있어요</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CinemaView',
}
</script>

<style scoped>
.cinema { background: #F7F8FC; min-height: 100%; }

.header {
  padding: 20px 20px 14px;
}
.header-title { font-size: 22px; font-weight: 700; color: #1A1A2E; }
.header-sub { font-size: 12px; color: #AAAAAA; margin-top: 2px; }

.coming-soon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
  gap: 12px;
}
.coming-icon { font-size: 56px; }
.coming-title {
  font-size: 18px;
  font-weight: 700;
  color: #1A1A2E;
}
.coming-desc {
  font-size: 14px;
  color: #AAAAAA;
  text-align: center;
  line-height: 1.7;
}
</style>
