import { useAuth } from "../../context/AuthContext";
import ProgresoHistorial from "@/components/ProgresoHistorial";

export default function ProgresoCliente() {
  const { user } = useAuth();
  return <ProgresoHistorial clientId={user?.id} />;
}
