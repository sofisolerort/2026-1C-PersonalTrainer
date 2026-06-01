// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';

import { Session } from '@supabase/supabase-js';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from './utils/Supabase';


export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Obtener la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // 2. Escuchar cambios en la autenticación (Login, Logout, Register)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    // Verificar si el usuario está actualmente en el grupo (auth)
    const inAuthGroup = segments[0] === 'auth';

    if (session && inAuthGroup) {
      // Si hay sesión y está en Login/Register, mandarlo al Home
      router.replace('/(tabs)/Home'); 
    } else if (!session && !inAuthGroup) {
      // Si NO hay sesión y quiere ir a las pestañas, mandarlo al Login
      router.replace('/auth/Login');
    }
  }, [session, initialized, segments, router]);

  // Pantalla de carga mientras verifica la sesión inicial
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}