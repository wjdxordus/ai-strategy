<template>
  <div class="my">

    <!-- ─── Sticky Header ──────────────────────── -->
    <div class="my-header">
      <h1 class="my-title">MY</h1>
      <div class="my-tab-bar">
        <button
          class="my-tab"
          :class="{ active: activeTab === 'tag_album' }"
          @click="switchTab('tag_album')"
        >태그앨범</button>
        <div class="my-tab-sep" />
        <button
          class="my-tab"
          :class="{ active: activeTab === 'tone_setting' }"
          @click="switchTab('tone_setting')"
        >멘트 설정</button>
      </div>
    </div>

    <!-- ─── 태그앨범 탭 ────────────────────────── -->
    <template v-if="activeTab === 'tag_album'">

      <!-- 검색 영역 -->
      <div class="search-area">
        <!-- 검색 결과 뷰일 때: 뒤로가기 + 쿼리 표시 -->
        <template v-if="showResults">
          <button class="btn-back" @click="clearSearch">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div class="search-box">
            <input
              ref="searchInput"
              v-model="searchQuery"
              class="search-input"
              @keyup.enter="doSearch"
            />
            <button class="btn-search-icon" @click="doSearch">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </template>

        <!-- 기본 뷰일 때: AI 검색 버튼 + 검색창 -->
        <template v-else>
          <button class="btn-ai" @click="focusSearch">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span>AI 검색</span>
          </button>
          <div class="search-box">
            <input
              ref="searchInput"
              v-model="searchQuery"
              class="search-input"
              placeholder="무엇을 찾고 있나요?"
              @keyup.enter="doSearch"
            />
            <button v-if="searchQuery" class="btn-x" @click="clearSearch">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="3" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <button class="btn-search-icon" @click="doSearch">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
        </template>
      </div>

      <!-- 검색 결과 뷰 -->
      <template v-if="showResults">
        <div class="result-meta-row">
          <span class="result-count">전체 검색 결과 <strong>{{ searchResults.length }}개</strong> 로그</span>
          <button class="result-view-btn" :class="{ active: resultGroupByDate }" @click="resultGroupByDate = !resultGroupByDate">날짜별모아보기</button>
        </div>

        <div v-if="!searchResults.length" class="no-result">
          <p class="no-result-text">검색 결과가 없어요</p>
        </div>

        <!-- 날짜별 그룹 -->
        <div v-else-if="resultGroupByDate">
          <div v-for="group in searchResultGroups" :key="group.date" class="result-date-group">
            <p class="result-date-label">{{ group.dateLabel }}</p>
            <div class="photo-grid-3">
              <div
                v-for="r in group.records"
                :key="r.id"
                class="photo-cell"
                :style="thumbStyle(r)"
              />
            </div>
          </div>
        </div>

        <!-- 전체 그리드 -->
        <div v-else class="photo-grid-3">
          <div
            v-for="r in searchResults"
            :key="r.id"
            class="photo-cell"
            :style="thumbStyle(r)"
          />
        </div>

        <div style="height: 80px" />
      </template>

      <!-- 태그앨범 기본 뷰 -->
      <template v-else>
        <!-- 추천 태그 -->
        <div v-if="recommendedTags.length" class="rec-tags-wrap">
          <div class="rec-tags-scroll">
            <button
              v-for="tag in recommendedTags"
              :key="tag"
              class="rec-tag"
              @click="searchByTag(tag)"
            >#{{ tag }}</button>
          </div>
        </div>

        <!-- 태그 그리드 -->
        <div class="tag-area">
          <div v-if="!tagItems.length" class="empty-tags">
            <div class="empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <p class="empty-title">태그가 없어요</p>
            <p class="empty-desc">기록에 태그를 추가하면 앨범이 만들어져요.</p>
          </div>

          <div class="tag-grid">
            <div
              v-for="item in tagItems"
              :key="item.tag"
              class="tag-card-outer"
              @click="searchByTag(item.tag)"
            >
              <div class="tag-card">
                <div class="tag-thumb" :style="thumbStyle(item.record)" />
                <div class="tag-scrim" />
                <span class="tag-badge">{{ item.count }}</span>
                <div class="tag-name-row">
                  <span class="tag-name">#{{ item.tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="height: 80px" />
      </template>
    </template>

    <!-- ─── 멘트 설정 탭 ────────────────────────── -->
    <template v-else-if="activeTab === 'tone_setting'">
      <div class="tone-wrap">
        <p class="tone-guide">자동기록의 문체 스타일을 설정하세요</p>

        <div class="tone-list">
          <div
            v-for="opt in toneOptions"
            :key="opt.key"
            class="tone-item"
            :class="{ active: toneStyle === opt.key }"
            @click="selectTone(opt.key)"
          >
            <div class="tone-row">
              <div class="radio-circle" :class="{ checked: toneStyle === opt.key }">
                <div v-if="toneStyle === opt.key" class="radio-dot" />
              </div>
              <span class="tone-label">{{ opt.label }}</span>
            </div>
            <p v-if="opt.example" class="tone-example">{{ opt.example }}</p>
            <div v-if="opt.key === 'custom' && toneStyle === 'custom'" class="custom-section" @click.stop>
              <button class="btn-learn" @click="pickFile">나만의 문체 익혀하기</button>
              <input
                ref="fileInput"
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                multiple
                style="display:none"
                @change="handleFiles"
              />
              <div v-if="uploadedFiles.length" class="uploaded-list">
                <span v-for="f in uploadedFiles" :key="f" class="uploaded-item">{{ f }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 80px" />
    </template>

  </div>
</template>

<script>
import { store } from '../store'

const DOW = ['일', '월', '화', '수', '목', '금', '토']

export default {
  name: 'MyView',
  data() {
    return {
      activeTab: 'tag_album',
      searchQuery: '',
      confirmedQuery: '',
      resultGroupByDate: false,
      toneStyle: localStorage.getItem('tone_style') || 'emotional',
      uploadedFiles: [],
      toneOptions: [
        {
          key: 'emotional',
          label: '감성적으로',
          example: '"벚꽃송이 노을, 오래 남을 것 같은 저녁"',
        },
        {
          key: 'news',
          label: '뉴스처럼',
          example: '남5명이 벚꽃앞에서 기념촬영을 했다. 누적된 피로에도 불구하고 밝은 표정으로 카메라를 응시하며, 기록 보존을 향한 강한 의지를 드러낸 현장이 포착되었다.',
        },
        {
          key: 'diary',
          label: '제목일기처럼',
          example: '[제목: 벚꽃 거들 뿐]\n인생샷 건지려다 잇몸 만개한 사진만 99장 남음. 꽃구경 핑계고 결국 우리의 수다가 본체였던 완벽한 봄날의 기록.',
        },
        {
          key: 'custom',
          label: '나만의 톤으로',
          example: '',
        },
      ],
    }
  },
  computed: {
    showResults() { return this.confirmedQuery.length > 0 },
    allRecords() {
      return [...store.records, ...store.todayRecords]
    },
    tagItems() {
      const map = {}
      for (const r of this.allRecords) {
        for (const tag of (r.categoryTags || [])) {
          if (!map[tag]) map[tag] = { count: 0, record: null }
          map[tag].count++
          if (!map[tag].record || r.date > map[tag].record.date) map[tag].record = r
        }
      }
      return Object.entries(map)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([tag, { count, record }]) => ({ tag, count, record }))
    },
    recommendedTags() {
      return this.tagItems.slice(0, 6).map(i => i.tag)
    },
    searchResults() {
      if (!this.confirmedQuery) return []
      const q = this.confirmedQuery.toLowerCase()
      return this.allRecords.filter(r =>
        (r.location || '').toLowerCase().includes(q) ||
        (r.aiRecord || '').toLowerCase().includes(q) ||
        (r.categoryTags || []).some(t => t.toLowerCase().includes(q)) ||
        (r.emotionTags || []).some(t => (t.label || '').toLowerCase().includes(q))
      )
    },
    searchResultGroups() {
      const map = {}
      for (const r of this.searchResults) {
        if (!map[r.date]) map[r.date] = []
        map[r.date].push(r)
      }
      return Object.keys(map).sort((a, b) => a > b ? -1 : 1).map(date => {
        const d = new Date(date)
        return {
          date,
          dateLabel: `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`,
          records: map[date],
        }
      })
    },
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.clearSearch()
    },
    focusSearch() {
      this.$nextTick(() => { this.$refs.searchInput && this.$refs.searchInput.focus() })
    },
    doSearch() {
      if (this.searchQuery.trim()) this.confirmedQuery = this.searchQuery.trim()
    },
    clearSearch() {
      this.searchQuery = ''
      this.confirmedQuery = ''
      this.resultGroupByDate = false
    },
    searchByTag(tag) {
      this.searchQuery = tag
      this.confirmedQuery = tag
    },
    selectTone(key) {
      this.toneStyle = key
      localStorage.setItem('tone_style', key)
    },
    pickFile() {
      this.$refs.fileInput && this.$refs.fileInput.click()
    },
    handleFiles(e) {
      const files = Array.from(e.target.files)
      this.uploadedFiles = [...new Set([...this.uploadedFiles, ...files.map(f => f.name)])]
    },
    thumbStyle(record) {
      if (!record) return { background: '#f0f0f0' }
      if (record.thumbnail) return { backgroundImage: `url(${record.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      return { background: record.gradient || '#f0f0f0' }
    },
  },
}
</script>

<style scoped>
.my { background: var(--bg); min-height: 100%; }

/* ─── Sticky Header ─────────────────────────── */
.my-header {
  position: sticky; top: 0; z-index: 20;
  background: var(--bg); border-bottom: 1px solid var(--border);
}
.my-title {
  font-size: 32px; font-weight: 600;
  color: var(--text); letter-spacing: -0.8px; padding: 48px 20px 0;
}

/* ─── 탭 ────────────────────────────────────── */
.my-tab-bar {
  display: flex; align-items: stretch;
  border-bottom: 1px solid var(--border); margin-top: 14px;
}
.my-tab {
  flex: 1; padding: 10px 0 12px;
  border: none; background: none; font-family: inherit;
  font-size: 14px; font-weight: 600; color: var(--text-sub);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s; letter-spacing: -0.16px;
}
.my-tab.active { color: var(--text); border-bottom-color: var(--accent); }
.my-tab-sep {
  width: 1px; background: var(--border);
  margin: 8px 0 4px; flex-shrink: 0;
}

/* ─── 검색 영역 ─────────────────────────────── */
.search-area { display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
.btn-ai {
  display: flex; align-items: center; gap: 5px; flex-shrink: 0;
  background: var(--accent); border: 1px solid var(--accent);
  border-radius: var(--radius-pill); padding: 8px 13px;
  font-size: 12px; font-weight: 600; font-family: inherit;
  color: #fff; cursor: pointer; -webkit-tap-highlight-color: transparent;
  letter-spacing: 0.6px; text-transform: uppercase; white-space: nowrap;
}
.btn-ai:active { background: var(--accent-hover); border-color: var(--accent-hover); }
.btn-back {
  width: 36px; height: 36px; flex-shrink: 0;
  border: 1px solid var(--border); background: var(--bg);
  border-radius: 50%; color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.btn-back:active { background: #f5f5f5; }
.search-box {
  flex: 1; display: flex; align-items: center;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 10px 14px; gap: 8px;
  transition: border-color 0.2s;
}
.search-box:focus-within { border-color: var(--accent); }
.search-input {
  flex: 1; border: none; background: none; outline: none;
  font-size: 14px; font-family: inherit; color: var(--text); letter-spacing: -0.16px;
}
.search-input::placeholder { color: var(--text-sub); }
.btn-x {
  border: none; background: var(--border); color: #fff;
  width: 17px; height: 17px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0; flex-shrink: 0;
}
.btn-search-icon {
  border: none; background: none; color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; padding: 0; flex-shrink: 0;
}

/* ─── 검색 결과 ─────────────────────────────── */
.result-meta-row {
  display: flex; align-items: center;
  justify-content: space-between; padding: 0 16px 12px;
}
.result-count { font-size: 13px; color: var(--text-sub); }
.result-count strong { color: var(--text); font-weight: 600; }
.result-view-btn {
  border: 1px solid var(--border); background: var(--bg);
  border-radius: var(--radius-pill); padding: 6px 14px;
  font-size: 12px; font-weight: 600; font-family: inherit;
  color: var(--text-sub); cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.result-view-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.result-date-group { margin-bottom: 8px; }
.result-date-label {
  font-size: 13px; font-weight: 600; text-transform: uppercase;
  color: var(--text-sub); letter-spacing: 1px; padding: 14px 16px 8px;
}

.photo-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 0 2px; }
.photo-cell { aspect-ratio: 1; background-size: cover; background-position: center; }

.no-result { display: flex; justify-content: center; padding: 60px 0; }
.no-result-text { font-size: 15px; color: var(--text-sub); }

/* ─── 추천 태그 ─────────────────────────────── */
.rec-tags-wrap { padding: 0 0 4px; }
.rec-tags-scroll {
  display: flex; gap: 7px;
  overflow-x: auto; padding: 4px 16px 8px;
  -webkit-overflow-scrolling: touch;
}
.rec-tags-scroll::-webkit-scrollbar { display: none; }
.rec-tag {
  flex-shrink: 0; border: 1px solid var(--border); background: var(--bg);
  border-radius: var(--radius-pill); padding: 7px 14px;
  font-size: 13px; font-weight: 500; font-family: inherit;
  color: var(--accent); cursor: pointer; white-space: nowrap;
  -webkit-tap-highlight-color: transparent; letter-spacing: -0.1px;
}
.rec-tag:active { background: var(--accent-light); border-color: rgba(20,110,245,0.25); }

/* ─── 태그 그리드 ───────────────────────────── */
.tag-area { padding: 4px 16px 0; }
.empty-tags {
  display: flex; flex-direction: column;
  align-items: center; padding: 60px 0; gap: 12px;
}
.empty-icon {
  width: 64px; height: 64px;
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-sub);
}
.empty-title { font-size: 17px; font-weight: 600; color: var(--text); letter-spacing: -0.16px; }
.empty-desc { font-size: 14px; color: var(--text-sub); text-align: center; line-height: 1.6; }

.tag-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.tag-card-outer {
  border-radius: var(--radius-xl);
  border: 1px solid var(--border); box-shadow: var(--shadow);
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.tag-card-outer:active { opacity: 0.85; }
.tag-card { border-radius: var(--radius-xl); overflow: hidden; background: var(--bg); position: relative; }
.tag-thumb { width: 100%; aspect-ratio: 1; background-size: cover; background-position: center; }
.tag-scrim {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 50%; pointer-events: none;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.25));
}
.tag-badge {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.52);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  color: #fff; font-size: 12px; font-weight: 700;
  padding: 3px 9px; border-radius: var(--radius);
  pointer-events: none; z-index: 1;
}
.tag-name-row { padding: 8px 12px 10px; background: var(--bg); }
.tag-name { font-size: 13px; font-weight: 600; color: var(--text); letter-spacing: -0.1px; }

/* ─── 멘트 설정 탭 ─────────────────────────── */
.tone-wrap { padding: 20px 16px 0; }
.tone-guide {
  font-size: 14px; font-weight: 400; color: var(--text-sub);
  letter-spacing: -0.16px; padding: 0 4px 16px; line-height: 1.5;
}
.tone-list { display: flex; flex-direction: column; gap: 8px; }
.tone-item {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 16px 18px;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: border-color 0.2s, background 0.2s;
}
.tone-item.active {
  border-color: var(--accent);
  background: var(--accent-light);
}
.tone-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.tone-item:last-child .tone-row { margin-bottom: 0; }
.tone-item.active:last-child .tone-row { margin-bottom: 14px; }
.radio-circle {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: var(--bg); border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.2s, background 0.2s;
}
.radio-circle.checked {
  background: var(--accent); border-color: var(--accent);
}
.radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
.tone-label { font-size: 15px; font-weight: 600; color: var(--text); letter-spacing: -0.16px; }
.tone-example {
  font-size: 13px; color: var(--text-sub);
  line-height: 1.65; letter-spacing: -0.16px;
  padding-left: 32px; white-space: pre-line;
}

/* ─── 나만의 톤 업로드 ─────────────────────── */
.custom-section { padding-left: 32px; display: flex; flex-direction: column; gap: 10px; }
.btn-learn {
  background: var(--accent); border: 1px solid var(--accent);
  border-radius: var(--radius-pill); padding: 10px 20px;
  font-size: 14px; font-weight: 600; font-family: inherit;
  color: #fff; cursor: pointer; align-self: flex-start;
  -webkit-tap-highlight-color: transparent; letter-spacing: -0.16px;
}
.btn-learn:active { background: var(--accent-hover); border-color: var(--accent-hover); }
.uploaded-list { display: flex; flex-wrap: wrap; gap: 6px; }
.uploaded-item {
  font-size: 12px; color: var(--text-sub);
  background: var(--bg); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 4px 10px;
}
</style>
