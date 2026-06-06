import { TouchableOpacity, View, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { Badge } from './ui/Badge';
import { colors, typography, spacing } from '../constants';
import type { Animal } from '../types';

interface AnimalCardProps {
  animal: Animal;
}

function categoriaParaBadge(
  categoria?: string
): 'success' | 'info' | 'warning' | 'neutral' {
  const map: Record<string, 'success' | 'info' | 'warning' | 'neutral'> = {
    bezerro: 'info',
    novilha: 'success',
    vaca: 'success',
    touro: 'warning',
    boi: 'neutral',
  };
  return map[categoria ?? ''] ?? 'neutral';
}

export function AnimalCard({ animal }: AnimalCardProps) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/animal/${animal.id}`)}
      activeOpacity={0.8}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Avatar */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          backgroundColor: colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {animal.foto_url ? (
          <Image source={{ uri: animal.foto_url }} style={{ width: 48, height: 48 }} />
        ) : (
          <Text style={{ fontSize: 22 }}>🐄</Text>
        )}
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: typography.md,
              fontWeight: typography.semibold,
              color: colors.gray900,
            }}
          >
            Brinco {animal.brinco}
          </Text>
          {!animal.synced && (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.accent,
              }}
            />
          )}
        </View>
        <Text
          style={{
            fontSize: typography.sm,
            color: colors.gray500,
            marginBottom: 6,
          }}
        >
          {animal.raca ?? 'Raça não informada'} · {animal.lote ?? 'Sem lote'}
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <Badge
            label={animal.categoria ?? 'Animal'}
            variant={categoriaParaBadge(animal.categoria)}
          />
          {animal.peso_atual && (
            <Badge label={`${animal.peso_atual} kg`} variant="neutral" />
          )}
        </View>
      </View>

      {/* Seta */}
      <Text style={{ color: colors.gray300, fontSize: 18 }}>›</Text>
    </TouchableOpacity>
  );
}
