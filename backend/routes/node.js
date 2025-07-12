import express from 'express';
import Node from '../models/node.js';
import { ResourceParser } from '../utils/resourceParser.js';
import { updateNodeMetrics } from '../metrics.js';

const router = express.Router();

// POST /node/heartbeat - Receive node heartbeat
router.post('/heartbeat', async (req, res) => {
  try {
    const { nodeID, cpu, memory, network, nodeType, timestamp } = req.body;
    
    // Validate required fields
    if (!cpu || !memory || !network || !nodeType) {
      return res.status(400).json({ 
        error: 'Missing required fields: cpu, memory, network, nodeType' 
      });
    }

    // Generate nodeID if not provided
    const _nodeID = nodeID || `node-${Date.now()}`;
    
    // Parse resource data
    const parsedResources = ResourceParser.parseHeartbeat({
      nodeID: _nodeID,
      nodeType,
      cpu,
      memory,
      network,
      timestamp: timestamp || Date.now()
    });
    
    // Store node data in MongoDB
    const nodeData = {
      nodeID: _nodeID,
      cpu: parsedResources.cpu,
      memory: parsedResources.memory,
      network: parsedResources.network,
      nodeType,
      timestamp: timestamp || Date.now(),
      lastSeen: new Date()
    };
    
    // Upsert: update if exists, insert if not
    await Node.findOneAndUpdate(
      { nodeID: _nodeID },
      nodeData,
      { upsert: true, new: true }
    );
    
    // Update metrics
    updateNodeMetrics(parsedResources);
    
    console.log(`[INFO] Heartbeat received from ${_nodeID} (${nodeType})`);
    console.log(`[INFO] CPU Usage: ${parsedResources.cpu.usage}%, Memory Usage: ${parsedResources.memory.usage}%`);
    
    res.json({ 
      success: true, 
      message: 'Heartbeat received',
      nodeID: _nodeID,
      parsed: parsedResources
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to process heartbeat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/nodes - Get all active nodes
router.get('/api/nodes', async (req, res) => {
  try {
    // MongoDB TTL will automatically remove expired documents
    const activeNodes = await Node.find({}).lean();
    
    console.log(`[INFO] Returning ${activeNodes.length} active nodes`);
    
    res.json({
      success: true,
      nodes: activeNodes,
      count: activeNodes.length
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to get nodes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 