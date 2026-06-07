
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const { session, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/Login" />;
  }

  // Redirigir según el rol
  if (role === 'entrenador') {
    return <Redirect href="/(trainer)/Home" />;
  } else {
    // Por defecto cliente
    return <Redirect href="/(client)/Home" />;
  }
}