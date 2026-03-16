CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS contact_fullname_trgm_idx ON "Contact" USING GIN ("fullName" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contact_email_idx ON "Contact" USING btree ("email");
CREATE INDEX IF NOT EXISTS parent_phone_idx ON "Parent" USING btree ("phone");
CREATE INDEX IF NOT EXISTS parent_fullname_trgm_idx ON "Parent" USING GIN ("fullName" gin_trgm_ops);
