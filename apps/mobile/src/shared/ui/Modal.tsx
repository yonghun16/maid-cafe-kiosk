// @owner: ai
import type { ReactNode } from 'react';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';

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
 */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <RNModal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
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
    </RNModal>
  );
}
