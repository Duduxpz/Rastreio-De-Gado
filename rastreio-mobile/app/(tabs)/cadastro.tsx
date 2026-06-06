import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { colors, spacing, typography } from '../../constants';
import { animalSchema, type AnimalFormValues } from '../../src/validators/animal';
import { useAnimais } from '../../src/hooks/useAnimais';

const categorias = ['bezerro', 'novilha', 'vaca', 'touro', 'boi', 'outro'] as const;
const sexos = ['M', 'F'] as const;

export default function CadastroScreen() {
  const router = useRouter();
  const { create } = useAnimais();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnimalFormValues>({
    defaultValues: {
      brinco: '',
      raca: '',
      sexo: 'M',
      data_nascimento: '',
      categoria: 'bezerro',
      lote: '',
      pasto: '',
      peso_atual: '',
    },
  });

  async function onSubmit(values: AnimalFormValues) {
    const parsed = animalSchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    await create(parsed.data);
    router.back();
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.lg }}>
      <SectionHeader title="Cadastro de Animal" description="Use os mesmos dados do site para registrar um novo animal." />
      <Card>
        <Controller
          control={control}
          name="brinco"
          render={({ field: { value, onChange } }) => (
            <Input label="Brinco" value={value} onChangeText={onChange} error={errors.brinco?.message} />
          )}
        />
        <Controller
          control={control}
          name="raca"
          render={({ field: { value, onChange } }) => (
            <Input label="Raça" value={value} onChangeText={onChange} error={errors.raca?.message} />
          )}
        />
        <View style={{ flexDirection: 'row', columnGap: 0 }}>
          <Controller
            control={control}
            name="sexo"
            render={({ field: { value, onChange } }) => (
              <Card style={{ flex: 1, padding: spacing.sm }}>
                <Text style={{ color: colors.gray700, marginBottom: spacing.xs }}>Sexo</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {sexos.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => onChange(item)}
                      style={{
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderRadius: 999,
                        backgroundColor: value === item ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: colors.gray300,
                      }}
                    >
                      <Text style={{ color: value === item ? colors.white : colors.gray900 }}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            )}
          />
          <Controller
            control={control}
            name="categoria"
            render={({ field: { value, onChange } }) => (
              <Card style={{ flex: 1, padding: spacing.sm }}>
                <Text style={{ color: colors.gray700, marginBottom: spacing.xs }}>Categoria</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {categorias.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => onChange(item)}
                      style={{
                        paddingVertical: spacing.sm,
                        paddingHorizontal: spacing.md,
                        borderRadius: 999,
                        backgroundColor: value === item ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: colors.gray300,
                      }}
                    >
                      <Text style={{ color: value === item ? colors.white : colors.gray900 }}>{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>
            )}
          />
        </View>
        <Controller
          control={control}
          name="data_nascimento"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Data de Nascimento"
              placeholder="YYYY-MM-DD"
              value={value}
              onChangeText={onChange}
              error={errors.data_nascimento?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="peso_atual"
          render={({ field: { value, onChange } }) => (
            <Input
              label="Peso (kg)"
              keyboardType="numeric"
              value={value}
              onChangeText={onChange}
              error={errors.peso_atual?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="lote"
          render={({ field: { value, onChange } }) => (
            <Input label="Lote" value={value} onChangeText={onChange} error={errors.lote?.message} />
          )}
        />
        <Controller
          control={control}
          name="pasto"
          render={({ field: { value, onChange } }) => (
            <Input label="Pasto" value={value} onChangeText={onChange} error={errors.pasto?.message} />
          )}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }}>
          <Button label="Cancelar" onPress={() => router.back()} variant="ghost" />
          <Button label="Salvar" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>
      </Card>
    </ScrollView>
  );
}
