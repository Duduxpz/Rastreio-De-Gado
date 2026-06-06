import { useEffect } from 'react';
import { Stack } from 'expo-router';
import ThemeProvider from '../src/theme/ThemeProvider';
import initDatabase from '../src/database/schema';
import { AuthProvider } from '../src/hooks/useAuth';

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="animal/[id]"
            options={{
              headerTitle: 'Detalhes do Animal',
            }}
          />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
