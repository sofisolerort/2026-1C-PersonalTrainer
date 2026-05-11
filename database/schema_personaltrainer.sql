-- =============================================================
-- Proyecto: AC Training - Plataforma Personal Trainer
-- Motor: SQL Server
-- =============================================================
-- INSTRUCCIONES:
-- 1. Ejecutar este script completo en SSMS para crear la base
--    desde cero con todas las tablas y datos iniciales.
-- 2. Despues de ejecutar este script, crear el usuario SQL para
--    la app (ver README, seccion "Setup del backend").
-- =============================================================

-- =============================================================
-- 0. CREAR LA BASE DE DATOS
-- =============================================================
IF DB_ID('PersonalTrainerDB') IS NULL
BEGIN
    CREATE DATABASE PersonalTrainerDB;
END
GO

USE PersonalTrainerDB;
GO

-- =============================================================
-- LIMPIEZA (por si se ejecuta de nuevo, borra tablas en orden inverso)
-- =============================================================
IF OBJECT_ID('Pago', 'U') IS NOT NULL DROP TABLE Pago;
IF OBJECT_ID('RegistroEjercicio', 'U') IS NOT NULL DROP TABLE RegistroEjercicio;
IF OBJECT_ID('Seguimiento', 'U') IS NOT NULL DROP TABLE Seguimiento;
IF OBJECT_ID('RutinaEjercicio', 'U') IS NOT NULL DROP TABLE RutinaEjercicio;
IF OBJECT_ID('Rutina', 'U') IS NOT NULL DROP TABLE Rutina;
IF OBJECT_ID('[Plan]', 'U') IS NOT NULL DROP TABLE [Plan];
IF OBJECT_ID('Ejercicio', 'U') IS NOT NULL DROP TABLE Ejercicio;
IF OBJECT_ID('PerfilCliente', 'U') IS NOT NULL DROP TABLE PerfilCliente;
IF OBJECT_ID('Usuario', 'U') IS NOT NULL DROP TABLE Usuario;
IF OBJECT_ID('Configuracion', 'U') IS NOT NULL DROP TABLE Configuracion;
GO

-- =============================================================
-- 1. CONFIGURACION (clave-valor para datos editables del trainer)
-- =============================================================
-- Permite editar precio, datos de pago, etc. sin tocar codigo.
-- Patron clave-valor flexible para sumar nuevos parametros sin migrar.

CREATE TABLE Configuracion (
    clave           NVARCHAR(100)   NOT NULL PRIMARY KEY,
    valor           NVARCHAR(500)   NULL,
    descripcion     NVARCHAR(300)   NULL,
    fecha_actualizacion DATETIME2   NOT NULL DEFAULT SYSUTCDATETIME()
);

-- =============================================================
-- 2. USUARIOS
-- =============================================================
-- Una sola tabla para trainer y clientes, diferenciados por 'rol'.
-- Campo estado_cuenta lleva el ciclo del cliente:
--   onboarding_pendiente -> recien registrado, falta completar formulario
--   pago_pendiente       -> termino onboarding, falta subir comprobante
--   pago_en_revision     -> subio comprobante, espera aprobacion del trainer
--   activo               -> trainer aprobo, puede ver/usar su plan
--   rechazado            -> trainer rechazo el comprobante

CREATE TABLE Usuario (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(100)   NOT NULL,
    apellido        NVARCHAR(100)   NOT NULL,
    email           NVARCHAR(150)   NOT NULL UNIQUE,
    password_hash   NVARCHAR(255)   NOT NULL,
    rol             NVARCHAR(20)    NOT NULL,
    telefono        NVARCHAR(30)    NULL,
    estado_cuenta   NVARCHAR(30)    NOT NULL DEFAULT 'onboarding_pendiente',
    activo          BIT             NOT NULL DEFAULT 1,
    fecha_alta      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Usuario_Rol CHECK (rol IN ('trainer', 'cliente')),
    CONSTRAINT CK_Usuario_Estado CHECK (estado_cuenta IN
        ('onboarding_pendiente', 'pago_pendiente', 'pago_en_revision', 'activo', 'rechazado'))
);

-- =============================================================
-- 3. PERFIL DEL CLIENTE (datos del onboarding)
-- =============================================================
-- 1 a 1 con Usuario. Solo aplica cuando rol = 'cliente'.

CREATE TABLE PerfilCliente (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id          INT             NOT NULL UNIQUE,
    fecha_nacimiento    DATE            NULL,
    sexo                NVARCHAR(20)    NULL,
    altura_cm           INT             NULL,
    peso_inicial_kg     DECIMAL(5,2)    NULL,
    objetivo            NVARCHAR(50)    NULL,
    experiencia         NVARCHAR(20)    NULL,
    lesiones            NVARCHAR(500)   NULL,
    disponibilidad      NVARCHAR(200)   NULL,
    equipamiento        NVARCHAR(50)    NULL,
    onboarding_completo BIT             NOT NULL DEFAULT 0,
    fecha_actualizacion DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_PerfilCliente_Usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
);

-- =============================================================
-- 4. PAGO (comprobantes de transferencia/Mercado Pago)
-- =============================================================
-- Cliente sube comprobante despues del onboarding.
-- Trainer lo revisa y aprueba o rechaza.

CREATE TABLE Pago (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    cliente_id          INT             NOT NULL,
    monto               DECIMAL(10,2)   NOT NULL,
    metodo              NVARCHAR(30)    NOT NULL,  -- 'transferencia' | 'mercadopago'
    comprobante_url     NVARCHAR(500)   NULL,      -- ruta o URL al archivo subido
    estado              NVARCHAR(20)    NOT NULL DEFAULT 'pendiente',
    notas_cliente       NVARCHAR(300)   NULL,
    notas_trainer       NVARCHAR(300)   NULL,      -- motivo de rechazo si aplica
    fecha_subida        DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    fecha_revision      DATETIME2       NULL,
    CONSTRAINT FK_Pago_Cliente
        FOREIGN KEY (cliente_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    CONSTRAINT CK_Pago_Estado CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    CONSTRAINT CK_Pago_Metodo CHECK (metodo IN ('transferencia', 'mercadopago'))
);

-- =============================================================
-- 5. EJERCICIOS (catalogo del trainer)
-- =============================================================

CREATE TABLE Ejercicio (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(150)   NOT NULL,
    descripcion     NVARCHAR(1000)  NULL,
    grupo_muscular  NVARCHAR(50)    NULL,
    video_url       NVARCHAR(500)   NULL,  -- link a YouTube
    activo          BIT             NOT NULL DEFAULT 1,
    fecha_alta      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

-- =============================================================
-- 6. PLAN (entre corchetes porque PLAN es palabra reservada)
-- =============================================================
-- Un plan agrupa la rutina semanal de un cliente durante un periodo.

CREATE TABLE [Plan] (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    cliente_id      INT             NOT NULL,
    nombre          NVARCHAR(150)   NOT NULL,
    descripcion     NVARCHAR(500)   NULL,
    fecha_inicio    DATE            NOT NULL,
    fecha_fin       DATE            NULL,
    estado          NVARCHAR(20)    NOT NULL DEFAULT 'activo',
    fecha_creacion  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Plan_Cliente
        FOREIGN KEY (cliente_id) REFERENCES Usuario(id),
    CONSTRAINT CK_Plan_Estado CHECK (estado IN ('activo', 'finalizado', 'pausado'))
);

-- =============================================================
-- 7. RUTINA (un dia del plan)
-- =============================================================

CREATE TABLE Rutina (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    plan_id         INT             NOT NULL,
    dia_semana      NVARCHAR(15)    NOT NULL,
    nombre          NVARCHAR(150)   NOT NULL,
    notas           NVARCHAR(500)   NULL,
    CONSTRAINT FK_Rutina_Plan
        FOREIGN KEY (plan_id) REFERENCES [Plan](id) ON DELETE CASCADE,
    CONSTRAINT CK_Rutina_Dia CHECK (dia_semana IN
        ('lunes','martes','miercoles','jueves','viernes','sabado','domingo'))
);

-- =============================================================
-- 8. RUTINA-EJERCICIO (tabla intermedia con datos extra)
-- =============================================================

CREATE TABLE RutinaEjercicio (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    rutina_id       INT             NOT NULL,
    ejercicio_id    INT             NOT NULL,
    orden           INT             NOT NULL,
    series          INT             NOT NULL,
    repeticiones    NVARCHAR(30)    NOT NULL,
    descanso_seg    INT             NULL,
    notas           NVARCHAR(300)   NULL,
    CONSTRAINT FK_RutinaEjercicio_Rutina
        FOREIGN KEY (rutina_id) REFERENCES Rutina(id) ON DELETE CASCADE,
    CONSTRAINT FK_RutinaEjercicio_Ejercicio
        FOREIGN KEY (ejercicio_id) REFERENCES Ejercicio(id)
);

-- =============================================================
-- 9. SEGUIMIENTO (mediciones del cliente - opcional MVP)
-- =============================================================

CREATE TABLE Seguimiento (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    cliente_id      INT             NOT NULL,
    fecha           DATE            NOT NULL,
    peso_kg         DECIMAL(5,2)    NULL,
    cintura_cm      DECIMAL(5,2)    NULL,
    cadera_cm       DECIMAL(5,2)    NULL,
    pecho_cm        DECIMAL(5,2)    NULL,
    brazo_cm        DECIMAL(5,2)    NULL,
    pierna_cm       DECIMAL(5,2)    NULL,
    observaciones   NVARCHAR(500)   NULL,
    fecha_registro  DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Seguimiento_Cliente
        FOREIGN KEY (cliente_id) REFERENCES Usuario(id) ON DELETE CASCADE
);

-- =============================================================
-- 10. REGISTRO DE EJERCICIO (cliente carga lo que hizo)
-- =============================================================

CREATE TABLE RegistroEjercicio (
    id                      INT IDENTITY(1,1) PRIMARY KEY,
    rutina_ejercicio_id     INT             NOT NULL,
    cliente_id              INT             NOT NULL,
    fecha                   DATE            NOT NULL,
    completado              BIT             NOT NULL DEFAULT 1,
    carga_kg                DECIMAL(5,2)    NULL,
    repeticiones_realizadas NVARCHAR(30)    NULL,
    sensacion               INT             NULL,
    notas                   NVARCHAR(300)   NULL,
    fecha_registro          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_RegistroEjercicio_RutinaEjercicio
        FOREIGN KEY (rutina_ejercicio_id) REFERENCES RutinaEjercicio(id),
    CONSTRAINT FK_RegistroEjercicio_Cliente
        FOREIGN KEY (cliente_id) REFERENCES Usuario(id) ON DELETE CASCADE,
    CONSTRAINT CK_RegistroEjercicio_Sensacion CHECK (sensacion BETWEEN 1 AND 5)
);

-- =============================================================
-- INDICES
-- =============================================================
CREATE INDEX IX_Usuario_Email             ON Usuario(email);
CREATE INDEX IX_Usuario_Estado            ON Usuario(estado_cuenta);
CREATE INDEX IX_Pago_Cliente              ON Pago(cliente_id);
CREATE INDEX IX_Pago_Estado               ON Pago(estado);
CREATE INDEX IX_Plan_Cliente              ON [Plan](cliente_id);
CREATE INDEX IX_Rutina_Plan               ON Rutina(plan_id);
CREATE INDEX IX_RutinaEjercicio_Rutina    ON RutinaEjercicio(rutina_id);
CREATE INDEX IX_Seguimiento_Cliente       ON Seguimiento(cliente_id, fecha);
CREATE INDEX IX_RegistroEjercicio_Cliente ON RegistroEjercicio(cliente_id, fecha);
GO

-- =============================================================
-- DATOS INICIALES DE CONFIGURACION
-- =============================================================
-- Editar estos valores en SSMS o desde el backend cuando cambien.
-- Ejemplo: UPDATE Configuracion SET valor = '35000' WHERE clave = 'precio_plan_ars';

INSERT INTO Configuracion (clave, valor, descripcion) VALUES
    ('precio_plan_ars',          '30000',                'Precio mensual del plan en pesos argentinos'),
    ('cbu',                      '0000003100000000000000', 'CBU del trainer para transferencias'),
    ('alias_bancario',           'AC.TRAINING.MP',       'Alias bancario del trainer'),
    ('banco',                    'Banco Galicia',        'Banco de la cuenta bancaria'),
    ('titular_cuenta',           'Apellido, Nombre',     'Titular de la cuenta bancaria'),
    ('alias_mercadopago',        'ac.training.mp',       'Alias de Mercado Pago del trainer'),
    ('whatsapp_trainer',         '+5491100000000',       'WhatsApp de contacto del trainer');
GO

-- =============================================================
-- DATOS DE PRUEBA
-- =============================================================
-- IMPORTANTE: las passwords son placeholders.
-- Para que el login funcione, generar un hash bcrypt real con
-- el script backend/generar_hash.js y reemplazar con:
-- UPDATE Usuario SET password_hash = '<hash_real>' WHERE email = 'trainer@demo.com';

INSERT INTO Usuario (nombre, apellido, email, password_hash, rol, estado_cuenta) VALUES
    ('Juan', 'Perez', 'trainer@demo.com', 'HASH_PLACEHOLDER', 'trainer', 'activo'),
    ('Sofia', 'Lopez', 'cliente@demo.com', 'HASH_PLACEHOLDER', 'cliente', 'onboarding_pendiente');

INSERT INTO Ejercicio (nombre, grupo_muscular, descripcion) VALUES
    ('Sentadilla', 'piernas', 'Ejercicio basico de tren inferior'),
    ('Press de banca', 'pecho', 'Ejercicio de empuje horizontal'),
    ('Remo con barra', 'espalda', 'Ejercicio de traccion horizontal'),
    ('Plancha', 'core', 'Ejercicio isometrico de core'),
    ('Peso muerto', 'espalda', 'Ejercicio de cadena posterior');
GO

-- =============================================================
-- FIN DEL SCRIPT
-- =============================================================
