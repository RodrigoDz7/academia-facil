USE academia_facil;

ALTER TABLE usuarios
  ADD COLUMN plano_expira_em DATE NULL AFTER plano_id;
