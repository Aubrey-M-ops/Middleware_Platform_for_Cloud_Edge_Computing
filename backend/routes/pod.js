import express from 'express';
import Pod from '../models/pod.js';
import Service from '../models/service.js';

const router = express.Router();

// POST /api/createPod - Create a new pod
router.post('/api/createPod', async (req, res) => {
  try {
    const { serviceID, nodeID, nodeType, resources, environment, labels } = req.body;
    
    // Validate required fields
    if (!serviceID || !nodeID || !nodeType) {
      return res.status(400).json({
        error: 'Missing required fields: serviceID, nodeID, nodeType'
      });
    }
    
    // Check if service exists
    const service = await Service.findOne({ serviceID });
    if (!service) {
      return res.status(400).json({
        error: `Service ${serviceID} not found`
      });
    }
    
    // Create pod data
    const podData = {
      serviceID,
      nodeID,
      nodeType,
      resources: resources || service.resources,
      environment: environment || service.environment,
      labels: labels || service.labels,
      endpoints: service.endpoints
    };
    
    const pod = new Pod(podData);
    await pod.save();
    
    // Update service replica count
    await Service.findOneAndUpdate(
      { serviceID },
      { $inc: { 'replicas.current': 1 } }
    );
    
    console.log(`[INFO] Pod created: ${pod.podID} for service ${serviceID}`);
    
    res.status(201).json({
      success: true,
      message: 'Pod created successfully',
      pod: pod
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to create pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pods - Get all pods
router.get('/api/pods', async (req, res) => {
  try {
    const { serviceID, nodeID, status } = req.query;
    let query = {};
    
    if (serviceID) query.serviceID = serviceID;
    if (nodeID) query.nodeID = nodeID;
    if (status) query.status = status;
    
    const pods = await Pod.find(query).lean();
    
    console.log(`[INFO] Returning ${pods.length} pods`);
    
    res.json({
      success: true,
      pods: pods,
      count: pods.length
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get pods:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/getPod/:podID - Get specific pod
router.get('/api/getPod/:podID', async (req, res) => {
  try {
    const { podID } = req.params;
    
    const pod = await Pod.findOne({ podID });
    
    if (!pod) {
      return res.status(404).json({
        error: 'Pod not found'
      });
    }
    
    res.json({
      success: true,
      pod: pod
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/updatePod/:podID - Update pod
router.put('/api/updatePod/:podID', async (req, res) => {
  try {
    const { podID } = req.params;
    const updateData = req.body;
    
    // Remove immutable fields
    delete updateData.podID;
    delete updateData.serviceID;
    delete updateData.createdAt;
    
    const pod = await Pod.findOneAndUpdate(
      { podID },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!pod) {
      return res.status(404).json({
        error: 'Pod not found'
      });
    }
    
    console.log(`[INFO] Pod updated: ${podID}`);
    
    res.json({
      success: true,
      message: 'Pod updated successfully',
      pod: pod
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to update pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/deletePod/:podID - Delete pod
router.delete('/api/deletePod/:podID', async (req, res) => {
  try {
    const { podID } = req.params;
    
    const pod = await Pod.findOneAndDelete({ podID });
    
    if (!pod) {
      return res.status(404).json({
        error: 'Pod not found'
      });
    }
    
    // Update service replica count
    await Service.findOneAndUpdate(
      { serviceID: pod.serviceID },
      { $inc: { 'replicas.current': -1 } }
    );
    
    console.log(`[INFO] Pod deleted: ${podID}`);
    
    res.json({
      success: true,
      message: 'Pod deleted successfully'
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to delete pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/restartPod/:podID - Restart pod
router.post('/api/pods/:podID/restart', async (req, res) => {
  try {
    const { podID } = req.params;
    
    const pod = await Pod.findOne({ podID });
    
    if (!pod) {
      return res.status(404).json({
        error: 'Pod not found'
      });
    }
    
    await pod.restart();
    
    console.log(`[INFO] Pod restarted: ${podID}`);
    
    res.json({
      success: true,
      message: 'Pod restarted successfully',
      pod: pod
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to restart pod:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 