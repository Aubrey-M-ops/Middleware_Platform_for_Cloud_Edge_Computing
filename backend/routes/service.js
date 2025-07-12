import express from 'express';
import Service from '../models/service.js';
import Node from '../models/node.js';
import { SERVICE_MOCK_DATA } from '../mock/service-mock-data.js';

const router = express.Router();

// POST /api/registerService - Register a new service
router.post('/api/registerService', async (req, res) => {
  try {
    const { 
      name, 
      version, 
      description, 
      serviceType, 
      nodeID, 
      nodeType, 
      endpoints, 
      resources, 
      environment, 
      labels,
      pods 
    } = req.body;
    
    // Validate required fields
    if (!name || !serviceType || !nodeID || !nodeType) {
      return res.status(400).json({
        error: 'Missing required fields: name, serviceType, nodeID, nodeType'
      });
    }
    
    // Generate service ID
    const serviceID = `${name}-${version || '1.0.0'}-${Date.now()}`;
    
    // Create service data
    const serviceData = {
      serviceID,
      name,
      version: version || '1.0.0',
      description: description || '',
      serviceType,
      nodeID,
      nodeType,
      endpoints: endpoints || [],
      resources: resources || { cpu: 0.1, memory: 128, storage: 1 },
      environment: environment || {},
      labels: labels || {},
      pods: pods || [],
      replicas: {
        desired: pods ? pods.length : 1,
        current: pods ? pods.length : 0,
        available: pods ? pods.filter(pod => pod.status === 'running').length : 0
      },
      status: 'registered'
    };
    
    // Check if node exists
    const node = await Node.findOne({ nodeID });
    if (!node) {
      return res.status(400).json({
        error: `Node ${nodeID} not found`
      });
    }
    
    // Create service
    const service = new Service(serviceData);
    await service.save();
    
    console.log(`[INFO] Service registered: ${serviceID} on ${nodeID}`);
    
    res.status(201).json({
      success: true,
      message: 'Service registered successfully',
      service: service
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to register service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/services - Get all services
router.get('/api/services', async (req, res) => {
  try {
    const { nodeID, status, serviceType } = req.query;
    let query = {};
    
    if (nodeID) query.nodeID = nodeID;
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    
    const services = await Service.find(query).lean();
    
    console.log(`[INFO] Returning ${services.length} services`);
    
    res.json({
      success: true,
      services: services,
      count: services.length
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/getService/:serviceID - Get specific service
router.get('/api/getService/:serviceID', async (req, res) => {
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
      service: service
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/updateService/:serviceID - Update service
router.put('/api/updateService/:serviceID', async (req, res) => {
  try {
    const { serviceID } = req.params;
    const updateData = req.body;
    
    // Remove immutable fields
    delete updateData.serviceID;
    delete updateData.createdAt;
    
    const service = await Service.findOneAndUpdate(
      { serviceID },
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }
    
    console.log(`[INFO] Service updated: ${serviceID}`);
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      service: service
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to update service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/deleteService/:serviceID - Delete service
router.delete('/api/deleteService/:serviceID', async (req, res) => {
  try {
    const { serviceID } = req.params;
    
    const service = await Service.findOneAndDelete({ serviceID });
    
    if (!service) {
      return res.status(404).json({
        error: 'Service not found'
      });
    }
    
    console.log(`[INFO] Service deleted: ${serviceID}`);
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to delete service:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mock/services - Get mock service data
router.get('/api/mock/services', async (req, res) => {
  try {
    res.json({
      success: true,
      data: SERVICE_MOCK_DATA
    });
  } catch (error) {
    console.error('[ERROR] Failed to get mock services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mock/services/seed - Seed mock services to database
router.post('/api/mock/services/seed', async (req, res) => {
  try {
    const { services } = SERVICE_MOCK_DATA;
    const results = [];
    
    for (const serviceData of services) {
      try {
        // Check if service already exists
        const existingService = await Service.findOne({ serviceID: serviceData.serviceID });
        
        if (existingService) {
          // Update existing service
          const updatedService = await Service.findOneAndUpdate(
            { serviceID: serviceData.serviceID },
            serviceData,
            { new: true }
          );
          results.push({ serviceID: serviceData.serviceID, action: 'updated', service: updatedService });
        } else {
          // Create new service
          const newService = new Service(serviceData);
          await newService.save();
          results.push({ serviceID: serviceData.serviceID, action: 'created', service: newService });
        }
      } catch (error) {
        results.push({ serviceID: serviceData.serviceID, action: 'failed', error: error.message });
      }
    }
    
    console.log(`[INFO] Seeded ${results.length} mock services`);
    
    res.json({
      success: true,
      message: 'Mock services seeded successfully',
      results: results
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to seed mock services:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 