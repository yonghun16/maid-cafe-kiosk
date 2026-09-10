// @owner: ai
import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './getErrorMessage';

function makeAxiosError(message?: string): AxiosError {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    {
      status: 400,
      statusText: 'Bad Request',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
      data: message ? { message } : {},
    },
  );
}

describe('getErrorMessage', () => {
  it('서버가 보낸 message가 있으면 그대로 반환한다', () => {
    const error = makeAxiosError('이미 있는 카테고리입니다.');
    expect(getErrorMessage(error, '기본 메시지')).toBe('이미 있는 카테고리입니다.');
  });

  it('서버 응답에 message가 없으면 기본 메시지를 반환한다', () => {
    const error = makeAxiosError();
    expect(getErrorMessage(error, '기본 메시지')).toBe('기본 메시지');
  });

  it('axios 에러가 아니면 기본 메시지를 반환한다', () => {
    expect(getErrorMessage(new Error('네트워크 오류'), '기본 메시지')).toBe('기본 메시지');
    expect(getErrorMessage('문자열 에러', '기본 메시지')).toBe('기본 메시지');
    expect(getErrorMessage(undefined, '기본 메시지')).toBe('기본 메시지');
  });
});
