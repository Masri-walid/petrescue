-- PetRescue Connect - Add Adoption Likelihood Column
-- This migration adds the adoption_likelihood column to the animals table

-- Add adoption_likelihood column to animals table
-- This stores the predicted adoption probability as a percentage (0-100)
ALTER TABLE animals 
ADD COLUMN IF NOT EXISTS adoption_likelihood DECIMAL(5,2) DEFAULT NULL;

-- Add a comment to describe the column
COMMENT ON COLUMN animals.adoption_likelihood IS 'Predicted adoption likelihood percentage (0-100) from ML model';

-- Create an index for efficient queries on adoption likelihood
CREATE INDEX IF NOT EXISTS idx_animals_adoption_likelihood ON animals(adoption_likelihood);

-- Verify the column was added
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'animals' AND column_name = 'adoption_likelihood'
    ) THEN
        RAISE NOTICE 'Column adoption_likelihood successfully added to animals table';
    ELSE
        RAISE EXCEPTION 'Failed to add adoption_likelihood column';
    END IF;
END $$;

