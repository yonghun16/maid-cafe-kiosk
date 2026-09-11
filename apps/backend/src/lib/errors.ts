// @owner: ai
import mongoose from 'mongoose';

/**
 * MongoDB 중복 키 오류(E11000)인지 확인합니다. 스키마에 `unique: true`가
 * 걸린 필드(예: 카테고리 이름)에 이미 있는 값을 저장하려 할 때 발생합니다.
 */
export function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

/**
 * catch 블록에서 받은 오류로부터 사용자에게 보여줄 구체적인 메시지를
 * 만듭니다. Mongoose 검증 오류(필수 필드 누락, enum 값 오류 등)면 어떤
 * 필드가 왜 잘못됐는지를 기본 메시지에 덧붙이고, 그 외의 오류는 기본
 * 메시지를 그대로 씁니다. 요청 바디 검증을 Mongoose 스키마에만 의존해
 * 실패 원인이 사용자에게 전달되지 않던 문제(기획서의 "알려진 제약")를
 * 보완하기 위해 씁니다.
 * @param err - catch 블록에서 받은 오류
 * @param fallback - 원인을 알 수 없을 때 쓸 기본 메시지
 */
export function toClientErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors)
      .map((fieldError) => fieldError.message)
      .join(' ');
    return `${fallback} (${details})`;
  }
  return fallback;
}
