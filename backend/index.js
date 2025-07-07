import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Node from './models/node.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloud-edge-platform';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[INFO] Connected to MongoDB');
  })
  .catch((error) => {
    console.error('[ERROR] MongoDB connection failed:', error);
  });

// POST /node/heartbeat - Receive node heartbeat
app.post('/node/heartbeat', async (req, res) => {
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
    
    // Store node data in MongoDB
    const nodeData = {
      nodeID: _nodeID,
      cpu,
      memory,
      network,
      nodeType,
      timestamp: timestamp || Date.now(),
      lastSeen: new Date()
    };
    
    // Upsert: update if exists, insert if not
    await Node.findOneAndUpdate(
      { nodeID: finalNodeID },
      nodeData,
      { upsert: true, new: true }
    );
    
    console.log(`[INFO] Heartbeat received from ${_nodeID} (${nodeType})`);
    
    res.json({ 
      success: true, 
      message: 'Heartbeat received',
      nodeID: _nodeID 
    });
    
  } catch (error) {
    console.error('[ERROR] Failed to process heartbeat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/nodes - Get all active nodes
app.get('/api/nodes', async (req, res) => {
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

// GET /healthz - Health check
app.get('/healthz', async (req, res) => {
  try {
    const nodeCount = await Node.countDocuments();
    res.json({ 
      ok: 1, 
      timestamp: Date.now(),
      activeNodes: nodeCount,
      database: 'MongoDB'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[INFO] Backend server started on port ${PORT}`);
  console.log(`[INFO] Database: ${MONGODB_URI}`);
  console.log(`[INFO] Available endpoints:`);
  console.log(`  - POST /node/heartbeat`);
  console.log(`  - GET /api/nodes`);
  console.log(`  - GET /healthz`);
});