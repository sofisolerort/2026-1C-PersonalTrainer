import { useLocalSearchParams } from "expo-router";
import ProgresoHistorial from "@/components/ProgresoHistorial";

export default function ProgresoTrainer() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  return <ProgresoHistorial clientId={clientId} />;
}
