import { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAnimais } from '../../src/hooks/useAnimais';
import { useSync } from '../../src/hooks/useSync';
import { AnimalCard } from '../../components/AnimalCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, typography } from '../../constants';
import type { Categoria } from '../../src/types';

const categorias: Categoria[] = ['bezerro', 'novilha', 'vaca', 'touro', 'boi', 'outro'];

export default function AnimaisScreen() {
  const router = useRouter();
  const { animais, loading } = useAnimais();
  const { running: syncRunning, lastRun, processNow } = useSync({ intervalMs: 30000 });
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | ''>('');

  const animaisFiltrados = useMemo(
    () =>
      animais.filter((animal) => {
        const searchText = search.trim().toLowerCase();
        const matchSearch =
          animal.brinco.toLowerCase().includes(searchText) ||
          (animal.raca?.toLowerCase().includes(searchText) ?? false);
        const matchCategoria = categoriaFiltro === '' || animal.categoria === categoriaFiltro;
        return (searchText.length === 0 || matchSearch) && matchCategoria;
      }),
    [animais, search, categoriaFiltro]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
      <SectionHeader
        title="Animais"
        description="Gerencie seu rebanho como no site — filtros, busca e cadastro rápido."
      />

      <Card style={{ marginBottom: spacing.lg }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: typography.sm,
                color: colors.gray700,
                marginBottom: spacing.xs,
              }}
            >
              Busca
            </Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por brinco ou raça"
              placeholderTextColor={colors.gray500}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.gray300,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                color: colors.gray900,
              }}
            />
          </View>
          <Button label="Cadastro" onPress={() => router.push('cadastro')} variant="secondary" />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Pressable
            onPress={() => setCategoriaFiltro('')}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.sm,
              borderRadius: 999,
              backgroundColor: categoriaFiltro === '' ? colors.primary : colors.surface,
              borderWidth: 1,
              borderColor: colors.gray300,
              marginRight: spacing.sm,
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ color: categoriaFiltro === '' ? colors.white : colors.gray900 }}>Todas</Text>
          </Pressable>
          {categorias.map((categoria) => (
            <Pressable
              key={categoria}
              onPress={() => setCategoriaFiltro(categoria)}
              style={{
                paddingVertical: spacing.xs,
                paddingHorizontal: spacing.sm,
                borderRadius: 999,
                backgroundColor: categoriaFiltro === categoria ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: colors.gray300,
                marginRight: spacing.sm,
                marginBottom: spacing.sm,
              }}
            >
              <Text style={{ color: categoriaFiltro === categoria ? colors.white : colors.gray900 }}>
                {categoria}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.sm,
          }}
        >
          <Text style={{ color: colors.gray700, fontSize: typography.sm }}>
            {animaisFiltrados.length} animais
          </Text>
          <Button
            label={syncRunning ? 'Sincronizando...' : 'Sincronizar' }
            onPress={processNow}
            variant={syncRunning ? 'ghost' : 'primary'}
          />
        </View>
        <Text style={{ color: colors.gray500, fontSize: typography.xs }}>
          Última sincronização: {lastRun ? new Date(lastRun).toLocaleTimeString() : 'Aguardando'}
        </Text>
      </Card>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.gray700 }}>Carregando animais...</Text>
        </View>
      ) : animaisFiltrados.length === 0 ? (
        <EmptyState
          title={search || categoriaFiltro ? 'Nenhum animal encontrado' : 'Nenhum animal cadastrado'}
          description={
            search || categoriaFiltro
              ? 'Ajuste sua busca ou remova os filtros para ver mais resultados.'
              : 'Comece cadastrando seu primeiro animal para manter o rebanho sob controle.'
          }
          actionLabel="Cadastrar animal"
          onAction={() => router.push('cadastro')}
        />
      ) : (
        <FlatList
          data={animaisFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnimalCard animal={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: spacing.xxl }}
        />
      )}
    </View>
  );
}
