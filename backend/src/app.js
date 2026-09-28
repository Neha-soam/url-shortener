const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const cache = require('./services/cacheService');
const urlRoutes = require('./routes/urlRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const urlController = require('./controllers/urlController');
const { redirectLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
if (env.TRUST_PROXY) app.set('trust proxy', 1); // needed for correct client IPs behind a proxy/LB
app.disable('x-powered-by');
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', cache: cache.getStats() }));

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', notFound); // unknown /api/* must never fall through to the redirect route

app.get('/:shortCode', redirectLimiter, urlController.redirect); // keep LAST

app.use(notFound);
app.use(errorHandler);

module.exports = app;
