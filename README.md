# SmartEyes Backend

The core API server and business logic layer for the SmartEyes intelligent camera management system. Built with NestJS, this application provides RESTful APIs, WebSocket real-time communication, gRPC integration with AI services, and manages all data persistence for the SmartEyes platform.

## Overview

SmartEyes Backend is a robust, scalable server application that serves as the central orchestrator for:
- **Camera Management**: CRUD operations and stream control for RTSP/HTTP cameras
- **AI Detection Integration**: gRPC/HTTP communication with AI service for person detection
- **Real-time Communication**: WebSocket gateway for live updates to frontend clients
- **User Authentication**: JWT-based authentication with role-based access control
- **Multi-tenant Support**: Building-based data isolation for multiple properties
- **Security Monitoring**: Violation tracking, resident management, and event logging
- **Analytics**: Statistical aggregation and dashboard metrics
- **NGSI-LD Compliance**: Smart city standard data format support

The backend integrates seamlessly with the AI service for detection processing and serves real-time updates to the frontend dashboard.

## Features

### Authentication & Authorization
- **JWT Authentication**: Secure access/refresh token implementation with Passport.js
- **Role-Based Access Control (RBAC)**: 5-tier permission system
  - `SUPER_ADMIN`: Full system access
  - `ADMIN`: Building-level administration
  - `SUPERVISOR`: Security operations management
  - `SECURITY`: Guard-level monitoring
  - `VIEWER`: Read-only access
- **Multi-tenant Security**: Building-based data isolation
- **Session Management**: Token refresh and revocation

### Camera Management
- **CRUD Operations**: Complete camera lifecycle management
- **Stream Types**: RTSP, HTTP, FILE, WEBCAM support
- **Stream Control**: Start, stop, and monitor camera streams
- **Zone Management**: ENTRANCE, LOBBY, ELEVATOR, FLOOR, RESTRICTED area classification
- **Status Monitoring**: ONLINE, OFFLINE, ERROR, MAINTENANCE states
- **Metadata**: Location coordinates, building assignment, configuration

### AI Detection Integration
- **gRPC Client**: High-performance communication with AI service
- **HTTP Fallback**: REST API integration when gRPC unavailable
- **Person Detection**: Real-time detection processing and storage
- **Face Recognition**: Match detected faces against resident database
- **Batch Processing**: Efficient handling of multiple detections
- **Detection Storage**: Comprehensive event logging with metadata

### Real-time Communication
- **WebSocket Gateway**: Socket.IO-based real-time updates
- **Room-based Subscriptions**: Per-camera event channels
- **Frame Broadcasting**: Live detection frames with bounding boxes
- **Status Updates**: Stream and detection status changes
- **Heartbeat Mechanism**: Connection health monitoring

### Resident Management
- **Registration**: Resident profile and face enrollment
- **Face Encodings**: 512-dimensional ArcFace embeddings storage
- **Recognition Matching**: Identity verification from detections
- **Multi-building**: Building-level tenant isolation
- **Status Tracking**: ACTIVE, INACTIVE states

### Violation Management
- **Detection & Storage**: Security violation logging
- **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL classification
- **Rule Engine**: Configurable violation rules
- **Evidence Linking**: Association with detection events
- **Alert System**: Real-time notification triggers

### Statistics & Analytics
- **Dashboard Metrics**: Real-time counts and summaries
- **Camera Statistics**: Per-camera performance metrics
- **Detection Analytics**: Person count trends and patterns
- **Violation Reports**: Security incident summaries
- **Time-series Data**: Historical trend analysis

### Building Management
- **Multi-tenant Architecture**: Isolated data per building
- **Building CRUD**: Organization management
- **Hierarchy**: Building → Cameras, Residents, Users
- **Cross-tenant Security**: Strict data isolation

### NGSI-LD Integration
- **Smart City Standard**: NGSI-LD entity format support
- **Context Broker Ready**: Compatible with FIWARE/Scorpio
- **Entity Storage**: NGSI-LD entity persistence
- **Interoperability**: Standard-compliant data exchange

## Technology Stack

### Core Framework
- **NestJS 11.0.1** - Progressive Node.js framework
- **TypeScript 5.7.3** - Type-safe development
- **Node.js 18+** - Runtime environment

### Database & ORM
- **PostgreSQL** - Primary relational database
- **TypeORM 0.3.27** - ORM with entity management
- **Migrations** - Database version control

### Authentication & Security
- **Passport.js** - Authentication middleware
- **@nestjs/jwt** - JWT token management
- **bcrypt 6.0.0** - Password hashing
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

### Real-time Communication
- **@nestjs/websockets** - WebSocket support
- **Socket.IO** - Real-time bidirectional communication

### gRPC & Microservices
- **@grpc/grpc-js** - gRPC client/server
- **@grpc/proto-loader** - Protocol buffer loading
- **@nestjs/microservices** - Microservice support

### API Documentation
- **@nestjs/swagger** - OpenAPI/Swagger documentation
- **swagger-ui-express** - Interactive API docs

### HTTP & External Services
- **@nestjs/axios** - HTTP client module
- **Axios** - Promise-based HTTP requests

### Developer Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Prerequisites

Before you begin, ensure you have:
- **Node.js 18.x or higher** installed
- **Yarn** package manager
- **PostgreSQL 14+** database running
- **AI Service** running (see [ai-service/README.md](../ai-service/README.md))
- **Redis** (optional, for caching - future feature)

## Installation

1. **Clone the repository** (if not already done):
```bash
git clone <repository-url>
cd Smart-eyes/backend
```

2. **Install dependencies**:
```bash
yarn install
```

3. **Set up PostgreSQL database**:
```bash
# Create database
createdb smart_residential

# Or using psql
psql -U postgres
CREATE DATABASE smart_residential;
\q
```

## Configuration

### Environment Variables

Create a `.env` file in the backend root directory:

```env
# Application
NODE_ENV=development
PORT=8080
API_PREFIX=/api/v1

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=smart_residential
DB_SYNCHRONIZE=true    # Set to false in production
DB_LOGGING=true        # Set to false in production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
USE_GRPC=true
GRPC_URL=localhost:50051

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Application Settings
DEFAULT_ADMIN_EMAIL=admin@smarteyes.com
DEFAULT_ADMIN_PASSWORD=Admin@123456

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DEST=./temp/frames

# WebSocket
WS_PORT=8080
WS_PATH=/socket.io

# Logging
LOG_LEVEL=debug  # debug, info, warn, error
```

### Database Migration

```bash
# Run migrations (if any)
yarn typeorm migration:run

# Generate new migration
yarn typeorm migration:generate -n MigrationName

# Revert last migration
yarn typeorm migration:revert
```

### Seed Data

```bash
# Seed users (admin, supervisor, security accounts)
yarn seed:users

# Seed demo data (buildings, cameras, residents)
yarn seed:demo
```

## Running the Application

### Development Mode

Start the development server with hot-reloading:

```bash
yarn start:dev
```

The API will be available at [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

### Production Mode

Build and run the optimized production version:

```bash
# Build
yarn build

# Start production server
yarn start:prod
```

### Debug Mode

Run with debugging enabled:

```bash
yarn start:debug
```

Attach debugger to `localhost:9229`

## API Documentation

### Swagger UI

Once the application is running, access interactive API documentation:

**URL**: [http://localhost:8080/api/docs](http://localhost:8080/api/docs)

The Swagger UI provides:
- Complete API endpoint listing
- Request/response schemas
- Interactive API testing
- Authentication flow testing

### API Endpoints Overview

#### Authentication
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login and get JWT tokens
POST   /api/v1/auth/refresh           # Refresh access token
GET    /api/v1/auth/profile           # Get current user profile
POST   /api/v1/auth/logout            # Logout and invalidate token
PUT    /api/v1/auth/profile           # Update profile
PUT    /api/v1/auth/password          # Change password
```

#### Cameras
```
GET    /api/v1/cameras                # List all cameras (paginated)
GET    /api/v1/cameras/:id            # Get camera by ID
POST   /api/v1/cameras                # Create new camera
PUT    /api/v1/cameras/:id            # Update camera
DELETE /api/v1/cameras/:id            # Delete camera
POST   /api/v1/cameras/:id/start-stream     # Start camera stream
POST   /api/v1/cameras/:id/stop-stream      # Stop camera stream
GET    /api/v1/cameras/:id/stream-status    # Get stream status
GET    /api/v1/cameras/building/:buildingId # Cameras by building
```

#### Detections
```
GET    /api/v1/detections             # List detections (paginated, filtered)
GET    /api/v1/detections/:id         # Get detection by ID
POST   /api/v1/detections/process     # Process image for detection
GET    /api/v1/detections/events      # Real-time event stream
GET    /api/v1/detections/camera/:cameraId  # Detections by camera
GET    /api/v1/detections/stats       # Detection statistics
DELETE /api/v1/detections/:id         # Delete detection
```

#### Residents
```
GET    /api/v1/residents              # List residents
GET    /api/v1/residents/:id          # Get resident by ID
POST   /api/v1/residents              # Register new resident
PUT    /api/v1/residents/:id          # Update resident
DELETE /api/v1/residents/:id          # Delete resident
POST   /api/v1/residents/:id/enroll-face    # Enroll face encoding
GET    /api/v1/residents/building/:buildingId  # Residents by building
```

#### Violations
```
GET    /api/v1/violations             # List violations (paginated)
GET    /api/v1/violations/:id         # Get violation by ID
POST   /api/v1/violations             # Create violation manually
PUT    /api/v1/violations/:id         # Update violation
DELETE /api/v1/violations/:id         # Delete violation
GET    /api/v1/violations/camera/:cameraId  # Violations by camera
GET    /api/v1/violations/severity/:level   # Filter by severity
```

#### Buildings
```
GET    /api/v1/buildings              # List buildings
GET    /api/v1/buildings/:id          # Get building by ID
POST   /api/v1/buildings              # Create building
PUT    /api/v1/buildings/:id          # Update building
DELETE /api/v1/buildings/:id          # Delete building
```

#### Statistics
```
GET    /api/v1/statistics/dashboard   # Dashboard overview stats
GET    /api/v1/statistics/cameras     # Camera statistics
GET    /api/v1/statistics/detections  # Detection trends
GET    /api/v1/statistics/violations  # Violation summaries
GET    /api/v1/statistics/residents   # Resident analytics
```

#### Users (Admin only)
```
GET    /api/v1/users                  # List users
GET    /api/v1/users/:id              # Get user by ID
POST   /api/v1/users                  # Create user
PUT    /api/v1/users/:id              # Update user
DELETE /api/v1/users/:id              # Delete user
PUT    /api/v1/users/:id/role         # Change user role
PUT    /api/v1/users/:id/status       # Change user status
```

### WebSocket Events

Connect to WebSocket at `ws://localhost:8080`

#### Client → Server Events
```javascript
// Subscribe to camera updates
socket.emit('subscribe_camera', { cameraId: 'camera-01' })

// Unsubscribe from camera
socket.emit('unsubscribe_camera', { cameraId: 'camera-01' })

// Heartbeat
socket.emit('ping')
```

#### Server → Client Events
```javascript
// Frame update with detections
socket.on('frame_update', (data) => {
  // data: { cameraId, frame (base64), detections, timestamp }
})

// Stream status change
socket.on('stream_status_changed', (data) => {
  // data: { cameraId, status, timestamp }
})

// New violation alert
socket.on('violation_alert', (data) => {
  // data: { violation object }
})

// Heartbeat response
socket.on('pong', () => {})
```

## Project Structure

```
backend/
├── src/
│   ├── main.ts                       # Application entry point
│   ├── app.module.ts                 # Root application module
│   ├── app.controller.ts             # Health check endpoint
│   │
│   ├── config/
│   │   └── configuration.ts          # Centralized configuration
│   │
│   ├── common/                       # Shared utilities
│   │   ├── decorators/               # Custom decorators (Roles, Public, etc.)
│   │   ├── dto/                      # Shared DTOs
│   │   │   ├── api-response.dto.ts
│   │   │   ├── api-error-response.dto.ts
│   │   │   └── paginated-response.dto.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Global exception handler
│   │   ├── guards/                   # Auth guards
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts   # Response wrapper
│   │   └── pipes/                    # Validation pipes
│   │
│   ├── gateways/                     # WebSocket gateways
│   │   ├── events.gateway.ts         # Main WebSocket gateway
│   │   └── events.module.ts          # Gateway module
│   │
│   └── modules/                      # Feature modules
│       │
│       ├── auth/                     # Authentication & Authorization
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/           # Passport strategies
│       │   │   ├── jwt.strategy.ts
│       │   │   └── jwt-refresh.strategy.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── roles.guard.ts
│       │   ├── decorators/
│       │   │   ├── roles.decorator.ts
│       │   │   └── public.decorator.ts
│       │   └── dtos/
│       │       ├── login.dto.ts
│       │       ├── register.dto.ts
│       │       └── auth-response.dto.ts
│       │
│       ├── users/                    # User management
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── entities/
│       │   │   └── user.entity.ts
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       └── update-user.dto.ts
│       │
│       ├── cameras/                  # Camera management
│       │   ├── cameras.module.ts
│       │   ├── cameras.controller.ts
│       │   ├── services/
│       │   │   ├── cameras.service.ts
│       │   │   └── streaming.service.ts
│       │   ├── entities/
│       │   │   └── camera.entity.ts
│       │   └── dto/
│       │       ├── create-camera.dto.ts
│       │       ├── update-camera.dto.ts
│       │       └── stream-control.dto.ts
│       │
│       ├── detections/               # Detection processing
│       │   ├── detections.module.ts
│       │   ├── detections.controller.ts
│       │   ├── detections.service.ts
│       │   ├── grpc-detection.client.ts  # gRPC client for AI service
│       │   ├── entities/
│       │   │   └── detection.entity.ts
│       │   └── dto/
│       │       ├── process-detection.dto.ts
│       │       └── detection-response.dto.ts
│       │
│       ├── residents/                # Resident management
│       │   ├── residents.module.ts
│       │   ├── residents.controller.ts
│       │   ├── residents.service.ts
│       │   ├── entities/
│       │   │   └── resident.entity.ts
│       │   └── dto/
│       │       ├── create-resident.dto.ts
│       │       ├── update-resident.dto.ts
│       │       └── enroll-face.dto.ts
│       │
│       ├── violations/               # Violation management
│       │   ├── violations.module.ts
│       │   ├── violations.controller.ts
│       │   ├── violations.service.ts
│       │   ├── entities/
│       │   │   └── violation.entity.ts
│       │   └── dto/
│       │       ├── create-violation.dto.ts
│       │       └── update-violation.dto.ts
│       │
│       ├── buildings/                # Building management
│       │   ├── buildings.module.ts
│       │   ├── buildings.controller.ts
│       │   ├── buildings.service.ts
│       │   ├── entities/
│       │   │   └── building.entity.ts
│       │   └── dto/
│       │
│       ├── statistics/               # Analytics & statistics
│       │   ├── statistics.module.ts
│       │   ├── statistics.controller.ts
│       │   ├── statistics.service.ts
│       │   └── dto/
│       │       └── dashboard-stats.dto.ts
│       │
│       ├── tracking-routes/          # Person tracking
│       │   ├── tracking-routes.module.ts
│       │   ├── tracking-routes.controller.ts
│       │   ├── tracking-routes.service.ts
│       │   └── entities/
│       │       └── tracking-route.entity.ts
│       │
│       └── ngsi-lds/                 # NGSI-LD entities
│           ├── ngsi-lds.module.ts
│           ├── ngsi-lds.controller.ts
│           ├── ngsi-lds.service.ts
│           ├── entities/
│           │   └── ngsi-ld.entity.ts
│           └── dto/
│
├── proto/                            # gRPC protocol buffers
│   └── detection_service.proto
│
├── scripts/                          # Utility scripts
│   ├── seed-users.ts                 # Seed default users
│   └── seed-demo-data.ts             # Seed demo data
│
├── temp/                             # Temporary file storage
│   └── frames/                       # Uploaded frames
│
├── test/                             # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                              # Environment variables (create this)
├── .env.example                      # Example environment file
├── nest-cli.json                     # NestJS CLI configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json                      # Dependencies and scripts
```

## Database Schema

### Key Entities

#### User Entity
```typescript
- id: UUID
- email: string (unique)
- password: string (hashed)
- firstName: string
- lastName: string
- role: enum (SUPER_ADMIN, ADMIN, SUPERVISOR, SECURITY, VIEWER)
- status: enum (ACTIVE, INACTIVE, SUSPENDED)
- building_id: UUID (foreign key)
- created_at, updated_at
```

#### Camera Entity
```typescript
- id: UUID
- name: string
- stream_url: string
- type: enum (RTSP, HTTP, FILE, WEBCAM)
- status: enum (ONLINE, OFFLINE, ERROR, MAINTENANCE)
- zone_type: enum (ENTRANCE, LOBBY, ELEVATOR, FLOOR, RESTRICTED)
- latitude, longitude: decimal
- building_id: UUID (foreign key)
- config: JSON
- created_at, updated_at
```

#### Detection Entity
```typescript
- id: UUID
- camera_id: UUID (foreign key)
- resident_id: UUID (nullable, foreign key)
- person_id: number
- bbox: JSON [x, y, width, height]
- confidence: decimal
- face_detected: boolean
- face_encoding: float[]
- person_type: enum (RESIDENT, VISITOR, UNKNOWN)
- snapshot_url: string
- timestamp: datetime
- created_at
```

#### Resident Entity
```typescript
- id: UUID
- first_name, last_name: string
- email: string (nullable)
- phone: string (nullable)
- unit_number: string
- building_id: UUID (foreign key)
- face_encodings: JSON[]
- status: enum (ACTIVE, INACTIVE)
- created_at, updated_at
```

#### Violation Entity
```typescript
- id: UUID
- detection_id: UUID (foreign key)
- camera_id: UUID (foreign key)
- type: string
- severity: enum (LOW, MEDIUM, HIGH, CRITICAL)
- description: string
- evidence_url: string
- status: enum (PENDING, ACKNOWLEDGED, RESOLVED)
- timestamp: datetime
- created_at, updated_at
```

#### Building Entity
```typescript
- id: UUID
- name: string
- address: string
- latitude, longitude: decimal
- config: JSON
- created_at, updated_at
```

### Relationships
- Building (1) → Cameras (Many)
- Building (1) → Residents (Many)
- Building (1) → Users (Many)
- Camera (1) → Detections (Many)
- Resident (1) → Detections (Many)
- Detection (1) → Violation (1)

## Development

### Running Tests

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov

# Watch mode
yarn test:watch
```

### Code Quality

```bash
# Lint code
yarn lint

# Format code
yarn format

# Type check
yarn build
```

### Debugging

1. Start in debug mode: `yarn start:debug`
2. Attach debugger to port 9229
3. Set breakpoints in your IDE

### Adding a New Module

```bash
# Generate module with service and controller
nest g module modules/my-module
nest g service modules/my-module
nest g controller modules/my-module

# Generate entity
nest g class modules/my-module/entities/my-entity.entity --no-spec
```

## gRPC Integration

### AI Service Communication

The backend uses gRPC for high-performance communication with the AI service:

```typescript
// grpc-detection.client.ts
const client = new DetectionServiceClient(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// Detect person in image
const response = await client.DetectPerson({
  image: imageBuffer,
  camera_id: 'camera-01'
});
```

### Protocol Buffer Definition

See `proto/detection_service.proto` for message schemas.

To regenerate TypeScript definitions:
```bash
cd proto
./compile.sh  # Or manually run protoc
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Solution: Check PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql

# Verify credentials in .env
psql -U postgres -d smart_residential
```

**gRPC Connection Refused**
```bash
# Solution: Ensure AI service gRPC server is running
cd ../ai-service
python run_grpc_server.py

# Check port 50051 is open
netstat -tuln | grep 50051
```

**Port 8080 Already in Use**
```bash
# Solution: Kill process or change PORT in .env
lsof -ti:8080 | xargs kill -9
# Or edit .env: PORT=8081
```

**TypeORM Synchronize Issues**
```bash
# Solution: Drop and recreate database
dropdb smart_residential
createdb smart_residential
# Set DB_SYNCHRONIZE=true in .env
yarn start:dev
```

## Deployment

### Docker

```bash
# Build image
docker build -t smarteyes-backend .

# Run container
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=yourpassword \
  smarteyes-backend
```

### Docker Compose

See root `docker-compose.yml` for full stack deployment.

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Set `DB_SYNCHRONIZE=false`
- [ ] Configure `DB_LOGGING=false`
- [ ] Set up database migrations
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring (PM2, New Relic, etc.)
- [ ] Configure backup strategy
- [ ] Set up SSL/TLS certificates
- [ ] Use environment-based secrets management

### PM2 Deployment

```bash
# Build
yarn build

# Start with PM2
pm2 start dist/main.js --name smarteyes-backend

# Monitor
pm2 logs smarteyes-backend
pm2 monit
```

## Security Best Practices

- **Password Hashing**: bcrypt with salt rounds (10)
- **JWT Expiration**: Short access tokens (15-60 min), longer refresh tokens (7 days)
- **CORS**: Whitelist specific origins only
- **Input Validation**: class-validator on all DTOs
- **SQL Injection**: TypeORM parameterized queries
- **Rate Limiting**: Implement throttling on sensitive endpoints
- **Helmet**: Security headers enabled
- **HTTPS**: Use in production with valid certificates

## Performance Optimization

- **Database Indexing**: Index foreign keys and frequently queried columns
- **Query Optimization**: Use eager/lazy loading appropriately
- **Caching**: Implement Redis for frequently accessed data
- **Connection Pooling**: Configure TypeORM connection pool
- **Compression**: Enable gzip compression
- **CDN**: Serve static assets from CDN

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Follow NestJS style guide and conventions
3. Write tests for new features
4. Update API documentation (Swagger decorators)
5. Commit with conventional commits: `feat:`, `fix:`, `docs:`, etc.
6. Create pull request with description

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check existing documentation
- Review Swagger API docs at `/api/docs`
- Contact the development team

## License

Part of the SmartEyes project. See root LICENSE file for details.

---

**SmartEyes Backend** - Core API & Business Logic Layer  
Built with NestJS and TypeScript
