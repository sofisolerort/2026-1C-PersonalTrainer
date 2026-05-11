# AC Training

Aplicación mobile para la gestión integral del trabajo de un entrenador personal, en la cual puede administrar a todos sus clientes, armar planes de entrenamiento y hacer seguimiento del progreso.

## Stack tecnológico

- **Frontend (mobile):** React Native con Expo
- **Backend:** Node.js + Express
- **Base de datos:** SQL Server

## Estructura del proyecto

```
PersonalTrainer/
├── backend/    API REST en Node.js + Express
├── database/   Script SQL para crear la base
├── design/     Mockups de referencia (Stitch)
└── mobile/     App mobile en React Native + Expo
```

## Requisitos previos

- Node.js v18 o superior
- SQL Server instalado localmente
- SQL Server Management Studio (SSMS)
- App Expo Go instalada en el celular (para probar la app)

## Setup del backend

1. Crear la base de datos en SQL Server ejecutando el script `database/schema_personaltrainer.sql` en SSMS.

2. Crear un usuario SQL para la app (ejecutar en SSMS):

```sql
   USE master;
   CREATE LOGIN trainer_app WITH PASSWORD = 'TU_PASSWORD_SEGURA';
   USE PersonalTrainerDB;
   CREATE USER trainer_app FOR LOGIN trainer_app;
   ALTER ROLE db_owner ADD MEMBER trainer_app;
```

3. Habilitar TCP/IP en SQL Server Configuration Manager (puerto 1433). Reiniciar el servicio de SQL Server después del cambio.

4. Instalar dependencias del backend:

```bash
   cd backend
   npm install
```

5. Crear el archivo `.env` copiando `.env.example` y completar con los valores reales (usuario SQL, password, etc.).

6. Levantar el servidor:

```bash
   npm run dev
```

El servidor corre en `http://localhost:3000`.

7. Verificar que todo funciona abriendo en el navegador:

```
   http://localhost:3000/api/status
```

Debería devolver:

```json
{
  "mensaje": "Backend funcionando",
  "conexionBD": "OK"
}
```

## Setup del mobile

1. Instalar dependencias:

```bash
   cd mobile
   npm install
```

2. Levantar el proyecto:

```bash
   npx expo start
```

3. Abrir la app en el celular:
   - Tu computadora y tu celular deben estar en la **misma red WiFi**.
   - Abrir la app **Expo Go** en el celular.
   - Escanear el código QR que aparece en la terminal.

## Endpoints implementados

- `GET /api/status` — verifica que el servidor y la conexión a la base estén funcionando.
