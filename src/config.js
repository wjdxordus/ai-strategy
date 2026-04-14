// API 설정 - 환경변수 또는 Railway 설정에서 읽음
export const CONFIG = {
  // Dify API 설정
  DIFY_BASE_URL: 'https://api.dify.ai/v1',
  DIFY_API_KEY: 'app-ZZNXO6hqHb6jf8qUxvZZ6Jf1',  // 파일 업로드 + 사진 분석 워크플로우 키
  DIFY_BESTCUT_WORKFLOW_KEY: 'app-UzjYWrmKQICi5zais3zVrFYL',  // 베스트컷 선정 워크플로우 키
  DIFY_PHOTO_AGENT_KEY: '',   // TODO: 기존 사진 선정 Agent (미사용)
  DIFY_RECORD_AGENT_KEY: '',  // TODO: 기존 기록 생성 Agent (미사용)

  // Open-Meteo (무료, API Key 불필요)
  OPEN_METEO_URL: 'https://api.open-meteo.com/v1/forecast',

  // 위치 그룹 최대 개수
  MAX_PHOTO_GROUPS: 5,
}
