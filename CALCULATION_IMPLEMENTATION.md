# FuelEU Maritime Regulation - Calculation Implementation

## Overview

This document describes the implementation of FuelEU Maritime Regulation calculations for GHG Intensity (GHGIE_actual) and Compliance Balance (CB), including Well-to-Tank (WtT) and Tank-to-Wake (TtW) emissions calculations.

## Stage 1: GHG Intensity Calculation (GHGIE_actual)

### Database Schema

**New Model: `FuelComposition`**
- `fuelName`: Type of fuel (HFO, LNG, MGO, etc.)
- `massTonnes`: Mass of fuel in tonnes (Mi)
- `wtTFactor`: Well-to-Tank GHG emission factor (gCO2e/MJ)
- `lcvMJPerKg`: Lower Calorific Value (MJ/kg)
- `ttWFactor`: Tank-to-Wake CO2 equivalent emissions factor (gCO2e/MJ)
- `methaneSlipCoeff`: Non-combusted fuel coefficient (C_slip,j) for LNG

**Route Model Extensions:**
- `windFactor`: Wind-assisted propulsion reward factor (f_wind), default 1.0
- `electricityMJ`: Electricity from Onshore Power Supply (Ek) in MJ, default 0.0

### Calculation Formulas

#### 1. Well-to-Tank (WtT) Emissions
```
WtT = Σ(Mi × CO2eq_WtT,i × LCVi) / Total Energy
```
- Converts fuel mass from tonnes to kg
- Calculates energy: `massKg × LCV`
- Calculates WtT contribution: `massKg × wtTFactor × LCV`
- Includes electricity in total energy

**Location:** `backend/src/core/application/GhgIntensityCalculator.ts::calculateWtT()`

#### 2. Tank-to-Wake (TtW) Emissions
```
TtW = Σ(Mi × TtW_factor_i × LCVi) / Total Energy
```
- Applies methane slip coefficient if provided: `effectiveTtWFactor = TtW_factor × (1 + C_slip)`
- Calculates TtW contribution: `massKg × effectiveTtWFactor × LCV`
- Includes electricity in total energy

**Location:** `backend/src/core/application/GhgIntensityCalculator.ts::calculateTtW()`

#### 3. Actual GHG Intensity (GHGIE_actual)
```
GHGIE_actual = f_wind × (WtT + TtW)
```
- Calculates WtT and TtW emissions
- Applies wind reward factor
- Returns actual GHG intensity in gCO2e/MJ

**Location:** `backend/src/core/application/GhgIntensityCalculator.ts::calculateActualGhgIntensity()`

#### 4. Energy in Scope
```
Energy in scope = Σ(Mi × LCVi) + Ek
```
- Calculates from fuel compositions when available
- Falls back to approximation: `fuelConsumption × 41,000 MJ/t`

**Location:** `backend/src/core/application/GhgIntensityCalculator.ts::calculateEnergyInScope()`

## Stage 2: Compliance Balance (CB) Calculation

### Formula
```
CB = (Target Intensity - Actual Intensity) × Energy in scope
```
Where:
- Target Intensity = 89.3368 gCO2e/MJ (for 2025)
- Actual Intensity = GHGIE_actual (calculated from fuel data)
- Energy in scope = Calculated from fuel compositions or approximation

### Status
- **Positive CB**: Surplus (compliant)
- **Negative CB**: Deficit (non-compliant)

**Location:** `backend/src/core/application/ComplianceService.ts::getComplianceBalance()`

## Stage 3: Banking Mechanism

### Implementation
- Validates that Compliance Balance is positive before banking
- Stores banked surplus in `BankEntry` model
- Adjusted CB applies banked surplus from previous years (Year N-1)

**Formula:** `Adjusted CB = Initial CB + Banked Surplus from previous periods`

**Location:** `backend/src/core/application/ComplianceService.ts::getAdjustedComplianceBalance()`

## Stage 4: Pooling Mechanism

### Pool Validation
- Enforces: `Σ(CB of all ships) ≥ 0`
- Throws error if total pool CB is negative

### Allocation Logic
1. A ship that entered with a deficit cannot exit with an increased deficit
2. A ship that entered with a surplus cannot exit with a negative CB (deficit)

### Greedy Allocation Algorithm
1. Sort members by CB (descending)
2. Separate into surpluses and deficits
3. Allocate surpluses to deficits
4. Validate exit conditions
5. Return `cbAfter` for each member

**Location:** `backend/src/core/application/PoolingService.ts::createPool()`

## Implementation Files

### Backend
- `backend/src/core/application/GhgIntensityCalculator.ts` (NEW)
- `backend/src/core/domain/Route.ts` (MODIFIED)
- `backend/src/core/application/RouteService.ts` (MODIFIED)
- `backend/src/core/application/ComplianceService.ts` (MODIFIED)
- `backend/prisma/schema.prisma` (MODIFIED)
- `backend/src/infrastructure/db/seed.ts` (MODIFIED)

### Frontend
- `frontend/src/adapters/ui/components/CalculationBreakdown.tsx` (NEW)
- `frontend/src/core/domain/Route.ts` (MODIFIED)
- `frontend/src/adapters/ui/components/CompareTab.tsx` (MODIFIED)
- `frontend/src/adapters/ui/components/RoutesTab.tsx` (MODIFIED)

## API Endpoints

### Routes
- `GET /routes/comparison` - Returns comparison with calculated `actualGhgIntensity`

### Compliance
- `GET /compliance/cb` - Returns Compliance Balance calculated from fuel data
- `GET /compliance/adjusted-cb` - Returns Adjusted Compliance Balance with banking

## Database Migration

**Migration:** `20251108113058_add_fuel_composition`
- Added `windFactor` and `electricityMJ` columns to `Route` table
- Created `FuelComposition` table with foreign key to `Route`

## Seed Data

Updated seed data includes:
- 5 routes with fuel composition examples
- HFO, LNG, and MGO fuels with realistic emission factors
- Example with wind assistance (windFactor = 0.95)
- Example with onshore power supply (electricityMJ = 500,000 MJ)
