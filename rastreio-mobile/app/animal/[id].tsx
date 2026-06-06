import { useState } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useAnimalDetail } from '../../src/hooks/useAnimalDetail';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { colors, spacing, typography } from '../../constants';
import { pesagemSchema, type PesagemFormValues } from '../../src/validators/pesagem';
import { vacinacaoSchema, type VacinacaoFormValues } from '../../src/validators/vacinacao';
import { zodResolver } from '@hookform/resolvers/zod';

const statusVariant = (ativo?: boolean) => (ativo ? 'success' : 'danger');

export default function AnimalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const animalId = String(params.id ?? '');
  const [showVacModal, setShowVacModal] = useState(false);
  const [showPesModal, setShowPesModal] = useState(false);
  const { animal, vacinacoes, pesagens, loading, addVacinacao, addPesagem } = useAnimalDetail(animalId);

  const {
    control: vacControl,
    handleSubmit: handleSubmitVac,
    formState: { errors: vacErrors, isSubmitting: vacSubmitting },
    reset: resetVac,
  } = useForm<VacinacaoFormValues>({
    resolver: zodResolver(vacinacaoSchema),
    defaultValues: {
      vacina: '',
      data: '',
      dose: '',
      veterinario: '',
      proxima_dose: '',
    },
  });

  const {
    control: pesControl,
    handleSubmit: handleSubmitPes,
    formState: { errors: pesErrors, isSubmitting: pesSubmitting },
    reset: resetPes,
  } = useForm<PesagemFormValues>({
    resolver: zodResolver(pesagemSchema),
    defaultValues: {
      peso: '',
      data: '',
      observacao: '',
    },
  });

  const onSubmitVac = async (values: VacinacaoFormValues) => {
    await addVacinacao(values);
    resetVac();
    setShowVacModal(false);
  };

  const onSubmitPes = async (values: PesagemFormValues) => {
    await addPesagem(values);
    resetPes();
    setShowPesModal(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.gray700 }}>Carregando detalhes do animal...</Text>
      </View>
    );
  }

  if (!animal) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: spacing.lg }}>
        <EmptyState
          title="Animal não encontrado"
          description="Verifique se o animal foi cadastrado ou sincronizado corretamente."
          actionLabel="Voltar"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const lastPesagem = pesagens[0];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
        <SectionHeader title={`Brinco ${animal.brinco}`} description={animal.raca || 'Animal cadastrado na fazenda'} />

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.sm, color: colors.gray700, marginBottom: spacing.xs }}>Informações Básicas</Text>
          <View>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Raça</Text>
              <Text style={{ fontSize: typography.md, fontWeight: typography.semibold, color: colors.gray900 }}>{animal.raca || '-'}</Text>
            </View>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Sexo</Text>
              <Text style={{ fontSize: typography.md, fontWeight: typography.semibold, color: colors.gray900 }}>{animal.sexo === 'M' ? 'Macho' : 'Fêmea'}</Text>
            </View>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Categoria</Text>
              <Badge label={animal.categoria || 'N/A'} variant="info" />
            </View>
            <View>
              <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Status</Text>
              <Badge label={animal.ativo ? 'Ativo' : 'Inativo'} variant={statusVariant(animal.ativo)} />
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.sm, color: colors.gray700, marginBottom: spacing.xs }}>Localização</Text>
          <View>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Lote</Text>
              <Text style={{ fontSize: typography.md, fontWeight: typography.semibold, color: colors.gray900 }}>{animal.lote || '-'}</Text>
            </View>
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Pasto</Text>
              <Text style={{ fontSize: typography.md, fontWeight: typography.semibold, color: colors.gray900 }}>{animal.pasto || '-'}</Text>
            </View>
            <View>
              <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Data de Nascimento</Text>
              <Text style={{ fontSize: typography.md, fontWeight: typography.semibold, color: colors.gray900 }}>{animal.data_nascimento ? new Date(animal.data_nascimento).toLocaleDateString('pt-BR') : '-'}</Text>
            </View>
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: typography.sm, color: colors.gray700, marginBottom: spacing.xs }}>Peso</Text>
          <Text style={{ fontSize: 48, fontWeight: typography.bold, color: colors.primary, marginBottom: spacing.sm }}>{animal.peso_atual ?? '?'} kg</Text>
          <Text style={{ fontSize: typography.xs, color: colors.gray500 }}>Última pesagem registrada</Text>
          {lastPesagem ? (
            <Text style={{ fontSize: typography.xs, color: colors.gray500, marginTop: spacing.xs }}>{new Date(lastPesagem.data).toLocaleDateString('pt-BR')}</Text>
          ) : null}
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.gray900 }}>💉 Vacinações</Text>
            <Button label="Adicionar" onPress={() => setShowVacModal(true)} variant="secondary" />
          </View>
          {vacinacoes.length === 0 ? (
            <Text style={{ color: colors.gray500 }}>Nenhuma vacinação registrada</Text>
          ) : (
            vacinacoes.map((vac) => (
              <View key={vac.id} style={{ marginBottom: spacing.md, padding: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: 12 }}>
                <Text style={{ fontWeight: typography.semibold, color: colors.gray900 }}>{vac.vacina}</Text>
                <Text style={{ color: colors.gray500 }}>{new Date(vac.data).toLocaleDateString('pt-BR')}</Text>
                <Text style={{ color: colors.gray700 }}>{vac.dose || 'Dose não informada'}</Text>
                <Text style={{ color: colors.gray700 }}>{vac.veterinario || 'Veterinário não informado'}</Text>
                <Text style={{ color: colors.gray500 }}>{vac.proxima_dose ? `Próxima: ${new Date(vac.proxima_dose).toLocaleDateString('pt-BR')}` : 'Sem próxima dose'}</Text>
              </View>
            ))
          )}
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.gray900 }}>⚖️ Pesagens</Text>
            <Button label="Adicionar" onPress={() => setShowPesModal(true)} variant="secondary" />
          </View>
          {pesagens.length === 0 ? (
            <Text style={{ color: colors.gray500 }}>Nenhuma pesagem registrada</Text>
          ) : (
            pesagens.map((pes) => (
              <View key={pes.id} style={{ marginBottom: spacing.md, padding: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: 12 }}>
                <Text style={{ fontWeight: typography.semibold, color: colors.gray900 }}>{`${pes.peso} kg`}</Text>
                <Text style={{ color: colors.gray500 }}>{new Date(pes.data).toLocaleDateString('pt-BR')}</Text>
                <Text style={{ color: colors.gray700 }}>{pes.observacao || 'Sem observação'}</Text>
              </View>
            ))
          )}
        </Card>

        <View style={{ marginTop: spacing.sm }}>
          <Button label="Voltar" onPress={() => router.back()} variant="ghost" />
        </View>

        <Modal visible={showVacModal} onClose={() => setShowVacModal(false)} title="Adicionar Vacinação" footer={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button label="Cancelar" onPress={() => setShowVacModal(false)} variant="ghost" />
            <Button label="Salvar" onPress={handleSubmitVac(onSubmitVac)} loading={vacSubmitting} />
          </View>
        }>
          <View>
            <Controller
              control={vacControl}
              name="vacina"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={{ marginBottom: spacing.xs, color: colors.gray700 }}>Vacina</Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ex: Febre Aftosa"
                    placeholderTextColor={colors.gray500}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.gray300,
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      color: colors.gray900,
                      marginBottom: spacing.md,
                    }}
                  />
                  {vacErrors.vacina && <Text style={{ color: colors.danger }}>{vacErrors.vacina.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={vacControl}
              name="data"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={{ marginBottom: spacing.xs, color: colors.gray700 }}>Data</Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.gray500}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.gray300,
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      color: colors.gray900,
                      marginBottom: spacing.md,
                    }}
                  />
                  {vacErrors.data && <Text style={{ color: colors.danger }}>{vacErrors.data.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={vacControl}
              name="dose"
              render={({ field: { value, onChange } }) => (
                <Input label="Dose" value={value} onChangeText={onChange} />
              )}
            />
            <Controller
              control={vacControl}
              name="veterinario"
              render={({ field: { value, onChange } }) => (
                <Input label="Veterinário" value={value} onChangeText={onChange} />
              )}
            />
            <Controller
              control={vacControl}
              name="proxima_dose"
              render={({ field: { value, onChange } }) => (
                <Input label="Próxima Dose" placeholder="YYYY-MM-DD" value={value} onChangeText={onChange} />
              )}
            />
          </View>
        </Modal>

        <Modal visible={showPesModal} onClose={() => setShowPesModal(false)} title="Adicionar Pesagem" footer={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button label="Cancelar" onPress={() => setShowPesModal(false)} variant="ghost" />
            <Button label="Salvar" onPress={handleSubmitPes(onSubmitPes)} loading={pesSubmitting} />
          </View>
        }>
          <View>
            <Controller
              control={pesControl}
              name="data"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={{ marginBottom: spacing.xs, color: colors.gray700 }}>Data</Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.gray500}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.gray300,
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      color: colors.gray900,
                      marginBottom: spacing.md,
                    }}
                  />
                  {pesErrors.data && <Text style={{ color: colors.danger }}>{pesErrors.data.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={pesControl}
              name="peso"
              render={({ field: { value, onChange } }) => (
                <View>
                  <Text style={{ marginBottom: spacing.xs, color: colors.gray700 }}>Peso (kg)</Text>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Ex: 250"
                    keyboardType="numeric"
                    placeholderTextColor={colors.gray500}
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.gray300,
                      borderWidth: 1,
                      borderRadius: 10,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      color: colors.gray900,
                      marginBottom: spacing.md,
                    }}
                  />
                  {pesErrors.peso && <Text style={{ color: colors.danger }}>{pesErrors.peso.message}</Text>}
                </View>
              )}
            />
            <Controller
              control={pesControl}
              name="observacao"
              render={({ field: { value, onChange } }) => (
                <Input label="Observação" value={value} onChangeText={onChange} />
              )}
            />
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
