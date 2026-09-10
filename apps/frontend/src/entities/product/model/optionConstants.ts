// @owner: ai
import type { TemperatureOption } from '@repo/types';

/**
 * "HOT / ICE" 온도 옵션의 선택지. `product.temperatureOption`이
 * `'BOTH'`인 메뉴에서만 콤보박스로 노출됩니다([[옵션조합관리]] 참고).
 * 가격에는 영향이 없습니다.
 */
export const TEMPERATURE_OPTIONS = ['HOT', 'ICE'] as const;
export type Temperature = (typeof TEMPERATURE_OPTIONS)[number];

/**
 * 관리자가 메뉴 추가/수정 폼에서 고르는 온도 옵션 4가지(없음 포함).
 * 카레처럼 HOT만 있거나 에이드처럼 ICE만 있는 메뉴는 굳이 고객에게
 * 고르게 하지 않고 `'HOT'`/`'ICE'`로 고정할 수 있습니다([[옵션조합관리]]
 * 참고).
 */
export const TEMPERATURE_OPTION_CHOICES: { value: TemperatureOption | ''; label: string }[] = [
  { value: '', label: '온도 옵션 없음' },
  { value: 'BOTH', label: 'HOT/ICE' },
  { value: 'HOT', label: 'HOT만' },
  { value: 'ICE', label: 'ICE만' },
];

/**
 * 온도를 "ICE"로 골랐을 때만 추가로 나타나는 얼음양 선택지. 가격에는
 * 영향이 없고, HOT을 고르거나 온도를 선택하지 않으면 노출되지
 * 않습니다([[옵션조합관리]] 참고).
 */
export const ICE_AMOUNT_OPTIONS = ['적게', '적당', '많이'] as const;
export type IceAmount = (typeof ICE_AMOUNT_OPTIONS)[number];

/**
 * "마법의 주문" 옵션에서 고를 수 있는 항목들. 메이드 카페 컨셉의
 * 재미 요소로, 음료/음식에 추가금이나 실제 구성 변화는 없고 직원이
 * 서빙할 때 외쳐주는 주문(スペル)을 고객이 고르는 용도입니다.
 * `product.hasMagicSpellOption`이 켜진 메뉴에서만 드롭다운으로
 * 노출됩니다([[옵션조합관리]] 참고).
 */
export const MAGIC_SPELL_OPTIONS = ['모에모에뀽', '오이시쿠나레', '냥냥쿵', '하피네스차지!'] as const;
