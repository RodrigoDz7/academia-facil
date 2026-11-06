CREATE DATABASE IF NOT EXISTS academia_facil
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE academia_facil;

DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS aulas;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS planos;

CREATE TABLE planos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(8,2) NOT NULL,
  duracao_meses INT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  nivel ENUM('admin', 'instrutor', 'aluno') NOT NULL DEFAULT 'aluno',
  plano_id INT NULL,
  CONSTRAINT fk_usuarios_planos FOREIGN KEY (plano_id)
    REFERENCES planos(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  dia_hora DATETIME NOT NULL,
  vagas INT NOT NULL,
  instrutor_id INT NOT NULL,
  CONSTRAINT fk_aulas_instrutor FOREIGN KEY (instrutor_id)
    REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  aula_id INT NOT NULL,
  data_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_reservas_aluno_aula UNIQUE (aluno_id, aula_id),
  CONSTRAINT fk_reservas_aluno FOREIGN KEY (aluno_id)
    REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_reservas_aula FOREIGN KEY (aula_id)
    REFERENCES aulas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO planos (nome, preco, duracao_meses) VALUES
  ('Mensal', 99.90, 1),
  ('Trimestral', 269.90, 3),
  ('Anual', 899.90, 12);
