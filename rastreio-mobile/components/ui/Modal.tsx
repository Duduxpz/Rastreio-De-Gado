import { ReactNode } from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../constants';

interface ModalProps {
  readonly visible: boolean;
  readonly title: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly onClose: () => void;
}

export function Modal({ visible, title, children, footer, onClose }: ModalProps) {
  return (
    <RNModal animationType="slide" transparent visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.35)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            padding: spacing.lg,
          }}
        >
          <View style={{ marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: typography.lg, fontWeight: typography.bold, color: colors.gray900 }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: spacing.sm }}>
              <Text style={{ color: colors.danger, fontWeight: typography.semibold }}>Fechar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer && <View style={{ marginTop: spacing.lg }}>{footer}</View>}
        </View>
      </View>
    </RNModal>
  );
}
