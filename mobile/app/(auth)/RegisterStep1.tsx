// app/(auth)/register-step-1.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import { router } from 'expo-router';
import { useRegister1 } from '../hooks/auth/useRegister1';

export default function RegisterStep1() {
  const { email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, errors, validate } = useRegister1();

  const handleNext = () => {
    if (validate()) {
      // Navegar al paso 2 llevando los datos
      router.push({
        pathname: '/(auth)/RegisterStep2',
        params: { email, password },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro - Paso 1</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Repetir contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 5, borderRadius: 8 },
  error: { color: 'red', fontSize: 12, marginBottom: 10 },
  button: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  link: { marginTop: 15, textAlign: 'center', color: '#3b82f6' },
});