import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { supabase } from '../utils/Supabase';


export default function HomeEntrenador() {
  const { user, signOut } = useAuth();

  const getJWT = async () => {
    const { data } = await supabase.auth.getSession();
    const jwt = data.session?.access_token;
    Alert.alert('JWT Token', jwt);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel del Entrenador</Text>
      <Text style={styles.welcome}>Bienvenido, {user?.email}</Text>
      <Button title="Obtener mi JWT" onPress={getJWT} />
      <Button title="Cerrar sesión" onPress={() => { signOut(); router.replace('/(auth)/Login'); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  welcome: { fontSize: 18, marginBottom: 20 },
});