import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '../../constants';

interface ButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
}

const variantStyles = {
  primary: { bg: colors.primary, text: colors.white, border: 'transparent' },
  secondary: {
    bg: colors.primaryLight,
    text: colors.primaryDark,
    border: colors.primary,
  },
  ghost: { bg: 'transparent', text: colors.gray700, border: colors.gray300 },
  danger: { bg: colors.danger, text: colors.white, border: 'transparent' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  fullWidth,
}: readonly ButtonProps) {
  const s = variantStyles[variant];
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={{
        backgroundColor: s.bg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: s.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: spacing.sm,
        opacity: disabled ? 0.5 : 1,
        ...(fullWidth && { width: '100%' }),
      }}
    >
      {loading && <ActivityIndicator size="small" color={s.text} />}
      <Text
        style={{
          color: s.text,
          fontSize: typography.base,
          fontWeight: typography.semibold,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
