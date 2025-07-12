import express from 'express';
import Service from '../models/service.js';

const router = express.Router();

// POST /api/addPodToService/:serviceID - Add pod to service
// only when the current pods is not enough, you can add more pods
router.post('/api/addPodToService/:serviceID', async (req, res) => {
  try {
    const { serviceID } = req.params;
    const podData = req.body;
    
    const service = await Service.findOne({ serviceID });
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }
    
    // Generate podID if not provided
    if (!podData.podID) {
      podData.podID = `${serviceID}-pod-${Date.now()}`;
    }
    
    await service.addPod(podData);
    
    console.log(`[INFO] Pod added to service ${serviceID}: ${podData.podID}`);
    
    res.status(201).json({
      success: true,
      message: 'Pod added successfully',
      service: service
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to add pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/updatePodInService/:serviceID/:podID - Update pod in service
router.put('/api/updatePodInService/:serviceID/:podID', async (req, res) => {
  try {
    const { serviceID, podID } = req.params;
    const updateData = req.body;
    
    const service = await Service.findOne({ serviceID });
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }
    
    const pod = service.getPod(podID);
    if (!pod) {
      return res.status(404).json({
        error: 'Pod not found'
      });
    }
    
    // Update pod data
    Object.assign(pod, updateData);
    pod.lastHeartbeat = new Date();
    
    // Update replica counts
    service.replicas.current = service.pods.length;
    service.replicas.available = service.pods.filter(pod => pod.status === 'running').length;
    
    await service.save();
    
    console.log(`[INFO] Pod updated in service ${serviceID}: ${podID}`);
    
    res.json({
      success: true,
      message: 'Pod updated successfully',
      service: service
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to update pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/removePodFromService/:serviceID/:podID - Remove pod from service
router.delete('/api/removePodFromService/:serviceID/:podID', async (req, res) => {
  try {
    const { serviceID, podID } = req.params;
    
    const service = await Service.findOne({ serviceID });
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }
    
    await service.removePod(podID);
    
    console.log(`[INFO] Pod removed from service ${serviceID}: ${podID}`);
    
    res.json({
      success: true,
      message: 'Pod removed successfully',
      service: service
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to remove pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/getPodsForService/:serviceID - Get pods for service
router.get('/api/getPodsForService/:serviceID', async (req, res) => {
  try {
    const { serviceID } = req.params;
    
    const service = await Service.findOne({ serviceID });
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      pods: service.pods,
      count: service.pods.length
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get pods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 