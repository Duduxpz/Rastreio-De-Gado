import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '../../constants';

export default function AnimalScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 18, color: colors.gray900 }}>Detalhes do animal {id}</Text>
    </View>
  );
}
