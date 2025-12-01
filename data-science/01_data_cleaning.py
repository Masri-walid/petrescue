"""
Data Cleaning and Preparation Script
PetRescue Connect - Adoption Likelihood Prediction

This script:
1. Loads the Kaggle pet adoption dataset
2. Cleans and preprocesses the data
3. Maps features to align with PetRescue Connect database schema
4. Saves the cleaned data for analysis and modeling
"""

import pandas as pd
import numpy as np
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configuration
DATA_DIR = Path(__file__).parent / 'data'
RAW_DATA_PATH = DATA_DIR / 'raw'
PROCESSED_DATA_PATH = DATA_DIR / 'processed'

def load_kaggle_data():
    """Load the pet adoption dataset from Kaggle."""
    # The dataset should be in data/raw/ after running: 
    # kaggle datasets download chaudharisanika/pet-adoption-records-with-animal-and-adopter-data
    
    csv_files = list(RAW_DATA_PATH.glob('*.csv'))
    if not csv_files:
        raise FileNotFoundError(
            f"No CSV files found in {RAW_DATA_PATH}. "
            "Please download the dataset using: "
            "kaggle datasets download chaudharisanika/pet-adoption-records-with-animal-and-adopter-data -p data/raw --unzip"
        )
    
    print(f"Found CSV files: {[f.name for f in csv_files]}")
    
    # Load the main dataset
    df = pd.read_csv(csv_files[0])
    print(f"Loaded {len(df)} records from {csv_files[0].name}")
    
    return df

def clean_data(df):
    """Clean the raw dataset."""
    print("\n--- Data Cleaning ---")
    print(f"Original shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")
    
    # Create a copy to avoid modifying original
    df_clean = df.copy()
    
    # Display initial info
    print(f"\nMissing values per column:")
    print(df_clean.isnull().sum())
    
    # Handle missing values
    # For numeric columns, fill with median
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df_clean[col].isnull().any():
            df_clean[col].fillna(df_clean[col].median(), inplace=True)
    
    # For categorical columns, fill with mode or 'Unknown'
    categorical_cols = df_clean.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df_clean[col].isnull().any():
            mode_val = df_clean[col].mode()
            fill_val = mode_val[0] if len(mode_val) > 0 else 'Unknown'
            df_clean[col].fillna(fill_val, inplace=True)
    
    # Remove duplicates if any
    initial_rows = len(df_clean)
    df_clean.drop_duplicates(inplace=True)
    removed_dupes = initial_rows - len(df_clean)
    if removed_dupes > 0:
        print(f"Removed {removed_dupes} duplicate rows")
    
    print(f"Cleaned shape: {df_clean.shape}")
    
    return df_clean

def map_to_petrescue_schema(df):
    """Map dataset features to PetRescue Connect database schema."""
    print("\n--- Mapping to PetRescue Connect Schema ---")
    
    # Create mapping dictionary based on expected Kaggle columns
    # The actual mapping will depend on the dataset columns
    
    mapped_df = pd.DataFrame()
    
    # Common column mappings (adjust based on actual dataset columns)
    column_mappings = {
        # Species mapping
        'pet_type': 'species',
        'type': 'species',
        'animal_type': 'species',
        'PetType': 'species',
        
        # Age mapping  
        'age': 'estimated_age',
        'Age': 'estimated_age',
        'age_months': 'estimated_age',
        'pet_age': 'estimated_age',
        
        # Gender mapping
        'gender': 'gender',
        'Gender': 'gender',
        'sex': 'gender',
        
        # Size mapping
        'size': 'size',
        'Size': 'size',
        'pet_size': 'size',
        
        # Color mapping
        'color': 'color',
        'Color': 'color',
        'coat_color': 'color',
        
        # Breed mapping
        'breed': 'breed',
        'Breed': 'breed',
        
        # Health status
        'vaccinated': 'is_vaccinated',
        'Vaccinated': 'is_vaccinated',
        'health_condition': 'medical_conditions',
        
        # Spayed/Neutered
        'spayed_neutered': 'is_spayed_neutered',
        'Sterilized': 'is_spayed_neutered',
        
        # Adoption status (target variable)
        'adopted': 'is_adopted',
        'Adopted': 'is_adopted',
        'adoption_status': 'is_adopted',
        'AdoptionStatus': 'is_adopted',
        'adoption_likelihood': 'is_adopted',
        'AdoptionLikelihood': 'adoption_likelihood_score',
    }
    
    # Apply mappings for columns that exist
    for orig_col, new_col in column_mappings.items():
        if orig_col in df.columns:
            mapped_df[new_col] = df[orig_col]
            print(f"  Mapped '{orig_col}' -> '{new_col}'")
    
    # Copy over unmapped columns that might be useful
    useful_cols = ['time_in_shelter', 'days_in_shelter', 'shelter_days',
                   'adoption_fee', 'fee', 'price',
                   'personality', 'temperament', 'behavior']
    
    for col in df.columns:
        col_lower = col.lower()
        if col_lower not in [k.lower() for k in column_mappings.keys()]:
            if any(useful in col_lower for useful in ['shelter', 'fee', 'days', 'time', 
                                                       'personality', 'behavior', 'adopt']):
                mapped_df[col] = df[col]
                print(f"  Kept additional column: '{col}'")
    
    print(f"\nMapped dataframe shape: {mapped_df.shape}")
    print(f"Mapped columns: {mapped_df.columns.tolist()}")

    return mapped_df


def standardize_values(df):
    """Standardize values to match PetRescue Connect constraints."""
    df_std = df.copy()

    # Standardize species to match DB constraints: 'dog', 'cat', 'rabbit', 'bird', 'other'
    if 'species' in df_std.columns:
        species_map = {
            'dog': 'dog', 'dogs': 'dog', 'canine': 'dog',
            'cat': 'cat', 'cats': 'cat', 'feline': 'cat',
            'rabbit': 'rabbit', 'rabbits': 'rabbit', 'bunny': 'rabbit',
            'bird': 'bird', 'birds': 'bird', 'avian': 'bird',
        }
        df_std['species'] = df_std['species'].str.lower().map(
            lambda x: species_map.get(x, 'other') if pd.notna(x) else 'other'
        )

    # Standardize gender: 'male', 'female', 'unknown'
    if 'gender' in df_std.columns:
        gender_map = {
            'male': 'male', 'm': 'male', 'boy': 'male',
            'female': 'female', 'f': 'female', 'girl': 'female',
        }
        df_std['gender'] = df_std['gender'].str.lower().map(
            lambda x: gender_map.get(x, 'unknown') if pd.notna(x) else 'unknown'
        )

    # Standardize size: 'small', 'medium', 'large', 'extra_large'
    if 'size' in df_std.columns:
        size_map = {
            'small': 'small', 's': 'small', 'tiny': 'small', 'mini': 'small',
            'medium': 'medium', 'm': 'medium', 'mid': 'medium', 'average': 'medium',
            'large': 'large', 'l': 'large', 'big': 'large',
            'extra large': 'extra_large', 'xl': 'extra_large', 'extra_large': 'extra_large',
        }
        df_std['size'] = df_std['size'].str.lower().map(
            lambda x: size_map.get(x, 'medium') if pd.notna(x) else 'medium'
        )

    # Convert boolean columns
    bool_cols = ['is_vaccinated', 'is_spayed_neutered', 'is_adopted']
    for col in bool_cols:
        if col in df_std.columns:
            df_std[col] = df_std[col].map(
                lambda x: True if str(x).lower() in ['true', 'yes', '1', 'y'] else
                          False if str(x).lower() in ['false', 'no', '0', 'n'] else None
            )

    return df_std


def create_target_variable(df):
    """Create or validate the target variable for adoption prediction."""
    df_target = df.copy()

    # Look for adoption-related columns
    adoption_cols = [col for col in df_target.columns if 'adopt' in col.lower()]
    print(f"\nAdoption-related columns found: {adoption_cols}")

    if 'is_adopted' in df_target.columns:
        # Binary classification: adopted or not
        df_target['adopted'] = df_target['is_adopted'].astype(int)
    elif 'adoption_likelihood_score' in df_target.columns:
        # Already have a likelihood score
        df_target['adopted'] = (df_target['adoption_likelihood_score'] > 0.5).astype(int)
    else:
        print("Warning: No clear adoption target column found. Please check data structure.")

    return df_target


def save_processed_data(df):
    """Save the processed data for analysis and modeling."""
    PROCESSED_DATA_PATH.mkdir(parents=True, exist_ok=True)

    output_path = PROCESSED_DATA_PATH / 'adoption_data_cleaned.csv'
    df.to_csv(output_path, index=False)
    print(f"\nSaved processed data to: {output_path}")

    # Save data summary
    summary_path = PROCESSED_DATA_PATH / 'data_summary.txt'
    with open(summary_path, 'w') as f:
        f.write("Processed Pet Adoption Data Summary\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Total records: {len(df)}\n")
        f.write(f"Total features: {len(df.columns)}\n\n")
        f.write("Columns:\n")
        for col in df.columns:
            f.write(f"  - {col}: {df[col].dtype}\n")
        f.write("\nBasic Statistics:\n")
        f.write(df.describe(include='all').to_string())

    print(f"Saved data summary to: {summary_path}")

    return output_path


def main():
    """Main data cleaning pipeline."""
    print("=" * 60)
    print("PetRescue Connect - Data Cleaning Pipeline")
    print("=" * 60)

    # Ensure directories exist
    RAW_DATA_PATH.mkdir(parents=True, exist_ok=True)
    PROCESSED_DATA_PATH.mkdir(parents=True, exist_ok=True)

    try:
        # Load raw data
        df_raw = load_kaggle_data()

        # Clean the data
        df_clean = clean_data(df_raw)

        # Map to PetRescue Connect schema
        df_mapped = map_to_petrescue_schema(df_clean)

        # Standardize values
        df_std = standardize_values(df_mapped)

        # Create target variable
        df_final = create_target_variable(df_std)

        # Save processed data
        output_path = save_processed_data(df_final)

        print("\n" + "=" * 60)
        print("Data cleaning completed successfully!")
        print("=" * 60)

        return df_final

    except FileNotFoundError as e:
        print(f"\nError: {e}")
        print("\nTo download the dataset, run:")
        print("  kaggle datasets download chaudharisanika/pet-adoption-records-with-animal-and-adopter-data -p data-science/data/raw --unzip")
        return None


if __name__ == "__main__":
    main()

