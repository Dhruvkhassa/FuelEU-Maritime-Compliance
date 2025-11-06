# Fuel EU Maritime Compliance Platform

A full-stack application implementing Fuel EU Maritime compliance module with hexagonal architecture.

**Author:** Dhruvkhassa (dhruvkhassa110@gmail.com)

## Overview

This project consists of:
- **Backend**: Node.js + TypeScript + PostgreSQL with Express
- **Frontend**: React + TypeScript + TailwindCSS
- **Architecture**: Hexagonal (Ports & Adapters / Clean Architecture)

## Architecture Summary

### Backend Structure
```
backend/
  src/
    core/
      domain/          # Domain entities (Route, ComplianceBalance, etc.)
      application/     # Use cases (RouteService, ComplianceService, etc.)
      ports/
        inbound/       # Service interfaces
        outbound/      # Repository interfaces
    adapters/
      inbound/http/    # Express controllers
      outbound/postgres/  # Prisma repositories
    infrastructure/
      db/              # Database setup
      server/          # Express server
```

### Frontend Structure
```
frontend/
  src/
    core/
      domain/          # Domain models
      ports/
        inbound/       # Service interfaces
    adapters/
      infrastructure/  # API clients
      ui/              # React components
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup & Run Instructions

### Step 1: Database Setup

1. Install PostgreSQL if not already installed
2. Create a database:
   ```sql
   CREATE DATABASE fuel_eu_db;
   ```

### Step 2: Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and set your database URL:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/fuel_eu_db?schema=public"
   PORT=3001
   ```

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Run migrations:
   ```bash
   npm run db:migrate
   ```

6. Seed database:
   ```bash
   npm run db:seed
   ```

7. Start backend server:
   ```bash
   npm run dev
   ```

Backend will run on `http://localhost:3001`

### Step 3: Frontend Setup

1. Navigate to frontend directory (in a new terminal):
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Routes
- `GET /routes` - Get all routes (with optional filters: vesselType, fuelType, year)
- `POST /routes/:id/baseline` - Set a route as baseline
- `GET /routes/comparison` - Get baseline vs comparison routes

### Compliance
- `GET /compliance/cb?shipId=:id&year=:year` - Get compliance balance
- `GET /compliance/adjusted-cb?shipId=:id&year=:year` - Get adjusted compliance balance

### Banking
- `GET /banking/records?shipId=:id&year=:year` - Get bank records
- `POST /banking/bank` - Bank surplus CB
- `POST /banking/apply` - Apply banked surplus

### Pooling
- `POST /pools` - Create a pool with ship members

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Sample Data

The seed script creates 5 routes:
- R001: Container, HFO, 2024 (Baseline)
- R002: BulkCarrier, LNG, 2024
- R003: Tanker, MGO, 2024
- R004: RoRo, HFO, 2025
- R005: Container, LNG, 2025

## Key Features

1. **Routes Tab**: View and filter routes, set baseline
2. **Compare Tab**: Compare routes against baseline and target intensity
3. **Banking Tab**: Bank surplus CB and apply banked amounts
4. **Pooling Tab**: Create pools with multiple ships, validate compliance

## Compliance Formulas

- **Target Intensity (2025)**: 89.3368 gCO₂e/MJ
- **WtT Emissions**: Σ(Mi × CO2eq_WtT,i × LCVi) / Total Energy
- **TtW Emissions**: Σ(Mi × TtW_factor_i × LCVi) / Total Energy
- **GHGIE_actual**: f_wind × (WtT + TtW)
- **Energy in scope**: Σ(Mi × LCVi) + Ek (or approximation: fuelConsumption × 41,000 MJ/t)
- **Compliance Balance**: (Target - Actual) × Energy in scope

## Documentation

- [AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md) - AI agent workflow for calculation implementation
- [CALCULATION_IMPLEMENTATION.md](./CALCULATION_IMPLEMENTATION.md) - Detailed calculation formulas and implementation

