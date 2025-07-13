import express from 'express';
import Service from '../models/service.js';
import { Scheduler } from '../scheduler/scheduler.js';

const router = express.Router();

// POST /api/schedule - Schedule a service
router.post('/api/schedule', async (req, res) => {
  try {
    const serviceData = req.body;
    
    // Validate required fields
    if (!serviceData.name || !serviceData.serviceType) {
      return res.status(400).json({
        error: 'Missing required fields: name, serviceType'
      });
    }
    
    // Schedule the service
    const result = await Scheduler.scheduleService(serviceData);
    
    if (!result.success) {
      return res.status(400).json({
        error: result.error
      });
    }
    
    // Create the service
    const service = new Service(result.service);
    await service.save();
    
    console.log(`[INFO] Service scheduled: ${result.service.serviceID}`);
    
    res.status(201).json({
      success: true,
      message: 'Service scheduled successfully',
      service: result.service,
      node: result.node,
      score: result.score
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to schedule service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/schedule/stats - Get scheduling statistics
router.get('/api/schedule/stats', async (req, res) => {
  try {
    const stats = await Scheduler.getSchedulingStats();
    
    res.json({
      success: true,
      stats: stats
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get scheduling stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/schedule/rebalance - Rebalance services
router.post('/api/schedule/rebalance', async (req, res) => {
  try {
    const result = await Scheduler.rebalanceServices();
    
    res.json({
      success: true,
      result: result
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to rebalance services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 