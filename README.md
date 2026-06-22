# Fitness App

Aplicación mobile para la gestión de entrenamientos entre un entrenador personal y sus clientes. El entrenador administra a sus clientes y sus rutinas; cada cliente accede a la rutina que le fue asignada.

## Funcionalidades actuales

- **Registro en dos pasos**: credenciales (paso 1) y perfil del cliente (paso 2: nombre, fecha de nacimiento, días que entrena por semana, lugar, objetivo y nivel).
- **Login con sesión persistente** (queda guardada de forma segura aunque cierres la app).
- **Navegación según el rol** del usuario (entrenador o cliente).
- **Entrenador**:
  - Lista de sus clientes.
  - Crear, ver y editar la rutina de un cliente (la rutina genera automáticamente los días según los que el cliente entrena por semana).
  - Cargar, editar y eliminar ejercicios por día (series, reps y peso sugerido).
  - Búsqueda de ejercicios contra una API externa (ExerciseDB / RapidAPI).
- **Cliente**:
  - Ver su rutina y los ejercicios de cada día.
  - Editar su perfil (nombre y teléfono).
- **Sistema de diseño centralizado** (colores, tipografías, espaciados y sombras en `constants/theme.js`).

## Stack técnico

- **React Native** + **Expo** para la app mobile.
- **TypeScript** como lenguaje.
- **Expo Router** para la navegación basada en archivos.
- **Supabase** para autenticación y base de datos (Postgres en la nube).
- **expo-secure-store** para guardar el token de sesión de forma segura.
- **ExerciseDB (RapidAPI)** para la búsqueda/autocompletado de ejercicios.

## Estructura del proyecto

```
mobile/
├── app/                  # Pantallas (file-based routing de Expo Router)
│   ├── (auth)/           # Login, RegisterStep1, RegisterStep2
│   ├── (client)/         # Home, Rutinas, ejercicios/[id], Perfil, Configuracion
│   ├── (trainer)/        # Home + clients/ (detalle de cliente, rutina, ejercicios)
│   ├── _layout.tsx       # Layout raíz (provee el AuthContext)
│   └── index.tsx         # Redirección inicial según sesión/rol
├── components/           # Reutilizables: CustomButton, CustomInput, KeyboardScreen, BackButton
├── constants/            # Sistema de diseño (theme.js)
├── context/              # AuthContext (manejo global de sesión)
├── hooks/                # Hooks de autenticación (useLogin, useRegister1, useRegister2)
├── utils/                # Supabase, ExerciseApi
└── authStyle/            # Estilos compartidos del flujo de autenticación
```

## Base de datos (Supabase)

Tablas principales:

- `profiles`: datos del usuario (`full_name`, `email`, `phone`, `birth_date`, `role`, `trainer_id`, `training_days`, `training_place`, `objective`, `level`).
- `routines`: rutina de un cliente (`client_id`, `title`, `description`).
- `routine_days`: días de una rutina (`routine_id`, `day_number`, `day_name`).
- `exercises`: ejercicios de un día (`routine_day_id`, `name`, `sets`, `reps`, `suggested_weight`).

Los roles son `entrenador` y `cliente`. Al registrarse, un cliente se asigna automáticamente al entrenador (buscándolo por rol). Las foreign keys de `routine_days` y `exercises` usan `ON DELETE CASCADE`, así que borrar una rutina arrastra sus días y ejercicios.

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

```bash
cp .env.example .env
```

Pedirle al equipo las credenciales reales y completarlas en el `.env`.

**4. Arrancar el servidor de desarrollo**

```bash
npx expo start
```

**5. Abrir la app**

Escanear el código QR de la terminal con la app **Expo Go**.

## Variables de entorno

El `.env` no se sube a Git (está en `.gitignore`). La plantilla `.env.example` muestra las variables necesarias:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RAPIDAPI_KEY=
```

## Autores

- **Sofía Soler**
- **Agustín Quinteros**
