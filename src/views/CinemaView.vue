<template>
  <div class="cinema">
    <div class="header">
      <div class="header-title">시네마</div>
    </div>
    <div class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/>
          <line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="7" x2="7" y2="7"/>
          <line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/>
          <line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
      </div>
      <div class="empty-title">Coming Soon</div>
      <div class="empty-desc">기록으로 만들어진 영상을<br>곧 만나볼 수 있어요.</div>
    </div>
  </div>
</template>

<script>
export default { name: 'CinemaView' }
</script>

<style scoped>
.cinema { background: #fff; min-height: 100%; }

.header {
  padding: 28px 24px 16px;
}
.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.5px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100px;
  gap: 14px;
}
.empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aeaeb2;
}
.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.2px;
}
.empty-desc {
  font-size: 14px;
  color: #86868b;
  text-align: center;
  line-height: 1.7;
}
</style>
