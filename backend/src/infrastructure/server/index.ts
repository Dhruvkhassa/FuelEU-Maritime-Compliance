import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from '../db/prisma';
import { PrismaRouteRepository } from '../../adapters/outbound/postgres/PrismaRouteRepository';
import { PrismaComplianceRepository } from '../../adapters/outbound/postgres/PrismaComplianceRepository';
import { PrismaBankRepository } from '../../adapters/outbound/postgres/PrismaBankRepository';
import { PrismaPoolRepository } from '../../adapters/outbound/postgres/PrismaPoolRepository';
import { RouteService } from '../../core/application/RouteService';
import { ComplianceService } from '../../core/application/ComplianceService';
import { BankingService } from '../../core/application/BankingService';
import { PoolingService } from '../../core/application/PoolingService';
import { RoutesController } from '../../adapters/inbound/http/routesController';
import { ComplianceController } from '../../adapters/inbound/http/complianceController';
import { BankingController } from '../../adapters/inbound/http/bankingController';
import { PoolingController } from '../../adapters/inbound/http/poolingController';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize repositories
const routeRepository = new PrismaRouteRepository(prisma);
const complianceRepository = new PrismaComplianceRepository(prisma);
const bankRepository = new PrismaBankRepository(prisma);
const poolRepository = new PrismaPoolRepository(prisma);

// Initialize services
const routeService = new RouteService(routeRepository);
const complianceService = new ComplianceService(
  routeRepository,
  complianceRepository,
  bankRepository
);
const bankingService = new BankingService(complianceService, bankRepository);
const poolingService = new PoolingService(complianceService, poolRepository);

// Initialize controllers
const routesController = new RoutesController(routeService);
const complianceController = new ComplianceController(complianceService);
const bankingController = new BankingController(bankingService);
const poolingController = new PoolingController(poolingService);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Fuel EU Maritime Compliance API',
    version: '1.0.0',
    endpoints: {
      routes: ['GET /routes', 'POST /routes/:id/baseline', 'GET /routes/comparison'],
      compliance: ['GET /compliance/cb', 'GET /compliance/adjusted-cb'],
      banking: ['GET /banking/records', 'POST /banking/bank', 'POST /banking/apply'],
      pooling: ['POST /pools']
    }
  });
});

// Routes
app.get('/routes', (req, res) => routesController.getAllRoutes(req, res));
app.post('/routes/:id/baseline', (req, res) =>
  routesController.setBaseline(req, res)
);
app.get('/routes/comparison', (req, res) =>
  routesController.getComparison(req, res)
);

app.get('/compliance/cb', (req, res) =>
  complianceController.getComplianceBalance(req, res)
);
app.get('/compliance/adjusted-cb', (req, res) =>
  complianceController.getAdjustedComplianceBalance(req, res)
);

app.get('/banking/records', (req, res) =>
  bankingController.getBankRecords(req, res)
);
app.post('/banking/bank', (req, res) =>
  bankingController.bankSurplus(req, res)
);
app.post('/banking/apply', (req, res) =>
  bankingController.applyBanked(req, res)
);

app.post('/pools', (req, res) => poolingController.createPool(req, res));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

