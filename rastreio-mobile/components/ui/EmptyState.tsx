import { View, Text, TouchableOpacity } from 'react-native';
import { colors, typography, spacing } from '../../constants';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View
      style={{
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray300,
      }}
    >
      <Text style={{ fontSize: typography.xxl, marginBottom: spacing.md }}>🐄</Text>
      <Text
        style={{
          fontSize: typography.lg,
          fontWeight: typography.semibold,
          color: colors.gray900,
          marginBottom: spacing.sm,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: typography.sm,
          color: colors.gray700,
          textAlign: 'center',
          marginBottom: spacing.lg,
          maxWidth: 300,
        }}
      >
        {description}
      </Text>
      <TouchableOpacity
        onPress={onAction}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          borderRadius: 999,
        }}
      >
        <Text style={{ color: colors.white, fontWeight: typography.semibold }}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
