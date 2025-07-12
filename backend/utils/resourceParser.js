export class ResourceParser {
  /**
   * Parse CPU usage from /proc/stat output
   * @param {string} cpuData - Raw CPU data from /proc/stat
   * @returns {object} Parsed CPU metrics
   */
  static parseCPU(cpuData) {
    try {
      const lines = cpuData.trim().split('\n');
      const cpuLine = lines.find(line => line.startsWith('cpu '));
      
      if (!cpuLine) {
        return { usage: 0, cores: 0, load: 0 };
      }
      
      const parts = cpuLine.split(/\s+/);
      const user = parseInt(parts[1]) || 0;
      const nice = parseInt(parts[2]) || 0;
      const system = parseInt(parts[3]) || 0;
      const idle = parseInt(parts[4]) || 0;
      const iowait = parseInt(parts[5]) || 0;
      const irq = parseInt(parts[6]) || 0;
      const softirq = parseInt(parts[7]) || 0;
      
      const total = user + nice + system + idle + iowait + irq + softirq;
      const used = total - idle - iowait;
      const usage = total > 0 ? (used / total) * 100 : 0;
      
      return {
        usage: Math.round(usage * 100) / 100,
        cores: this.getCPUCores(),
        load: this.getLoadAverage()
      };
    } catch (error) {
      console.error('[ERROR] Failed to parse CPU data:', error);
      return { usage: 0, cores: 0, load: 0 };
    }
  }
  
  /**
   * Parse memory usage from free command output
   * @param {string} memoryData - Raw memory data from free command
   * @returns {object} Parsed memory metrics
   */
  static parseMemory(memoryData) {
    try {
      const lines = memoryData.trim().split('\n');
      const memLine = lines.find(line => line.startsWith('Mem:'));
      
      if (!memLine) {
        return { total: 0, used: 0, free: 0, usage: 0 };
      }
      
      const parts = memLine.split(/\s+/);
      const total = parseInt(parts[1]) || 0;
      const used = parseInt(parts[2]) || 0;
      const free = parseInt(parts[3]) || 0;
      const shared = parseInt(parts[4]) || 0;
      const cache = parseInt(parts[5]) || 0;
      const available = parseInt(parts[6]) || 0;
      
      const actualUsed = total - available;
      const usage = total > 0 ? (actualUsed / total) * 100 : 0;
      
      return {
        total: total,
        used: actualUsed,
        free: available,
        usage: Math.round(usage * 100) / 100,
        shared: shared,
        cache: cache
      };
    } catch (error) {
      console.error('[ERROR] Failed to parse memory data:', error);
      return { total: 0, used: 0, free: 0, usage: 0 };
    }
  }
  
  /**
   * Parse network statistics from /proc/net/dev output
   * @param {string} networkData - Raw network data from /proc/net/dev
   * @returns {object} Parsed network metrics
   */
  static parseNetwork(networkData) {
    try {
      const lines = networkData.trim().split('\n');
      const interfaces = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [name, stats] = line.split(':');
          const interfaceName = name.trim();
          
          // Skip loopback and virtual interfaces
          if (interfaceName.startsWith('lo') || 
              interfaceName.startsWith('docker') || 
              interfaceName.startsWith('veth')) {
            return;
          }
          
          const parts = stats.trim().split(/\s+/);
          if (parts.length >= 16) {
            const rxBytes = parseInt(parts[0]) || 0;
            const rxPackets = parseInt(parts[1]) || 0;
            const rxErrors = parseInt(parts[2]) || 0;
            const txBytes = parseInt(parts[8]) || 0;
            const txPackets = parseInt(parts[9]) || 0;
            const txErrors = parseInt(parts[10]) || 0;
            
            interfaces[interfaceName] = {
              rxBytes,
              rxPackets,
              rxErrors,
              txBytes,
              txPackets,
              txErrors,
              totalBytes: rxBytes + txBytes
            };
          }
        }
      });
      
      return interfaces;
    } catch (error) {
      console.error('[ERROR] Failed to parse network data:', error);
      return {};
    }
  }
  
  /**
   * Get CPU core count
   * @returns {number} Number of CPU cores
   */
  static getCPUCores() {
    try {
      const fs = require('fs');
      const cpuInfo = fs.readFileSync('/proc/cpuinfo', 'utf8');
      const cores = cpuInfo.split('\n').filter(line => line.startsWith('processor')).length;
      return cores || 1;
    } catch (error) {
      return 1;
    }
  }
  
  /**
   * Get system load average
   * @returns {object} Load average for 1, 5, 15 minutes
   */
  static getLoadAverage() {
    try {
      const fs = require('fs');
      const loadavg = fs.readFileSync('/proc/loadavg', 'utf8');
      const parts = loadavg.split(' ');
      return {
        '1min': parseFloat(parts[0]) || 0,
        '5min': parseFloat(parts[1]) || 0,
        '15min': parseFloat(parts[2]) || 0
      };
    } catch (error) {
      return { '1min': 0, '5min': 0, '15min': 0 };
    }
  }
  
  /**
   * Parse all resource data from agent heartbeat
   * @param {object} heartbeatData - Raw heartbeat data from agent
   * @returns {object} Parsed resource metrics
   */
  static parseHeartbeat(heartbeatData) {
    const { cpu, memory, network, nodeID, nodeType, timestamp } = heartbeatData;
    
    return {
      nodeID,
      nodeType,
      timestamp,
      cpu: this.parseCPU(cpu),
      memory: this.parseMemory(memory),
      network: this.parseNetwork(network),
      parsedAt: Date.now()
    };
  }
} 