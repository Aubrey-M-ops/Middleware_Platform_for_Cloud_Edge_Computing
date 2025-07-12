import express from 'express';
import Node from '../models/node.js';
import Service from '../models/service.js';
import { metricsEndpoint } from '../metrics.js';

const router = express.Router();

// GET /metrics - Prometheus metrics endpoint
router.get('/metrics', metricsEndpoint);

// GET /healthz - Health check
router.get('/healthz', async (req, res) => {
  try {
    const nodeCount = await Node.countDocuments();
    const serviceCount = await Service.countDocuments();
    res.json({ 
      ok: 1, 
      timestamp: Date.now(),
      activeNodes: nodeCount,
      activeServices: serviceCount,
      database: 'MongoDB'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

export default router; 