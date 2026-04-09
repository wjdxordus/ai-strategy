<template>
  <div class="record-card">

    <!-- 사진 영역 -->
    <div class="card-photo" :style="photoStyle">
      <div class="photo-scrim" />
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

    <!-- 기록 텍스트 -->
    <div class="card-body">
      <p class="ai-record">{{ record.aiRecord }}</p>

      <!-- 감정 태그 -->
      <div v-if="record.emotionTags && record.emotionTags.length" class="tag-row">
        <span v-for="tag in record.emotionTags" :key="tag.label" class="tag tag-emotion">
          {{ tag.icon }}&thinsp;{{ tag.label }}
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
</template>

<script>
export default {
  name: 'RecordCard',
  props: {
    record: { type: Object, required: true },
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
.record-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  flex-shrink: 0;
}

/* 사진 */
.card-photo {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  background-size: cover;
  background-position: center;
}
.photo-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(0,0,0,0.12) 0%, transparent 30%),
    linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 40%, transparent 65%);
}
.photo-meta {
  position: absolute;
  bottom: 14px;
  left: 14px;
  right: 14px;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
}
.meta-weather {
  font-size: 14px;
  flex-shrink: 0;
}
.meta-time {
  font-size: 11px;
  color: rgba(255,255,255,0.7);
  flex-shrink: 0;
}
.meta-sep {
  flex-shrink: 0;
  width: 1px;
  height: 10px;
  background: rgba(255,255,255,0.3);
  margin: 0 2px;
}
.meta-pin {
  color: rgba(255,255,255,0.8);
  flex-shrink: 0;
}
.meta-location {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.95);
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 기록 바디 */
.card-body {
  padding: 16px 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ai-record {
  font-size: 14px;
  font-weight: 400;
  color: #1d1d1f;
  line-height: 1.6;
  letter-spacing: -0.2px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: -0.1px;
}
.tag-emotion {
  background: #f0f0f5;
  color: #1d1d1f;
}
.tag-category {
  background: #e8f4fd;
  color: #0066cc;
}
</style>
