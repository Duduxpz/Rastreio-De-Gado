import { View, Text } from 'react-native';
import { colors, spacing, typography } from '../../constants';

interface SectionHeaderProps {
  readonly title: string;
  readonly description?: string;
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={{ fontSize: typography.xl, fontWeight: typography.bold, color: colors.gray900 }}>{title}</Text>
      {description ? (
        <Text style={{ marginTop: spacing.xs, color: colors.gray700, fontSize: typography.sm }}>{description}</Text>
      ) : null}
    </View>
  );
}
