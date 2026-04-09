// API 설정 - 환경변수 또는 Railway 설정에서 읽음
export const CONFIG = {
  // Dify API 설정 (사진 선정 Agent, 기록 생성 Agent)
  DIFY_BASE_URL: 'https://api.dify.ai/v1',
  DIFY_PHOTO_AGENT_KEY: '',   // TODO: Dify 사진 선정 Agent API Key
  DIFY_RECORD_AGENT_KEY: '',  // TODO: Dify 기록 생성 Agent API Key

  // Open-Meteo (무료, API Key 불필요)
  OPEN_METEO_URL: 'https://api.open-meteo.com/v1/forecast',

  // 위치 그룹 최대 개수
  MAX_PHOTO_GROUPS: 5,
}
