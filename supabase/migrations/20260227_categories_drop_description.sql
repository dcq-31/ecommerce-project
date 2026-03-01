-- Remove description column from categories — it is no longer part of the
-- business model. Title is the only required field; slug is auto-generated.

ALTER TABLE categories DROP COLUMN IF EXISTS description;
