import { View, Text } from 'react-native';
import { colors, spacing } from '../../constants';

export default function RelatoriosScreen() {
  return (
    <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 18, color: colors.gray900 }}>Relatórios em desenvolvimento...</Text>
    </View>
  );
}
