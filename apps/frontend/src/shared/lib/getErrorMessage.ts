// @owner: ai
import axios from 'axios';

/**
 * 서버가 응답에 실어 보낸 에러 메시지를 꺼냅니다. 없으면 기본 메시지를
 * 씁니다. "이미 있는 카테고리" 같은 뭉뚱그린 추측 대신, 실제로 무엇이
 * 잘못됐는지(예: "관리자 인증이 필요합니다.") 그대로 보여주기 위함입니다.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
}
