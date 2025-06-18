# 🎯 Phishing Simulation Platform

Full-featured platform for phishing attack simulation and cybersecurity awareness training.

## 📋 Description

The system consists of three main components:
- **Management Backend** (NestJS) - REST API for campaign management
- **Simulation Backend** (NestJS TCP) - Microservice for email sending
- **Frontend** (React + TypeScript) - Web interface for users

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────┐
│   React Frontend│    │ Management       │    │ Simulation     │
│   (Port 3000)   │◄───┤ Backend          │◄───┤ Backend        │
│                 │    │ (Port 3002)      │    │ (TCP 3333)     │
└─────────────────┘    └──────────────────┘    └────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌────────────────┐
                       │    MongoDB      │    │    MailHog     │
                       │  (Port 27017)   │    │ (Ports 1025/   │
                       │                 │    │      8025)     │
                       └─────────────────┘    └────────────────┘
```

## 🚀 Quick Start

### Requirements
- Docker
- Docker Compose

### Setup
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Cymulate
   ```

2. **Configure environment variables**
   ```bash
   # Copy example environment file
   cp env.example .env
   
   # Edit .env with your preferred settings (optional)
   # The default values work for local development
   ```

3. **Start the entire stack**
   ```bash
   # Start all services
   docker-compose up --build
   
   # Or run in background
   docker-compose up --build -d
   ```

### Available services
- **Frontend**: http://localhost:3000
- **Management API**: http://localhost:3002
- **MailHog Web UI**: http://localhost:8025
- **MongoDB**: localhost:27017

## ⚙️ Configuration

### Environment Variables
All configuration is managed through the `.env` file:

```env
# MongoDB Configuration
MONGO_INITDB_DATABASE=phishing_app

# Management Backend Configuration
MANAGEMENT_PORT=3002
MONGODB_URI=mongodb://mongodb:27017/phishing_app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000

# Simulation Backend Configuration
SIMULATION_TCP_HOST=0.0.0.0
SIMULATION_TCP_PORT=3333
EMAIL_HOST=mailhog
EMAIL_PORT=1025
EMAIL_FROM=phishing-test@example.com
CLICK_TRACKING_BASE_URL=http://localhost:3002/api/phishing/click

# Frontend Configuration
FRONTEND_PORT=3000

# Service Communication
TCP_HOST=simulation-backend
TCP_PORT=3333

# Development Environment
NODE_ENV=development
```

You can customize these values by editing the `.env` file before running `docker-compose up`.

### JWT Configuration
- **JWT_SECRET**: Secret key for signing JWT tokens (change in production!)
- **JWT_EXPIRES_IN**: Token expiration time (7d = 7 days, 1h = 1 hour, 30m = 30 minutes)

## 📊 Features

### 🔐 Authentication
- User registration and authorization
- JWT tokens with configurable expiration
- Protected routes

### 📧 Email Templates
- 5 pre-built templates:
  - 🔒 **Security** - Security notifications
  - 👥 **Social** - Social engineering
  - ⚡ **Urgency** - Urgent requests
  - 🎁 **Reward** - Rewards and prizes

### 📈 Tracking
- Email delivery status
- Click tracking
- Educational page on click

### 🎨 UI/UX
- Material-UI design
- Responsive layout
- Real-time email preview

## 🔧 Development

### Project Structure
```
Cymulate/
├── docker-compose.yml           # Main Docker Compose file
├── .env                   # Environment variables
├── env.example                  # Example environment file
├── phishing-frontend/           # React application
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
├── phishing-management-backend/ # REST API
│   ├── Dockerfile
│   ├── src/
│   │   ├── auth/
│   │   ├── phishing/
│   │   ├── users/
│   │   └── common/
│   └── package.json
└── phishing-simulation-backend/ # TCP microservice
    ├── Dockerfile
    ├── src/
    │   └── email/
    └── package.json
```

### API Endpoints

#### Authentication
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Token verification
```

#### Phishing Campaigns
```
POST /api/phishing/attempts           # Create campaign
GET  /api/phishing/attempts           # List campaigns
POST /api/phishing/attempts/:id/send  # Send email
GET  /api/phishing/click/:id          # Click tracking
```

#### Templates
```
GET /api/phishing/templates  # List templates
```

## 📝 Usage

### 1. Create Campaign
1. Go to http://localhost:3000
2. Register or log in
3. Select email template
4. Enter recipient email
5. Click "Send Phishing Email"

### 2. Check Email
1. Open MailHog: http://localhost:8025
2. Find the sent email
3. Click the link in the email

### 3. Educational Page
After clicking, the user will see an educational page explaining phishing attacks.

## 🛠️ Docker Commands

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build frontend
docker-compose build management-backend
docker-compose build simulation-backend

# View logs
docker-compose logs -f
docker-compose logs -f management-backend

# Clean volumes (delete MongoDB data)
docker-compose down -v
```

## 📊 Monitoring

### Logs
All services use structured logging:
- HTTP requests with execution time
- TCP communication
- Email sending
- Detailed error information

### Status Types
- 🟡 **PENDING** - Campaign created
- 🔵 **SENT** - Email sent
- 🎯 **CLICKED** - User clicked
- ❌ **FAILED** - Sending failed

## 🚨 Important Notes

### Security
- All API endpoints are JWT protected
- Tokens are automatically verified
- Click tracking without authentication (for email links)

### Email Testing
- Uses MailHog for safe testing
- All emails remain local
- Web UI for email viewing

### Performance
- TCP communication between backend services
- Optimized MongoDB queries with indexes and projections

## 🔧 Customization

### Changing Ports
Edit `.env` file:
```env
FRONTEND_PORT=3001        # Change frontend port
MANAGEMENT_PORT=3003      # Change backend port
SIMULATION_TCP_PORT=3334  # Change TCP port
```

### Changing Database
Edit `.env` file:
```env
MONGODB_URI=mongodb://your-mongo-host:27017/your_db
```

### JWT Settings
Edit `.env` file:
```env
JWT_SECRET=your-256-bit-secret-key
JWT_EXPIRES_IN=1h         # 1 hour
JWT_EXPIRES_IN=30m        # 30 minutes
JWT_EXPIRES_IN=7d         # 7 days
```

### Adding Email Templates
Templates are managed in the backend code at:
`phishing-management-backend/src/phishing/templates/email-templates.ts`

---

**🎯 Ready! The system is fully configured and ready to use.** 