import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

// Mock según id (idealmente fetch desde DB)
const ejerciciosPorRutina: Record<string, any[]> = {
  '1': [{ nombre: 'Press de banca', series: 4, reps: 10 }, { nombre: 'Sentadillas', series: 4, reps: 12 }, { nombre: 'Dominadas', series: 3, reps: 8 }],
  '2': [{ nombre: 'Burpees', series: 3, reps: 15 }, { nombre: 'Saltos tijera', series: 3, reps: 20 }, { nombre: 'Mountain climbers', series: 3, reps: 20 }],
  '3': [{ nombre: 'Estiramiento de isquios', duracion: '30s' }, { nombre: 'Rotación de cadera', duracion: '30s' }],
};

export default function EjerciciosRutina() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ejercicios = ejerciciosPorRutina[id] || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={ejercicios}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.ejercicioNombre}>{item.nombre}</Text>
            {item.series && <Text style={styles.detalle}>{item.series} series x {item.reps} reps</Text>}
            {item.duracion && <Text style={styles.detalle}>Duración: {item.duracion}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>No hay ejercicios para esta rutina</Text>}
      />
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Volver a rutinas</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12 },
  ejercicioNombre: { fontSize: 18, fontWeight: '500' },
  detalle: { fontSize: 14, color: '#555', marginTop: 4 },
  vacio: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },
  backButton: { marginTop: 20, alignItems: 'center', padding: 12, backgroundColor: '#3b82f6', borderRadius: 10, marginBottom: 30 },
  backText: { color: 'white', fontWeight: 'bold' },
});