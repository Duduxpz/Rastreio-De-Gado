import { View, ViewStyle } from 'react-native';
import { colors, spacing } from '../../constants';

interface CardProps {
  readonly children: React.ReactNode;
  readonly style?: ViewStyle;
  readonly variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: readonly CardProps) {
  const styles: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    ...(variant === 'elevated' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    }),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: colors.gray300,
    }),
  };
  return <View style={[styles, style]}>{children}</View>;
}
