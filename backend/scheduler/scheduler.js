import Service from '../models/service.js';
import Node from '../models/node.js';

export class Scheduler {
  
  /**
   * Find the best node for service deployment
   * @param {object} serviceRequirements - Service resource requirements
   * @param {string} preferredNodeType - Preferred node type (cloud/edge)
   * @returns {object|null} Best node or null if no suitable node found
   */
  static async findBestNode(serviceRequirements, preferredNodeType = null) {
    try {
      // Get all active nodes
      const activeNodes = await Node.find({}).lean();
      
      if (activeNodes.length === 0) {
        console.log('[WARN] No active nodes available for scheduling');
        return null;
      }
      
      // Filter by node type if specified
      let candidateNodes = activeNodes;
      if (preferredNodeType) {
        candidateNodes = activeNodes.filter(node => node.nodeType === preferredNodeType);
      }
      
      if (candidateNodes.length === 0) {
        console.log(`[WARN] No ${preferredNodeType || 'active'} nodes available`);
        return null;
      }
      
      // Score each node based on resource availability
      const scoredNodes = candidateNodes.map(node => {
        const score = this.calculateNodeScore(node, serviceRequirements);
        return { ...node, score };
      });
      
      // Sort by score (highest first)
      scoredNodes.sort((a, b) => b.score - a.score);
      
      console.log(`[INFO] Node scores: ${scoredNodes.map(n => `${n.nodeID}:${n.score.toFixed(2)}`).join(', ')}`);
      
      return scoredNodes[0];
      
    } catch (error) {
      console.error('[ERROR] Failed to find best node:', error);
      return null;
    }
  }
  
  /**
   * Calculate node score based on resource availability
   * @param {object} node - Node data
   * @param {object} requirements - Service requirements
   * @returns {number} Node score (0-100)
   */
  static calculateNodeScore(node, requirements) {
    try {
      let score = 100;
      
      // Parse node resources
      const cpuUsage = node.cpu?.usage || 0;
      const memoryUsage = node.memory?.usage || 0;
      const cpuCores = node.cpu?.cores || 1;
      const memoryTotal = node.memory?.total || 1024;
      
      // Calculate available resources
      const availableCPU = (100 - cpuUsage) / 100;
      const availableMemory = (100 - memoryUsage) / 100;
      
      // Check if node can accommodate service requirements
      const requiredCPU = requirements.cpu || 0.1;
      const requiredMemory = requirements.memory || 128;
      
      if (availableCPU < requiredCPU) {
        score -= 50; // Heavy penalty for insufficient CPU
      }
      
      if (availableMemory < (requiredMemory / memoryTotal)) {
        score -= 50; // Heavy penalty for insufficient memory
      }
      
      // Prefer nodes with more available resources
      score += (availableCPU * 20) + (availableMemory * 20);
      
      // Prefer cloud nodes for heavy services
      if (requirements.cpu > 0.5 || requirements.memory > 512) {
        if (node.nodeType === 'cloud') {
          score += 10;
        } else {
          score -= 10;
        }
      }
      
      // Prefer edge nodes for low-latency services
      if (requirements.labels?.latency === 'low') {
        if (node.nodeType === 'edge') {
          score += 15;
        } else {
          score -= 15;
        }
      }
      
      return Math.max(0, Math.min(100, score));
      
    } catch (error) {
      console.error('[ERROR] Failed to calculate node score:', error);
      return 0;
    }
  }
  
  /**
   * Schedule a service to the best available node
   * @param {object} serviceData - Service registration data
   * @returns {object} Scheduling result
   */
  static async scheduleService(serviceData) {
    try {
      const { name, version, serviceType, nodeType, resources, labels } = serviceData;
      
      // Find best node
      const bestNode = await this.findBestNode(resources, nodeType);
      
      if (!bestNode) {
        return {
          success: false,
          error: 'No suitable node found for service deployment'
        };
      }
      
      // Create service with scheduled node
      const serviceID = `${name}-${version || '1.0.0'}-${Date.now()}`;
      const scheduledService = {
        ...serviceData,
        serviceID,
        nodeID: bestNode.nodeID,
        nodeType: bestNode.nodeType,
        status: 'scheduled'
      };
      
      console.log(`[INFO] Service ${serviceID} scheduled to node ${bestNode.nodeID} (score: ${bestNode.score.toFixed(2)})`);
      
      return {
        success: true,
        service: scheduledService,
        node: bestNode,
        score: bestNode.score
      };
      
    } catch (error) {
      console.error('[ERROR] Failed to schedule service:', error);
      return {
        success: false,
        error: 'Scheduling failed'
      };
    }
  }
  
  /**
   * Get scheduling statistics
   * @returns {object} Scheduling statistics
   */
  static async getSchedulingStats() {
    try {
      const totalServices = await Service.countDocuments();
      const runningServices = await Service.countDocuments({ status: 'running' });
      const scheduledServices = await Service.countDocuments({ status: 'scheduled' });
      const errorServices = await Service.countDocuments({ status: 'error' });
      
      const cloudServices = await Service.countDocuments({ nodeType: 'cloud' });
      const edgeServices = await Service.countDocuments({ nodeType: 'edge' });
      
      return {
        total: totalServices,
        running: runningServices,
        scheduled: scheduledServices,
        error: errorServices,
        byNodeType: {
          cloud: cloudServices,
          edge: edgeServices
        }
      };
      
    } catch (error) {
      console.error('[ERROR] Failed to get scheduling stats:', error);
      return {};
    }
  }
  
  /**
   * Rebalance services across nodes
   * @returns {object} Rebalancing result
   */
  // NOTE: recommend nodes to the service
  static async rebalanceServices() {
    try {
      const services = await Service.find({ status: 'running' }).lean();
      const nodes = await Node.find({}).lean();
      
      let rebalancedCount = 0;
      const results = [];
      
      for (const service of services) {
        const currentNode = nodes.find(n => n.nodeID === service.nodeID);
        const bestNode = await this.findBestNode(service.resources, service.nodeType);
        
        if (bestNode && bestNode.nodeID !== service.nodeID) {
          // Check if the new node is significantly better
          const currentScore = this.calculateNodeScore(currentNode, service.resources);
          const newScore = bestNode.score;
          
          if (newScore > currentScore + 10) { // 10% improvement threshold
            results.push({
              serviceID: service.serviceID,
              fromNode: service.nodeID,
              toNode: bestNode.nodeID,
              scoreImprovement: newScore - currentScore
            });
            rebalancedCount++;
          }
        }
      }
      
      console.log(`[INFO] Rebalancing analysis: ${rebalancedCount} services can be moved`);
      
      return {
        success: true,
        rebalancedCount,
        recommendations: results
      };
      
    } catch (error) {
      console.error('[ERROR] Failed to rebalance services:', error);
      return {
        success: false,
        error: 'Rebalancing failed'
      };
    }
  }
} 