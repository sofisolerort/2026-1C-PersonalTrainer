import { View, Text, Pressable } from "react-native";


export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Fitness App</Text>

      {/* TEMPORAL: botón para ir al dashboard del trainer */}
      <Pressable
        style={{
          backgroundColor: "#2563EB",
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
        }}
       // onPress={() => router.push("/(trainer)/home")}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
          Ir al dashboard del trainer
        </Text>
      </Pressable>
    </View>
  );
}
