// Servicio de clientes
// HOY: devuelve datos mockeados (falsos) para desarrollar el front sin backend.
// MAÑANA: cuando esté Supabase conectado, estas funciones harán fetch al backend.

// === DATOS MOCKEADOS ===

const clientes = [
  {
    id: 1,
    nombre: "Ana García",
    objetivo: "Pérdida de peso",
    diasEntrenamiento: 3,
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Juan Pérez",
    objetivo: "Hipertrofia",
    diasEntrenamiento: 4,
    estado: "activo",
  },
  {
    id: 3,
    nombre: "María López",
    objetivo: "Tonificación",
    diasEntrenamiento: 5,
    estado: "activo",
  },
];

// === FUNCIONES ===

// Devuelve todos los clientes del trainer.
// Devuelve una Promesa para simular que viene del backend.
const getClientes = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clientes);
    }, 500); // simula 0.5 segundos de demora
  });
};

// Devuelve un cliente por su id.
const getClienteById = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clientes.find((c) => c.id === id));
    }, 500);
  });
};

// Devuelve las métricas del dashboard.
const getMetricasTrainer = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        clientesActivos: clientes.filter((c) => c.estado === "activo").length,
      });
    }, 500);
  });
};

export { getClientes, getClienteById, getMetricasTrainer };
