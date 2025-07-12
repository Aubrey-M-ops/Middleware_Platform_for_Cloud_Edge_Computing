import express from 'express';
import nodeRoutes from './node.js';
import serviceRoutes from './service.js';
import scheduleRoutes from './schedule.js';
import podRoutes from './pod.js';
import servicePodRoutes from './service-pod.js';
import healthRoutes from './health.js';

const router = express.Router();

// Mount all route modules
router.use('/', nodeRoutes);
router.use('/', serviceRoutes);
router.use('/', scheduleRoutes);
router.use('/', podRoutes);
router.use('/', servicePodRoutes);
router.use('/', healthRoutes);

export default router; 