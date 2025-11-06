# AI Agent Workflow - FuelEU Maritime Compliance Calculations

## Overview

This document describes the AI agent-assisted implementation of FuelEU Maritime Regulation calculations, focusing on GHG Intensity calculations (WtT, TtW, GHGIE_actual) and Compliance Balance calculations.

## Primary Work: Calculation Implementation

### Stage 1: GHG Intensity Calculation Implementation

**Objective**: Implement Well-to-Tank (WtT), Tank-to-Wake (TtW), and Actual GHG Intensity (GHGIE_actual) calculations according to FuelEU Maritime Regulation.

**Agent Prompt**: "Implement FuelEU Maritime Regulation calculations. Calculate WtT emissions: Σ(Mi × CO2eq_WtT,i × LCVi) / Total Energy. Calculate TtW emissions with methane slip support. Calculate GHGIE_actual = f_wind × (WtT + TtW)."

**Agent Output**:
- Created `GhgIntensityCalculator` service with:
  - `calculateWtT()`: Well-to-Tank emissions calculation
  - `calculateTtW()`: Tank-to-Wake emissions with methane slip coefficient support
  - `calculateActualGhgIntensity()`: GHGIE_actual = f_wind × (WtT + TtW)
  - `calculateEnergyInScope()`: Energy calculation from fuel compositions

**Database Schema Changes**:
- Extended `Route` model with `windFactor` and `electricityMJ` fields
- Created `FuelComposition` model to store fuel data (mass, WtT factors, TtW factors, LCV, methane slip)

**Service Updates**:
- Updated `RouteService` to calculate GHGIE_actual from fuel data
- Updated `ComplianceService` to use calculated GHGIE_actual for CB calculations
- Updated comparison endpoint to return `actualGhgIntensity` values

**Validation**:
- Verified formulas match FuelEU Maritime Regulation specifications
- Tested with sample fuel compositions (HFO, LNG, MGO)
- Confirmed methane slip calculations for LNG fuels
- Validated wind factor application

### Stage 2: Compliance Balance Calculation

**Objective**: Calculate Compliance Balance using actual GHG intensity from fuel data.

**Agent Prompt**: "Update Compliance Balance calculation to use calculated GHGIE_actual from fuel composition data. Formula: CB = (Target - Actual) × Energy in scope."

**Agent Output**:
- Updated `ComplianceService.getComplianceBalance()` to:
  1. Calculate actual GHG intensity from fuel data
  2. Calculate energy in scope from fuel compositions
  3. Apply CB formula: (Target - Actual) × Energy in scope
- Updated `getAdjustedComplianceBalance()` to apply banked surplus from previous years

**Validation**:
- Verified CB calculation uses calculated GHGIE_actual
- Confirmed energy in scope calculation from fuel data
- Tested adjusted CB with banking mechanism

### Stage 3: Frontend Integration

**Objective**: Display calculated values in the UI with calculation breakdown.

**Agent Prompt**: "Update frontend to display calculated GHG intensity values. Show WtT, TtW, and GHGIE_actual in the UI. Add calculation breakdown component."

**Agent Output**:
- Created `CalculationBreakdown` component showing:
  - WtT and TtW values
  - Wind factor and electricity contributions
  - Fuel composition details
  - GHGIE_actual calculation formula
- Updated `CompareTab` to show `actualGhgIntensity` values
- Updated `RoutesTab` to indicate calculated vs stored values
- Updated API services to handle new response structure

**Validation**:
- Verified UI displays calculated values correctly
- Confirmed calculation breakdown shows all components
- Tested expandable details sections

## Key Files Created/Modified

### Backend
- `backend/src/core/application/GhgIntensityCalculator.ts` (NEW)
- `backend/src/core/domain/Route.ts` (MODIFIED - added fuel composition fields)
- `backend/src/core/application/RouteService.ts` (MODIFIED - added calculation logic)
- `backend/src/core/application/ComplianceService.ts` (MODIFIED - uses calculated values)
- `backend/prisma/schema.prisma` (MODIFIED - added FuelComposition model)
- `backend/src/infrastructure/db/seed.ts` (MODIFIED - added fuel composition examples)

### Frontend
- `frontend/src/adapters/ui/components/CalculationBreakdown.tsx` (NEW)
- `frontend/src/core/domain/Route.ts` (MODIFIED - added fuel composition interface)
- `frontend/src/adapters/ui/components/CompareTab.tsx` (MODIFIED - shows actual GHG intensity)
- `frontend/src/adapters/ui/components/RoutesTab.tsx` (MODIFIED - shows calculated indicator)

## Corrections Made

1. **Adjusted CB Calculation**: Fixed to apply banked surplus from previous years (Year N-1) instead of current year
2. **Colspan Fix**: Updated table colspan from 9 to 11 to match actual column count
3. **JSX Fragment Fix**: Wrapped multiple table rows in React Fragment to fix syntax error

## Time Saved

- **Calculation Service**: ~2 hours (complex formula implementation)
- **Database Schema**: ~30 minutes (schema design and migration)
- **Frontend Integration**: ~1.5 hours (component creation and integration)
- **Total**: ~4 hours saved compared to manual implementation

## Observations

### Where Agent Excelled
1. **Formula Implementation**: Correctly implemented complex FuelEU Maritime formulas
2. **Type Safety**: Generated proper TypeScript types for all calculations
3. **Code Structure**: Maintained clean architecture with proper separation of concerns
4. **Documentation**: Generated comprehensive calculation documentation

### Refinements Made
1. **Methane Slip**: Adjusted TtW calculation to properly apply methane slip coefficient
2. **Energy Calculation**: Enhanced to include electricity from onshore power supply
3. **UI Display**: Refined calculation breakdown component for better readability
