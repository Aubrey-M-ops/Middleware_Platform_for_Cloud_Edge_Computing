# Backend Routes Documentation

## 📁 File Structure

```
backend/routes/
├── index.js          # Route index file, unified management of all routes
├── node.js           # Node management routes
├── service.js        # Service management routes
├── schedule.js       # Scheduling management routes
├── pod.js            # Pod management routes
├── service-pod.js    # Service Pod management routes
├── health.js         # Health check and monitoring routes
└── README.md         # This documentation
```

## 🔧 Module Description

### 1. `index.js` - Route Index
- **Purpose**: Unified management and export of all route modules
- **Function**: Mount all route modules to the main application

### 2. `node.js` - Node Management
- **Path**: `/node/*`
- **Functions**:
  - `POST /node/heartbeat` - Receive node heartbeat
  - `GET /api/nodes` - Get all active nodes

### 3. `service.js` - Service Management
- **Path**: `/api/services/*`
- **Functions**:
  - `POST /api/registerService` - Register new service
  - `GET /api/services` - Get all services
  - `GET /api/services/:serviceID` - Get specific service
  - `PUT /api/services/:serviceID` - Update service
  - `DELETE /api/services/:serviceID` - Delete service
  - `GET /api/mock/services` - Get mock service data
  - `POST /api/mock/services/seed` - Import mock service data

### 4. `schedule.js` - Scheduling Management
- **Path**: `/api/schedule/*`
- **Functions**:
  - `POST /api/schedule` - Schedule service
  - `GET /api/schedule/stats` - Get scheduling statistics
  - `POST /api/schedule/rebalance` - Rebalance services

### 5. `pod.js` - Pod Management
- **Path**: `/api/pods/*`
- **Functions**:
  - `POST /api/createPod` - Create new Pod
  - `GET /api/pods` - Get all Pods
  - `GET /api/getPod/:podID` - Get specific Pod
  - `PUT /api/updatePod/:podID` - Update Pod
  - `DELETE /api/deletePod/:podID` - Delete Pod
  - `POST /api/restartPod/:podID` - Restart Pod

### 6. `service-pod.js` - Service Pod Management
- **Path**: `/api/services/:serviceID/pods/*`
- **Functions**:
  - `POST /api/services/:serviceID/pods` - Add Pod to service
  - `PUT /api/services/:serviceID/pods/:podID` - Update Pod in service
  - `DELETE /api/services/:serviceID/pods/:podID` - Remove Pod from service
  - `GET /api/services/:serviceID/pods` - Get Pods for service

### 7. `health.js` - Health Check and Monitoring
- **Path**: `/healthz`, `/metrics`
- **Functions**:
  - `GET /healthz` - Health check
  - `GET /metrics` - Prometheus metrics endpoint

## 🚀 Usage

### Use in main file:
```javascript
import routes from './routes/index.js';

// Mount all routes
app.use('/', routes);
```

### Use individual route module:
```javascript
import nodeRoutes from './routes/node.js';

// Only mount node routes
app.use('/', nodeRoutes);
```

## 📋 API Endpoints Overview

### Node Management
- `POST /node/heartbeat` - Node heartbeat
- `GET /api/nodes` - Get node list

### Service Management
- `POST /api/registerService` - Register service
- `GET /api/services` - Get service list
- `GET /api/services/:serviceID` - Get specific service
- `PUT /api/services/:serviceID` - Update service
- `DELETE /api/services/:serviceID` - Delete service

### Scheduling Management
- `POST /api/schedule` - Schedule service
- `GET /api/schedule/stats` - Scheduling statistics
- `POST /api/schedule/rebalance` - Rebalance

### Pod Management
- `POST /api/createPod` - Create Pod
- `GET /api/pods` - Get Pod list
- `GET /api/getPod/:podID` - Get specific Pod
- `PUT /api/updatePod/:podID` - Update Pod
- `DELETE /api/deletePod/:podID` - Delete Pod
- `POST /api/restartPod/:podID` - Restart Pod

### Service Pod Management
- `POST /api/services/:serviceID/pods` - Add Pod to service
- `PUT /api/services/:serviceID/pods/:podID` - Update Pod in service
- `DELETE /api/services/:serviceID/pods/:podID` - Remove Pod from service
- `GET /api/services/:serviceID/pods` - Get service Pod list

### Monitoring and Health Check
- `GET /healthz` - Health check
- `GET /metrics` - Prometheus metrics

## 🔄 Modular Advantages

1. **Code Organization**: Separated by functional modules, easy to maintain
2. **Scalability**: New features only need to add new route files
3. **Reusability**: Route modules can be used independently
4. **Test-Friendly**: Each module can be tested independently
5. **Team Collaboration**: Different developers can focus on different modules

## 📝 Adding New Routes

1. Create a new route file in the `routes/` directory
2. Import and mount the new route in `routes/index.js`
3. Update this documentation to describe the new route functionality 