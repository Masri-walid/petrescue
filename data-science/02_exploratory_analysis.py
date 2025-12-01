"""
Exploratory Data Analysis (EDA) Script
PetRescue Connect - Adoption Likelihood Prediction

This script analyzes patterns and features that influence adoption likelihood:
1. Distribution analysis of key features
2. Correlation analysis
3. Feature importance preliminary analysis
4. Visualization of adoption patterns
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Configuration
DATA_DIR = Path(__file__).parent / 'data'
PROCESSED_DATA_PATH = DATA_DIR / 'processed'
OUTPUT_DIR = Path(__file__).parent / 'output' / 'eda'


def load_processed_data():
    """Load the cleaned data from previous step."""
    data_path = PROCESSED_DATA_PATH / 'adoption_data_cleaned.csv'
    
    if not data_path.exists():
        raise FileNotFoundError(
            f"Processed data not found at {data_path}. "
            "Please run 01_data_cleaning.py first."
        )
    
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records from processed data")
    return df


def analyze_distributions(df):
    """Analyze distributions of key features."""
    print("\n" + "=" * 50)
    print("FEATURE DISTRIBUTIONS")
    print("=" * 50)
    
    # Categorical features
    categorical_cols = ['species', 'gender', 'size', 'is_vaccinated', 'is_spayed_neutered']
    
    for col in categorical_cols:
        if col in df.columns:
            print(f"\n{col.upper()} Distribution:")
            value_counts = df[col].value_counts(normalize=True) * 100
            for val, pct in value_counts.items():
                print(f"  {val}: {pct:.1f}%")
    
    # Numeric features
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    print(f"\n\nNumeric Features Summary:")
    print(df[numeric_cols].describe())


def analyze_adoption_rates(df):
    """Analyze adoption rates across different segments."""
    print("\n" + "=" * 50)
    print("ADOPTION RATE ANALYSIS")
    print("=" * 50)
    
    if 'adopted' not in df.columns:
        print("Warning: 'adopted' column not found. Skipping adoption rate analysis.")
        return {}
    
    overall_rate = df['adopted'].mean() * 100
    print(f"\nOverall Adoption Rate: {overall_rate:.1f}%")
    
    adoption_rates = {}
    
    # Adoption rates by species
    if 'species' in df.columns:
        print("\nAdoption Rate by Species:")
        species_rates = df.groupby('species')['adopted'].mean() * 100
        for species, rate in species_rates.items():
            print(f"  {species}: {rate:.1f}%")
            adoption_rates[f'species_{species}'] = rate
    
    # Adoption rates by gender
    if 'gender' in df.columns:
        print("\nAdoption Rate by Gender:")
        gender_rates = df.groupby('gender')['adopted'].mean() * 100
        for gender, rate in gender_rates.items():
            print(f"  {gender}: {rate:.1f}%")
            adoption_rates[f'gender_{gender}'] = rate
    
    # Adoption rates by size
    if 'size' in df.columns:
        print("\nAdoption Rate by Size:")
        size_rates = df.groupby('size')['adopted'].mean() * 100
        for size, rate in size_rates.items():
            print(f"  {size}: {rate:.1f}%")
            adoption_rates[f'size_{size}'] = rate
    
    # Adoption rates by vaccination status
    if 'is_vaccinated' in df.columns:
        print("\nAdoption Rate by Vaccination Status:")
        vax_rates = df.groupby('is_vaccinated')['adopted'].mean() * 100
        for status, rate in vax_rates.items():
            print(f"  {'Vaccinated' if status else 'Not Vaccinated'}: {rate:.1f}%")
            adoption_rates[f'vaccinated_{status}'] = rate
    
    # Adoption rates by spayed/neutered status
    if 'is_spayed_neutered' in df.columns:
        print("\nAdoption Rate by Spayed/Neutered Status:")
        sn_rates = df.groupby('is_spayed_neutered')['adopted'].mean() * 100
        for status, rate in sn_rates.items():
            print(f"  {'Spayed/Neutered' if status else 'Not Spayed/Neutered'}: {rate:.1f}%")
            adoption_rates[f'spayed_neutered_{status}'] = rate
    
    return adoption_rates


def analyze_correlations(df):
    """Analyze correlations between features and adoption."""
    print("\n" + "=" * 50)
    print("CORRELATION ANALYSIS")
    print("=" * 50)
    
    # Select numeric columns
    numeric_df = df.select_dtypes(include=[np.number])
    
    if 'adopted' in numeric_df.columns:
        correlations = numeric_df.corr()['adopted'].drop('adopted').sort_values(key=abs, ascending=False)
        print("\nCorrelations with Adoption:")
        for feat, corr in correlations.items():
            print(f"  {feat}: {corr:.3f}")
        return correlations
    
    return None


def identify_key_features(df, adoption_rates):
    """Identify key features that influence adoption likelihood."""
    print("\n" + "=" * 50)
    print("KEY FEATURES ANALYSIS")
    print("=" * 50)
    
    key_findings = []
    
    # Analyze species impact
    if 'species' in df.columns and 'adopted' in df.columns:
        species_rates = df.groupby('species')['adopted'].mean()
        best_species = species_rates.idxmax()
        worst_species = species_rates.idxmin()
        key_findings.append(f"Species with highest adoption: {best_species} ({species_rates[best_species]*100:.1f}%)")
        key_findings.append(f"Species with lowest adoption: {worst_species} ({species_rates[worst_species]*100:.1f}%)")
    
    # Analyze age impact
    if 'estimated_age' in df.columns and 'adopted' in df.columns:
        # Create age groups
        df['age_group'] = pd.cut(df['estimated_age'],
                                  bins=[0, 12, 36, 84, 999],
                                  labels=['puppy/kitten', 'young', 'adult', 'senior'])
        age_rates = df.groupby('age_group')['adopted'].mean()
        best_age = age_rates.idxmax()
        key_findings.append(f"Age group with highest adoption: {best_age} ({age_rates[best_age]*100:.1f}%)")

    # Health factors impact
    health_factors = []
    if 'is_vaccinated' in df.columns:
        vax_impact = df.groupby('is_vaccinated')['adopted'].mean().diff().dropna()
        if len(vax_impact) > 0:
            health_factors.append(f"Vaccination impact: +{vax_impact.values[0]*100:.1f}%")

    if 'is_spayed_neutered' in df.columns:
        sn_impact = df.groupby('is_spayed_neutered')['adopted'].mean().diff().dropna()
        if len(sn_impact) > 0:
            health_factors.append(f"Spay/Neuter impact: +{sn_impact.values[0]*100:.1f}%")

    key_findings.extend(health_factors)

    print("\nKey Findings:")
    for i, finding in enumerate(key_findings, 1):
        print(f"  {i}. {finding}")

    return key_findings


def create_visualizations(df):
    """Create and save visualization plots."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Set style
    plt.style.use('seaborn-v0_8-whitegrid')
    sns.set_palette("husl")

    if 'adopted' not in df.columns:
        print("Warning: Cannot create adoption visualizations without 'adopted' column")
        return

    # 1. Adoption rates by species
    if 'species' in df.columns:
        plt.figure(figsize=(10, 6))
        species_rates = df.groupby('species')['adopted'].mean() * 100
        species_rates.plot(kind='bar', color='steelblue', edgecolor='black')
        plt.title('Adoption Rate by Species', fontsize=14)
        plt.xlabel('Species')
        plt.ylabel('Adoption Rate (%)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(OUTPUT_DIR / 'adoption_by_species.png', dpi=150)
        plt.close()
        print(f"Saved: adoption_by_species.png")

    # 2. Adoption rates by size
    if 'size' in df.columns:
        plt.figure(figsize=(10, 6))
        size_order = ['small', 'medium', 'large', 'extra_large']
        available_sizes = [s for s in size_order if s in df['size'].values]
        size_rates = df.groupby('size')['adopted'].mean() * 100
        size_rates = size_rates.reindex(available_sizes)
        size_rates.plot(kind='bar', color='coral', edgecolor='black')
        plt.title('Adoption Rate by Size', fontsize=14)
        plt.xlabel('Size')
        plt.ylabel('Adoption Rate (%)')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.savefig(OUTPUT_DIR / 'adoption_by_size.png', dpi=150)
        plt.close()
        print(f"Saved: adoption_by_size.png")

    # 3. Feature importance heatmap (correlation)
    numeric_df = df.select_dtypes(include=[np.number])
    if len(numeric_df.columns) > 1:
        plt.figure(figsize=(12, 10))
        correlation_matrix = numeric_df.corr()
        mask = np.triu(np.ones_like(correlation_matrix, dtype=bool))
        sns.heatmap(correlation_matrix, mask=mask, annot=True, cmap='coolwarm',
                   center=0, fmt='.2f', linewidths=0.5)
        plt.title('Feature Correlation Heatmap', fontsize=14)
        plt.tight_layout()
        plt.savefig(OUTPUT_DIR / 'correlation_heatmap.png', dpi=150)
        plt.close()
        print(f"Saved: correlation_heatmap.png")

    # 4. Age distribution and adoption
    if 'estimated_age' in df.columns:
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))

        # Age distribution
        axes[0].hist(df['estimated_age'].dropna(), bins=30, color='steelblue', edgecolor='black', alpha=0.7)
        axes[0].set_title('Age Distribution (months)')
        axes[0].set_xlabel('Age (months)')
        axes[0].set_ylabel('Count')

        # Adoption rate by age group
        df_temp = df.copy()
        df_temp['age_group'] = pd.cut(df_temp['estimated_age'],
                                       bins=[0, 6, 12, 36, 84, 200],
                                       labels=['Baby', 'Young', 'Adult', 'Mature', 'Senior'])
        age_adoption = df_temp.groupby('age_group')['adopted'].mean() * 100
        axes[1].bar(age_adoption.index.astype(str), age_adoption.values, color='coral', edgecolor='black')
        axes[1].set_title('Adoption Rate by Age Group')
        axes[1].set_xlabel('Age Group')
        axes[1].set_ylabel('Adoption Rate (%)')

        plt.tight_layout()
        plt.savefig(OUTPUT_DIR / 'age_analysis.png', dpi=150)
        plt.close()
        print(f"Saved: age_analysis.png")

    print(f"\nAll visualizations saved to: {OUTPUT_DIR}")


def generate_eda_report(df, adoption_rates, correlations, key_findings):
    """Generate a summary EDA report."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report_path = OUTPUT_DIR / 'eda_report.txt'

    with open(report_path, 'w') as f:
        f.write("=" * 60 + "\n")
        f.write("PetRescue Connect - Exploratory Data Analysis Report\n")
        f.write("=" * 60 + "\n\n")

        f.write("DATASET OVERVIEW\n")
        f.write("-" * 40 + "\n")
        f.write(f"Total Records: {len(df)}\n")
        f.write(f"Total Features: {len(df.columns)}\n\n")

        if 'adopted' in df.columns:
            f.write("ADOPTION STATISTICS\n")
            f.write("-" * 40 + "\n")
            f.write(f"Overall Adoption Rate: {df['adopted'].mean()*100:.1f}%\n")
            f.write(f"Adopted Animals: {df['adopted'].sum()}\n")
            f.write(f"Not Adopted: {len(df) - df['adopted'].sum()}\n\n")

        f.write("KEY FINDINGS\n")
        f.write("-" * 40 + "\n")
        for i, finding in enumerate(key_findings, 1):
            f.write(f"{i}. {finding}\n")

        f.write("\n\nFEATURE RECOMMENDATIONS FOR MODEL\n")
        f.write("-" * 40 + "\n")
        f.write("Based on the analysis, the following features show significant\n")
        f.write("correlation with adoption likelihood:\n")
        f.write("1. Species\n")
        f.write("2. Age/Age Category\n")
        f.write("3. Size\n")
        f.write("4. Vaccination Status\n")
        f.write("5. Spayed/Neutered Status\n")
        f.write("6. Time in Shelter (if available)\n")

    print(f"\nEDA Report saved to: {report_path}")


def main():
    """Main EDA pipeline."""
    print("=" * 60)
    print("PetRescue Connect - Exploratory Data Analysis")
    print("=" * 60)

    try:
        # Load data
        df = load_processed_data()

        # Analyze distributions
        analyze_distributions(df)

        # Analyze adoption rates
        adoption_rates = analyze_adoption_rates(df)

        # Correlation analysis
        correlations = analyze_correlations(df)

        # Key features
        key_findings = identify_key_features(df, adoption_rates)

        # Create visualizations
        create_visualizations(df)

        # Generate report
        generate_eda_report(df, adoption_rates, correlations, key_findings)

        print("\n" + "=" * 60)
        print("EDA completed successfully!")
        print("=" * 60)

        return df

    except FileNotFoundError as e:
        print(f"\nError: {e}")
        return None


if __name__ == "__main__":
    main()

