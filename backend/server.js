import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.js';
import accountRoutes from './routes/accounts.js';
import goalRoutes from './routes/goal.js';
import bucketRoutes from './routes/bucket.js';  // ✅ 추가
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();

const app = express();

// Middleware
app.use(requestLogger);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: '✅ Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// ⭐ Swagger UI 추가
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/accounts', accountRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/buckets', bucketRoutes);  // ✅ 추가

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║     🚀 Mony Backend Server Started     ║
╚════════════════════════════════════════╝

📍 Server URL: http://localhost:${PORT}
📚 API Docs: http://localhost:${PORT}/api-docs ⭐
🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

✅ Available Endpoints:
   - GET  /health                    (Server status)
   - POST   /api/accounts            (Create account)
   - GET    /api/accounts            (Get all accounts)
   - GET    /api/accounts/:id        (Get account by ID)
   - PATCH  /api/accounts/:id        (Update account)
   - DELETE /api/accounts/:id        (Delete account)
   - POST   /api/goals               (Create goal)
   - GET    /api/goals               (Get all goals)
   - GET    /api/goals/progress/:id  (Get goal progress)
   - DELETE /api/goals/:id           (Delete goal)
   - POST   /api/buckets             (Create bucket)
   - GET    /api/buckets             (Get all buckets)
   - GET    /api/buckets/status/all  (Get done/doing status)
   - PATCH  /api/buckets/:id/probability (Update probability)
   - POST   /api/buckets/:id/doing   (Set doing)
   - DELETE /api/buckets/:id         (Delete bucket)
    `);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...');
    process.exit(0);
});