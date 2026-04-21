import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.js';  // 추가
import accountRoutes from './routes/accounts.js';
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
    `);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...');
    process.exit(0);
});