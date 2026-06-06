import { View, Text, Switch, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function ConfiguracionCliente() {
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.option}>
        <Text style={styles.optionText}>Notificaciones push</Text>
        <Switch value={notificaciones} onValueChange={setNotificaciones} />
      </View>
      <View style={styles.option}>
        <Text style={styles.optionText}>Modo oscuro</Text>
        <Switch value={modoOscuro} onValueChange={setModoOscuro} />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Guardado', 'Preferencias actualizadas')}>
        <Text style={styles.buttonText}>Guardar configuración</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 },
  optionText: { fontSize: 16 },
  button: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#3b82f6', fontSize: 16 },
});