// @owner: ai
import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';
import { resetIdleTimer } from '../lib/idleTimer';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * 화면 중앙에 뜨는 범용 모달입니다. 바깥 영역을 누르면 닫히고, 안쪽
 * 콘텐츠를 눌러도 닫히지 않습니다. 웹의 `shared/ui/Modal`과 같은 역할을
 * 합니다.
 *
 * ✅ RN `Modal`은 별도 네이티브 화면으로 떠서, 세션 타임아웃용 유휴
 * 타이머가 최상위 화면에만 붙어 있으면 모달 안에서의 조작(옵션 선택 등)을
 * 놓칩니다. `onStartShouldSetResponderCapture`로 이 모달 안의 모든
 * 터치에서 타이머를 갱신하되, 항상 `false`를 반환해 실제 터치 처리(배경
 * 클릭 닫기, 안쪽 버튼 등)는 그대로 자식에게 넘깁니다([[세션타임아웃]]
 * 참고).
 */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View
        className="flex-1"
        onStartShouldSetResponderCapture={() => {
          resetIdleTimer();
          return false;
        }}
      >
        <Pressable className="flex-1 items-center justify-center bg-black/50 p-4" onPress={onClose}>
          <Pressable onPress={() => {}} className="w-full max-w-md rounded-2xl bg-white p-6 md:max-w-4xl md:p-12">
            {title && (
              <View className="mb-4 flex-row items-center justify-between md:mb-10">
                <Text className="text-lg font-bold text-gray-800 md:text-4xl">{title}</Text>
                <Pressable onPress={onClose} hitSlop={8}>
                  <Text className="text-xl text-gray-400 md:text-4xl">✕</Text>
                </Pressable>
              </View>
            )}
            {children}
          </Pressable>
        </Pressable>
      </View>
    </RNModal>
  );
}
