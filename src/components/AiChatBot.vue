<template>
  <div class="chatbot-overlay">
    <div class="chatbot-panel">

      <!-- 헤더 -->
      <div class="chat-header">
        <div class="chat-header-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <span class="chat-title">AI 검색</span>
        </div>
        <button class="btn-close" @click="$emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- 메시지 영역 -->
      <div class="chat-messages" ref="messagesEl">

        <!-- 웰컴 화면 -->
        <div v-if="!messages.length && !isStreaming" class="chat-welcome">
          <img src="/images/logo.png" class="welcome-logo" alt="Golden Record" />
          <p class="welcome-text">기록에서 무엇이든 찾아드릴게요</p>
          <p class="welcome-sub">날짜, 장소, 태그, 감정 등으로 검색해보세요</p>
          <div class="suggestion-chips">
            <button
              v-for="s in suggestions"
              :key="s"
              class="chip"
              @click="sendQuery(s)"
            >{{ s }}</button>
          </div>
        </div>

        <!-- 대화 메시지 -->
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['msg-row', msg.role]"
        >
          <div v-if="msg.role === 'assistant'" class="msg-avatar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div
            class="msg-bubble"
            v-html="msg.role === 'assistant' ? formatMessage(msg.content) : msg.content"
          />
        </div>

        <!-- 스트리밍 중 -->
        <div v-if="isStreaming" class="msg-row assistant">
          <div class="msg-avatar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="msg-bubble streaming">
            <span v-if="streamingText" v-html="formatMessage(streamingText)" />
            <span v-else class="typing-dots">
              <span /><span /><span />
            </span>
            <span v-if="streamingText" class="stream-cursor" />
          </div>
        </div>

      </div>

      <!-- 입력 영역 -->
      <div class="chat-input-wrap">
        <div class="chat-input-box">
          <input
            ref="inputEl"
            v-model="inputText"
            class="chat-input"
            placeholder="기록에 대해 물어보세요..."
            :disabled="isStreaming"
            @keyup.enter="sendMessage"
          />
          <button
            class="btn-send"
            :class="{ active: inputText.trim() && !isStreaming }"
            :disabled="!inputText.trim() || isStreaming"
            @click="sendMessage"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { store } from '../store'

const DIFY_API_URL = 'https://api.dify.ai/v1/chat-messages'
const DIFY_API_KEY = 'app-nrsrB2wc2erjLp51vnbuMpg9'

export default {
  name: 'AiChatBot',
  emits: ['close'],
  data() {
    return {
      messages: [],
      inputText: '',
      isStreaming: false,
      streamingText: '',
      conversationId: '',
      suggestions: [
        '벚꽃 사진 찾아줘',
        '마라톤 기록 보여줘',
        '가족 나들이 언제 갔어?',
        '아이 등원 기록 있어?',
        '강화도 여행은 언제야?',
      ],
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.$refs.inputEl && this.$refs.inputEl.focus()
      this.$refs.messagesEl.addEventListener('click', this.onMessageClick)
    })
  },
  beforeDestroy() {
    if (this.$refs.messagesEl) {
      this.$refs.messagesEl.removeEventListener('click', this.onMessageClick)
    }
  },
  methods: {

    /* ─── 기록 링크 클릭 처리 ─── */
    onMessageClick(e) {
      const link = e.target.closest('.record-link')
      if (!link) return
      e.preventDefault()
      e.stopPropagation()
      const id = link.dataset.id
      if (!id) return
      const record = this.findRecordById(id)
      if (record) {
        this.$emit('close')
        this.$nextTick(() => {
          this.$router.push({ path: '/timebridge', query: { date: record.date } })
        })
      }
    },

    findRecordById(id) {
      const all = [
        ...store.records,
        ...store.todayRecords,
        ...store.memoryRecords,
      ]
      return all.find(r => r.id === id) || null
    },

    /* ─── 기록 링크 생성 ─── */
    makeRecordLink(id) {
      const record = this.findRecordById(id)
      if (!record) return ''
      const d = new Date(record.date)
      const label = `${d.getMonth() + 1}월 ${d.getDate()}일 · ${record.location || ''}`
      return `<span class="record-link" data-id="${id}">📋 ${label}</span>`
    },

    /* ─── 응답 포맷팅 ─── */
    formatMessage(text) {
      if (!text) return ''

      let s = text

      // 1. /photos 가 포함된 줄 전체 제거
      s = s.replace(/^.*\/photos[^\n]*$/gm, '')

      // 2. 파일명 제거 (.jpg .jpeg .png)
      s = s.replace(/\b[\w/.-]+\.(jpe?g|png)\b/gi, '')

      // 3. "기록ID:" 라벨 제거 (ID만 남김)
      s = s.replace(/기록\s*ID?\s*[:：]\s*/gi, '')

      // 4. 제거로 생긴 과도한 빈 줄 정리
      s = s.replace(/\n{3,}/g, '\n\n')

      // 5. 기록 ID 전역 1회 치환 → 링크
      //    JS replace()는 치환 결과를 재처리하지 않으므로 data-id 속성 내 ID가 이중 치환되지 않음
      s = s.replace(/\b((?:hist|demo|mem)_[\w]+)\b/g, (match) => {
        return this.makeRecordLink(match)
      })

      // 6. 링크 span 직전의 빈 줄(\n\n) → 단순 줄바꿈(\n) 으로 축소
      s = s.replace(/\n\n(<span class="record-link")/g, '\n$1')

      // 7. 마크다운 헤딩
      s = s.replace(/^### (.+)$/gm, '<p class="md-h3">$1</p>')
      s = s.replace(/^## (.+)$/gm, '<p class="md-h2">$1</p>')
      s = s.replace(/^# (.+)$/gm, '<p class="md-h1">$1</p>')

      // 8. 볼드
      s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

      // 9. 리스트 아이템
      s = s.replace(/^(\d+)\. (.+)$/gm, '<span class="md-li">$1. $2</span>')
      s = s.replace(/^[•\-\*] (.+)$/gm, '<span class="md-li">· $1</span>')

      // 10. 단락 구분
      s = s.replace(/\n{2,}/g, '<br><br>')

      // 11. 단순 줄바꿈
      s = s.replace(/\n/g, '<br>')

      // 12. 연속 <br> 정리
      s = s.replace(/(<br>\s*){3,}/g, '<br><br>')

      // 13. 앞뒤 <br> 정리
      s = s.replace(/^(<br>)+|(<br>)+$/g, '')

      return s.trim()
    },

    /* ─── 검색어 칩 클릭 ─── */
    sendQuery(text) {
      this.inputText = text
      this.sendMessage()
    },

    /* ─── 메시지 전송 ─── */
    async sendMessage() {
      const query = this.inputText.trim()
      if (!query || this.isStreaming) return

      this.inputText = ''
      this.messages.push({ id: Date.now(), role: 'user', content: query })
      this.isStreaming = true
      this.streamingText = ''
      this.$nextTick(() => this.scrollToBottom())

      try {
        const logoUrl = window.location.origin + '/images/logo.png'

        const response = await fetch(DIFY_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {},
            query,
            response_mode: 'streaming',
            conversation_id: this.conversationId,
            user: 'golden-user',
            files: [
              {
                type: 'image',
                transfer_method: 'remote_url',
                url: logoUrl,
              },
            ],
          }),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop()

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const raw = line.slice(6).trim()
            if (!raw || raw === '[DONE]') continue

            try {
              const parsed = JSON.parse(raw)
              if (parsed.event === 'message') {
                this.streamingText += parsed.answer || ''
                this.$nextTick(() => this.scrollToBottom())
              } else if (parsed.event === 'message_end') {
                if (parsed.conversation_id) {
                  this.conversationId = parsed.conversation_id
                }
              } else if (parsed.event === 'error') {
                throw new Error(parsed.message || 'API 오류')
              }
            } catch (e) {
              // JSON 파싱 실패 무시
            }
          }
        }

        if (this.streamingText) {
          this.messages.push({
            id: Date.now(),
            role: 'assistant',
            content: this.streamingText,
          })
        }

      } catch (e) {
        console.error('[AiChatBot] 오류:', e)
        this.messages.push({
          id: Date.now(),
          role: 'assistant',
          content: '죄송해요, 일시적인 오류가 발생했어요. 다시 시도해주세요.',
        })
      } finally {
        this.isStreaming = false
        this.streamingText = ''
        this.$nextTick(() => this.scrollToBottom())
      }
    },

    scrollToBottom() {
      const el = this.$refs.messagesEl
      if (el) el.scrollTop = el.scrollHeight
    },
  },
}
</script>

<style scoped>
/* ─── 오버레이: GNB(z-index:200) 위에 ─── */
.chatbot-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: var(--bg);
  display: flex; flex-direction: column;
}
.chatbot-panel {
  display: flex; flex-direction: column;
  height: 100%;
}

/* ─── 헤더 ─── */
.chat-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
}
.chat-header-left {
  display: flex; align-items: center; gap: 7px;
  background: linear-gradient(90deg, #146ef5 0%, #8B5CF6 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.chat-title {
  font-size: 16px; font-weight: 700; letter-spacing: -0.3px;
}
.btn-close {
  width: 36px; height: 36px;
  border: 1px solid var(--border); background: var(--bg);
  border-radius: 50%; color: var(--text-sub);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.btn-close:active { background: #f5f5f5; }

/* ─── 메시지 영역 ─── */
.chat-messages {
  flex: 1; overflow-y: auto;
  padding: 20px 16px 12px;
  display: flex; flex-direction: column; gap: 12px;
  -webkit-overflow-scrolling: touch;
}
.chat-messages::-webkit-scrollbar { display: none; }

/* ─── 웰컴 ─── */
.chat-welcome {
  display: flex; flex-direction: column;
  align-items: center; text-align: center;
  padding: 40px 0 20px; gap: 8px;
}
.welcome-logo { height: 40px; width: auto; object-fit: contain; margin-bottom: 8px; }
.welcome-text { font-size: 17px; font-weight: 700; color: var(--text); letter-spacing: -0.4px; }
.welcome-sub { font-size: 13px; color: var(--text-sub); line-height: 1.5; letter-spacing: -0.1px; }
.suggestion-chips {
  display: flex; flex-wrap: wrap; gap: 8px;
  justify-content: center; margin-top: 16px;
}
.chip {
  border: 1px solid var(--border); background: var(--bg);
  border-radius: var(--radius-pill); padding: 8px 15px;
  font-size: 13px; font-weight: 500; font-family: inherit;
  color: var(--accent); cursor: pointer; letter-spacing: -0.1px;
  -webkit-tap-highlight-color: transparent;
}
.chip:active { background: var(--accent-light); border-color: rgba(20,110,245,0.3); }

/* ─── 메시지 버블 ─── */
.msg-row { display: flex; align-items: flex-end; gap: 8px; }
.msg-row.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #146ef5 0%, #8B5CF6 100%);
  display: flex; align-items: center; justify-content: center;
  color: #fff; margin-bottom: 2px;
}
.msg-bubble {
  max-width: 80%;
  padding: 11px 14px;
  border-radius: 16px;
  font-size: 14px; line-height: 1.7; letter-spacing: -0.16px;
  word-break: break-word;
}
.msg-row.assistant .msg-bubble {
  background: var(--bg); border: 1px solid var(--border);
  border-bottom-left-radius: 4px; color: var(--text);
}
.msg-row.user .msg-bubble {
  background: linear-gradient(135deg, #146ef5 0%, #8B5CF6 100%);
  border-bottom-right-radius: 4px; color: #fff;
}

/* 마크다운 스타일 (assistant 버블 안) — Vue 2: ::v-deep */
.msg-row.assistant .msg-bubble ::v-deep .md-h1 { font-size: 15px; font-weight: 700; margin: 8px 0 4px; }
.msg-row.assistant .msg-bubble ::v-deep .md-h2 { font-size: 14px; font-weight: 700; margin: 6px 0 3px; }
.msg-row.assistant .msg-bubble ::v-deep .md-h3 { font-size: 13px; font-weight: 600; color: var(--text-sub); margin: 4px 0 2px; }
.msg-row.assistant .msg-bubble ::v-deep .md-li { display: block; padding-left: 10px; margin: 3px 0; }

/* 기록 링크 */
.msg-row.assistant .msg-bubble ::v-deep .record-link {
  display: inline;
  color: #146ef5;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.msg-row.assistant .msg-bubble ::v-deep .record-link:active {
  color: #0055d4;
}

/* ─── 스트리밍 ─── */
.msg-bubble.streaming {
  border: 1px solid var(--border); color: var(--text);
  background: var(--bg); border-bottom-left-radius: 4px;
}
.stream-cursor {
  display: inline-block; width: 2px; height: 14px;
  background: var(--accent); margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.8s step-end infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

.typing-dots { display: inline-flex; gap: 4px; align-items: center; height: 14px; }
.typing-dots span {
  display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  background: var(--text-sub);
  animation: dotBounce 1.2s ease-in-out infinite;
}
.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}

/* ─── 입력 영역 ─── */
.chat-input-wrap {
  padding: 10px 16px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 10px);
  border-top: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
}
.chat-input-box {
  display: flex; align-items: center; gap: 10px;
  background: var(--bg); border: 1.5px solid var(--border);
  border-radius: var(--radius-pill); padding: 8px 8px 8px 18px;
  transition: border-color 0.2s;
}
.chat-input-box:focus-within { border-color: var(--accent); }
.chat-input {
  flex: 1; border: none; background: none; outline: none;
  font-size: 14px; font-family: inherit; color: var(--text);
  letter-spacing: -0.16px; min-height: 22px;
}
.chat-input::placeholder { color: var(--text-sub); }
.chat-input:disabled { opacity: 0.5; }
.btn-send {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  border: none; background: var(--border); color: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: background 0.2s; padding: 0;
}
.btn-send.active { background: linear-gradient(135deg, #146ef5 0%, #8B5CF6 100%); }
.btn-send:disabled { cursor: default; }
</style>
