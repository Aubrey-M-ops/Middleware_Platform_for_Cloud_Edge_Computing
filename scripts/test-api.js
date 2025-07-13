#!/usr/bin/env node

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// Test data
const testNode = {
  nodeID: 'test-node-1',
  cpu: 'cpu 123456 12345 123456 1234567 12345 12345 12345 12345 0 0',
  memory: 'Mem: 8192 4096 4096 0 0 0',
  network: 'eth0: 123456 12345 0 0 0 0 0 0 123456 12345 0 0 0 0 0 0',
  nodeType: 'edge',
  timestamp: Date.now()
};

const testService = {
  name: 'test-service',
  version: '1.0.0',
  description: 'A test service',
  serviceType: 'rest',
  nodeID: 'test-node-1',
  nodeType: 'edge',
  endpoints: [
    {
      protocol: 'http',
      port: 4000,
      path: '/api',
      healthCheck: '/health'
    }
  ],
  resources: {
    cpu: 0.5,
    memory: 512,
    storage: 1
  },
  environment: {
    NODE_ENV: 'test'
  },
  labels: {
    latency: 'low',
    priority: 'high'
  }
};

const testScheduleRequest = {
  name: 'scheduled-service',
  serviceType: 'rest',
  nodeType: 'edge',
  resources: {
    cpu: 0.3,
    memory: 256
  },
  labels: {
    latency: 'low'
  }
};

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    console.log(`${method} ${endpoint} - Status: ${response.status}`);
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('---');
    
    return { status: response.status, data: result };
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.message);
    return { status: 0, data: null };
  }
}

// Test functions
async function testNodeHeartbeat() {
  console.log('🧪 Testing Node Heartbeat...');
  return await makeRequest('POST', '/node/heartbeat', testNode);
}

async function testGetNodes() {
  console.log('🧪 Testing Get Nodes...');
  return await makeRequest('GET', '/api/nodes');
}

async function testServiceRegistration() {
  console.log('🧪 Testing Service Registration...');
  return await makeRequest('POST', '/api/services', testService);
}

async function testGetServices() {
  console.log('🧪 Testing Get Services...');
  return await makeRequest('GET', '/api/services');
}

async function testServiceScheduling() {
  console.log('🧪 Testing Service Scheduling...');
  return await makeRequest('POST', '/api/schedule', testScheduleRequest);
}

async function testGetScheduleStats() {
  console.log('🧪 Testing Get Schedule Stats...');
  return await makeRequest('GET', '/api/schedule/stats');
}

async function testRebalanceServices() {
  console.log('🧪 Testing Rebalance Services...');
  return await makeRequest('POST', '/api/schedule/rebalance');
}

async function testHealthCheck() {
  console.log('🧪 Testing Health Check...');
  return await makeRequest('GET', '/healthz');
}

async function testMetrics() {
  console.log('🧪 Testing Metrics Endpoint...');
  return await makeRequest('GET', '/metrics');
}

// Test functions for mock data
async function testGetMockServices() {
  console.log('🧪 Testing Get Mock Services...');
  return await makeRequest('GET', '/api/mock/services');
}

async function testSeedMockServices() {
  console.log('🧪 Testing Seed Mock Services...');
  return await makeRequest('POST', '/api/mock/services/seed');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  const results = [];
  
  // Test node management
  results.push(await testNodeHeartbeat());
  results.push(await testGetNodes());
  
  // Test service management
  results.push(await testServiceRegistration());
  results.push(await testGetServices());
  
  // Test scheduling
  results.push(await testServiceScheduling());
  results.push(await testGetScheduleStats());
  results.push(await testRebalanceServices());
  
  // Test mock data
  results.push(await testGetMockServices());
  results.push(await testSeedMockServices());
  
  // Test monitoring
  results.push(await testHealthCheck());
  results.push(await testMetrics());
  
  // Summary
  console.log('📊 Test Summary:');
  const passed = results.filter(r => r.status >= 200 && r.status < 300).length;
  const failed = results.length - passed;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Check the output above for details.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export {
  makeRequest,
  testNodeHeartbeat,
  testGetNodes,
  testServiceRegistration,
  testGetServices,
  testServiceScheduling,
  testGetScheduleStats,
  testRebalanceServices,
  testHealthCheck,
  testMetrics,
  runTests
}; 