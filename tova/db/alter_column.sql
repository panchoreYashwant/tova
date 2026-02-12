-- alter_column.sql
ALTER TABLE events
ALTER COLUMN created_by TYPE UUID USING created_by::uuid;
