import { Stack, Redirect } from 'expo-router';

import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../utils/Supabase';
import { useAuth } from '../context/AuthContext';

export default function ClienteLayout() {
  const { session, isLoading } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from('perfiles')
          .select('rol')
          .eq('id', session.user.id)
          .single();
        setRol(data?.rol || null);
      }
      setVerificando(false);
    };
    if (!isLoading) verificar();
  }, [isLoading, session]);

  if (isLoading || verificando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session || rol !== 'cliente') {
    return <Redirect href="/(auth)/Login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="home" options={{ title: 'Inicio' }} />
      <Stack.Screen name="perfil" options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="rutinas" options={{ title: 'Mis Rutinas' }} />
      <Stack.Screen name="configuracion" options={{ title: 'Configuración' }} />
      <Stack.Screen name="ejercicios/[id]" options={{ title: 'Detalle Rutina' }} />
    </Stack>
  );
}