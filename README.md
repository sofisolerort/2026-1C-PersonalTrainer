# Fitness App

Aplicación mobile para gestión de entrenamientos entre un entrenador personal y sus clientes. Permite que el entrenador administre a sus clientes y que cada cliente acceda a sus rutinas asignadas.

## Funcionalidades actuales

- Registro de usuarios.
- Onboarding del cliente (preguntas iniciales para conocer su perfil).
- Login con sesión persistente (queda guardada aunque cierres la app).
- Navegación según el rol del usuario (entrenador o cliente).
- Pantalla principal del entrenador con la lista de sus clientes.
- Pantalla principal del cliente con accesos a sus rutinas y perfil.

## Stack técnico

- **React Native** + **Expo** para la app mobile.
- **TypeScript** como lenguaje.
- **Expo Router** para la navegación basada en archivos.
- **Supabase** para autenticación y base de datos (Postgres en la nube).
- **expo-secure-store** para guardar el token de sesión de forma segura.

## Estructura del proyecto

```
mobile/
├── app/              # Pantallas (file-based routing de Expo Router)
│   ├── (auth)/       # Login, Registro
│   ├── (client)/     # Pantallas del cliente
│   ├── (trainer)/    # Pantallas del entrenador
│   └── preguntas/    # Onboarding
├── components/       # Componentes reutilizables (botones, inputs)
├── constants/        # Sistema de diseño (colores, tipografías, espaciados)
├── context/          # AuthContext (manejo global de sesión)
├── hooks/            # Hooks personalizados
├── services/         # Servicios con datos mockeados (luego se conectan a Supabase)
├── utils/            # Cliente de Supabase
└── authStyle/        # Estilos compartidos del flujo de autenticación
```

## Cómo correr el proyecto

### Requisitos

- Node.js instalado.
- App **Expo Go** en el celular (Android o iOS).
- Celular y computadora en la misma red WiFi.

### Pasos

**1. Clonar el repo**

```bash
git clone https://github.com/sofisolerort/2026-1C-PersonalTrainer.git
cd 2026-1C-PersonalTrainer/mobile
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar variables de entorno**

Copiar `.env.example` y renombrarlo a `.env`:

```bash
cp .env.example .env
```

Pedirle al equipo las credenciales reales de Supabase y completarlas en el `.env`.

**4. Arrancar el servidor de desarrollo**

```bash
npx expo start
```

**5. Abrir la app**

Escanear el código QR que aparece en la terminal con la app **Expo Go** en el celular.

## Variables de entorno

El archivo `.env` no se sube a Git (está en `.gitignore`) por seguridad. La plantilla `.env.example` muestra qué variables son necesarias:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Estas se piden al equipo por fuera del repo.

## Autores

- **Sofía Soler**
- **Agustín Quinteros**
