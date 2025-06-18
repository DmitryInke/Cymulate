# Phishing Simulation App

## Quick Start

### 1. Start Development Services
```bash
# Start MongoDB and MailHog SMTP server
docker-compose up -d

# Or start individual services:
docker-compose up mongodb mailhog -d
```

### 2. Create .env files
Copy environment variables:

**phishing-management-backend/.env:**
```
PORT=3002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/phishing_app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
TCP_HOST=localhost
TCP_PORT=3333
CORS_ORIGIN=http://localhost:3000
```

**phishing-simulation-backend/.env:**
```
NODE_ENV=development
TCP_HOST=localhost
TCP_PORT=3333
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_FROM=phishing-test@example.com
CLICK_TRACKING_BASE_URL=http://localhost:3002/api/phishing/click
```

### 3. Install Dependencies
```bash
npm run install:all
```

### 4. Start Services
```bash
# All services
npm run dev

# Or individual services
npm run dev:management    # Port 3002
npm run dev:simulation    # TCP Port 3333  
npm run dev:frontend      # Port 3000
```

## Architecture

- **MongoDB Database:** `phishing_app` (Port 27017)
- **MailHog SMTP Server:** Port 1025 (SMTP), Port 8025 (Web UI)
- **Management Backend:** Port 3002 (Authentication, CRUD, HTTP API)
- **Simulation Backend:** TCP Port 3333 (Email sending microservice)
- **Frontend:** Port 3000 (React app - coming soon)

## API Endpoints

### Management Backend (3002)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/phishing/attempts` - Get all attempts
- `POST /api/phishing/attempts` - Create attempt
- `POST /api/phishing/attempts/:id/send` - Send phishing email

### Simulation Backend (TCP 3333)
- `send_phishing_email` - TCP message pattern for sending emails
- `health_check` - TCP message pattern for health monitoring

### Development Tools
- **MailHog Web UI:** http://localhost:8025 - View sent emails
- **MongoDB:** mongodb://localhost:27017/phishing_app 