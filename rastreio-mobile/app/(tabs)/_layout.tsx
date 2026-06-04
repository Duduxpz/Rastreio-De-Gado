import { Tabs } from 'expo-router';
import { colors } from '../../constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Animais',
          tabBarLabel: 'Animais',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="cadastro"
        options={{
          title: 'Cadastro',
          tabBarLabel: 'Cadastro',
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarLabel: 'Relatórios',
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
