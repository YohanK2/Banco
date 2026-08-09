-- ==========================
-- BANCO DIGITAL
-- ESQUEMA DE BASE DE DATOS
-- ==========================

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'CLIENTE',
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE NOT NULL,
    nombres VARCHAR(100),
    apellidos VARCHAR(100),
    documento VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE cuentas (
    id_cuenta SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    numero_cuenta VARCHAR(20) UNIQUE,
    tipo VARCHAR(20),
    saldo NUMERIC(12,2),
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'BLOQUEADA', 'CERRADA')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_cliente) REFERENCES clientes(id_cliente)
);

CREATE TABLE transacciones (
    id_transaccion SERIAL PRIMARY KEY,
    cuenta_origen INT,
    cuenta_destino INT,
    tipo VARCHAR(20),
    monto NUMERIC(12,2),
    descripcion TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(cuenta_origen) REFERENCES cuentas(id_cuenta),
    FOREIGN KEY(cuenta_destino) REFERENCES cuentas(id_cuenta)
);

CREATE TABLE beneficiarios (
    id_beneficiario SERIAL PRIMARY KEY,
    id_cliente INT,
    cuenta_destino INT,
    alias VARCHAR(50),
    FOREIGN KEY(id_cliente) REFERENCES clientes(id_cliente),
    FOREIGN KEY(cuenta_destino) REFERENCES cuentas(id_cuenta)
);

CREATE TABLE refresh_tokens (
    id_token SERIAL PRIMARY KEY,
    id_usuario INT,
    token TEXT,
    fecha_expiracion TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE auditoria (
    id_evento SERIAL PRIMARY KEY,
    id_usuario INT,
    accion VARCHAR(100),
    descripcion TEXT,
    ip VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE INDEX idx_documento ON clientes(documento);
CREATE INDEX idx_numero_cuenta ON cuentas(numero_cuenta);
CREATE INDEX idx_fecha_transaccion ON transacciones(fecha);
CREATE INDEX idx_auditoria_usuario ON auditoria(id_usuario);
