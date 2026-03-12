-- Add CEP and company email fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS company_cep TEXT,
ADD COLUMN IF NOT EXISTS company_email TEXT;