import { View, Text } from 'react-native';
import { colors, typography, spacing } from '../../constants';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const variantMap = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  danger: { bg: colors.dangerLight, text: colors.danger },
  info: { bg: colors.infoLight, text: colors.info },
  neutral: { bg: colors.gray100, text: colors.gray700 },
};

export function Badge({
  label,
  variant = 'neutral',
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const { bg, text } = variantMap[variant];
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 99,
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: text,
          fontSize: typography.xs,
          fontWeight: typography.semibold,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
