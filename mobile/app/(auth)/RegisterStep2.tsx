import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useRegister2 } from '../hooks/auth/useRegister2';

export default function RegisterStep2() {
  const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
  const { form, updateField, errors, loading, registerComplete } = useRegister2({ email, password });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Si faltan datos del paso 1, redirigir al inicio del registro
  if (!email || !password) {
    router.replace('/(auth)/RegisterStep1');
    return null;
  }

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      updateField('fecha_nacimiento', formatted);
    }
  };

  const handleFinalRegister = async () => {
    try {
      // Llamamos al hook; el callback se ejecuta SOLO si el registro fue exitoso
      await registerComplete(() => {
        // Redirigir directamente al login (ya que el hook hizo signIn automático,
        // pero por seguridad llevamos al login para que refresque el contexto)
        router.replace('/(auth)/Login');
      });
    } catch (error: any) {
      // Si el hook lanza un error (poco probable porque ya maneja Alert internamente),
      // mostramos un mensaje genérico.
      Alert.alert('Error', error?.message || 'No se pudo completar el registro');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registro - Paso 2</Text>

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput
        style={styles.input}
        value={form.nombre_completo}
        onChangeText={(v) => updateField('nombre_completo', v)}
        placeholder="Juan Pérez"
      />
      {errors.nombre_completo && <Text style={styles.error}>{errors.nombre_completo}</Text>}

      <Text style={styles.label}>Fecha de nacimiento</Text>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={form.fecha_nacimiento ? styles.dateText : styles.placeholderText}>
          {form.fecha_nacimiento || 'Seleccionar fecha'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={form.fecha_nacimiento ? new Date(form.fecha_nacimiento) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {errors.fecha_nacimiento && <Text style={styles.error}>{errors.fecha_nacimiento}</Text>}

      <Text style={styles.label}>Días que entrenas por semana (1-6)</Text>
      <Picker
        selectedValue={form.cant_dias_que_entrena}
        onValueChange={(v) => updateField('cant_dias_que_entrena', v)}
        style={styles.picker}
      >
        {[1, 2, 3, 4, 5, 6].map((d) => (
          <Picker.Item key={d} label={d.toString()} value={d} />
        ))}
      </Picker>
      {errors.cant_dias_que_entrena && <Text style={styles.error}>{errors.cant_dias_que_entrena}</Text>}

      <Text style={styles.label}>Lugar de entrenamiento</Text>
      <Picker
        selectedValue={form.lugar_entrenamiento}
        onValueChange={(v) => updateField('lugar_entrenamiento', v)}
        style={styles.picker}
      >
        <Picker.Item label="Gimnasio" value="gym" />
        <Picker.Item label="Casa" value="casa" />
        <Picker.Item label="Parque" value="parque" />
      </Picker>

      <Text style={styles.label}>Objetivo principal</Text>
      <Picker
        selectedValue={form.objetivo}
        onValueChange={(v) => updateField('objetivo', v)}
        style={styles.picker}
      >
        <Picker.Item label="Pérdida de peso" value="perdida de peso" />
        <Picker.Item label="Aumento de masa muscular" value="aumento de masa muscular" />
        <Picker.Item label="Mejorar la resistencia" value="mejorar la resistencia" />
      </Picker>

      <Text style={styles.label}>Nivel</Text>
      <Picker
        selectedValue={form.nivel}
        onValueChange={(v) => updateField('nivel', v)}
        style={styles.picker}
      >
        <Picker.Item label="Principiante" value="principiante" />
        <Picker.Item label="Intermedio" value="intermedio" />
        <Picker.Item label="Avanzado" value="avanzado" />
      </Picker>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleFinalRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Completar registro'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    color: '#000',
    fontSize: 16,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  buttonDisabled: {
    backgroundColor: '#99ccff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});