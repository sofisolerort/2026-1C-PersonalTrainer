import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

// Datos mock (después conectar a Supabase)
const rutinasMock = [
  { id: '1', nombre: 'Rutina Fuerza', ejercicios: 6, duracion: '45 min' },
  { id: '2', nombre: 'Cardio HIIT', ejercicios: 4, duracion: '30 min' },
  { id: '3', nombre: 'Movilidad', ejercicios: 5, duracion: '20 min' },
];

export default function RutinasCliente() {
const verEjercicios = (rutinaId: string) => {
const verEjercicios = (rutinaId: string) => {
 
};
  return (
    <View style={styles.container}>
      <FlatList
        data={rutinasMock}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => verEjercicios(item.id)}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.detalle}>{item.ejercicios} ejercicios • {item.duracion}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  card: { backgroundColor: 'white', padding: 18, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  nombre: { fontSize: 18, fontWeight: '600' },
  detalle: { fontSize: 14, color: '#666', marginTop: 4 },
});}