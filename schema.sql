-- Ejecutar esto una vez en tu servidor MySQL (phpMyAdmin, MySQL Workbench o consola).
-- Crea la base y las dos tablas que necesita el proyecto.

CREATE DATABASE IF NOT EXISTS bd_node CHARACTER SET utf8mb4;
USE bd_node;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- OJO: las columnas de esta tabla tienen que llamarse EXACTAMENTE así porque
-- base_de_datos/calendario.js las usa por nombre en sus consultas SQL
-- (fecha_final, completada -- antes decía fecha_fin/todo_el_dia y no coincidía).
CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATETIME NOT NULL,
    fecha_final DATETIME NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
