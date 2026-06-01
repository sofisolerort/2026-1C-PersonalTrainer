// app/(tabs)/home.tsx
import { StyleSheet, Text, View, Button } from 'react-native';
import { supabase } from '../utils/Supabase';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>¡Bienvenido al Home!</Text>
      <Button title="Cerrar Sesión" onPress={() => supabase.auth.signOut()} color="#ff5252" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginBottom: 20 }
});