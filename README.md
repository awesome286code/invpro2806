# Investment V2 - Full Stack Application

A modern full-stack investment portfolio management application built with **NestJS**, **React**, **PostgreSQL**, and **Socket.IO v4** for real-time communication. All client-server communication is handled exclusively through WebSocket events.

## 🏗️ Architecture

```
┌─────────────────┐         Socket.IO v4          ┌─────────────────┐
│                 │◄──────────────────────────────►│                 │
│  React Frontend │         WebSocket Only         │  NestJS Backend │
│   (Port 3000)   │         (No REST API)          │   (Port 3001)   │
│                 │                                 │                 │
└─────────────────┘                                 └────────┬────────┘
                                                             │
                                                             │
                                                    ┌────────▼────────┐
                                                    │   PostgreSQL    │
                                                    │   (Port 5432)   │
                                                    └─────────────────┘
```

## ✨ Features

- **🔐 Google OAuth Authentication** - Secure login with Google accounts
- **⚡ Real-time Communication** - Socket.IO v4 for all client-server interactions
- **📊 Investment Portfolio Management** - Track and manage investments
- **🐳 Docker Support** - Complete containerization with Docker Compose
- **🎨 Modern UI** - React with Tailwind CSS and Radix UI components
- **🔒 Secure WebSocket** - JWT-based WebSocket authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Google Cloud Console account (for OAuth credentials)

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
5. Copy your Client ID and Client Secret

### 2. Environment Configuration

**Backend** (`backend/.env`):
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=investment_db

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SOCKET_IO_CORS_ORIGIN=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

**Docker Compose** (`.env` in root):
```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

### 3. Running with Docker (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

## 🚀 Production Deployment

### Quick Deployment to VPS

This project includes automated CI/CD deployment to VPS using GitHub Actions.

**📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide**

#### Quick Setup:

1. **Setup VPS** (one-time):
   ```bash
   # On your VPS, run the automated setup script
   sudo bash scripts/vps-setup.sh
   ```

2. **Configure GitHub Secrets**:
   - `VPS_HOST` - Your VPS IP or domain
   - `VPS_USERNAME` - SSH username
   - `VPS_SSH_KEY` - Private SSH key
   - `GOOGLE_CLIENT_ID` - Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
   - `JWT_SECRET` - Production JWT secret
   - `DATABASE_PASSWORD` - Database password

3. **Deploy**:
   ```bash
   git push origin main
   # GitHub Actions will automatically deploy to your VPS!
   ```

#### Manual Deployment:

```bash
# On your VPS
cd /var/www/investment-v2
bash scripts/deploy.sh
```

### Features:
- ✅ Automatic deployment on push/merge to `main`
- ✅ Zero-downtime deployments
- ✅ Automated health checks
- ✅ Docker-based containerization
- ✅ SSL/HTTPS support with Nginx
- ✅ Database backups


The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **PostgreSQL**: localhost:5432

### 4. Running Locally (Development)

**Terminal 1 - Database:**
```bash
docker run -d \
  --name investment_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=investment_db \
  -p 5432:5432 \
  postgres:15-alpine
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

## 📡 Socket.IO Events

### Authentication Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `authenticate` | Client → Server | Authenticate with JWT token |
| `authenticated` | Server → Client | Authentication success confirmation |

### Investment Events

| Event | Direction | Description | Requires Auth |
|-------|-----------|-------------|---------------|
| `investments:get` | Client → Server | Get all user investments | ✅ |
| `investments:list` | Server → Client | Returns investment list | ✅ |
| `investments:create` | Client → Server | Create new investment | ✅ |
| `investments:created` | Server → Client | Investment created confirmation | ✅ |
| `investments:update` | Client → Server | Update investment | ✅ |
| `investments:updated` | Server → Client | Investment updated confirmation | ✅ |
| `investments:delete` | Client → Server | Delete investment | ✅ |
| `investments:deleted` | Server → Client | Investment deleted confirmation | ✅ |
| `investments:getById` | Client → Server | Get single investment | ✅ |
| `investments:detail` | Server → Client | Returns investment details | ✅ |

### Utility Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `ping` | Client → Server | Connection health check |
| `pong` | Server → Client | Health check response |

## 🛠️ Technology Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for PostgreSQL
- **Socket.IO v4** - Real-time WebSocket communication
- **Passport** - Authentication middleware
- **JWT** - Token-based authentication
- **PostgreSQL** - Relational database

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Socket.IO Client v4** - WebSocket client
- **@react-oauth/google** - Google OAuth integration
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Headless UI components

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server

## 📁 Project Structure

```
InvestmentV2/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── strategies/    # Passport strategies
│   │   │   ├── guards/        # WebSocket guards
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.module.ts
│   │   ├── entities/          # TypeORM entities
│   │   │   ├── user.entity.ts
│   │   │   └── investment.entity.ts
│   │   ├── socket/            # Socket.IO module
│   │   │   ├── socket.gateway.ts
│   │   │   ├── investment.service.ts
│   │   │   └── socket.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── GoogleLogin.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── services/          # Services
│   │   │   └── socket.service.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **WebSocket Guards** - Protected Socket.IO events
- **CORS Configuration** - Restricted origins
- **Environment Variables** - Sensitive data protection
- **Password Hashing** - bcrypt for password security
- **Helmet Headers** - Security headers via Nginx

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report
```

### Manual Testing

1. **Google OAuth Flow:**
   - Visit http://localhost:3000
   - Click "Sign in with Google"
   - Complete Google authentication
   - Verify redirect back to app with token

2. **Socket.IO Connection:**
   - Open browser DevTools → Network → WS
   - Verify WebSocket connection established
   - Check for `authenticated` event

3. **Investment Operations:**
   - Create investment via Socket.IO event
   - Verify real-time updates
   - Test update and delete operations

**Containers won't start:**
```bash
docker-compose down -v
docker-compose up --build
```

**Database connection errors:**
```bash
# Check if PostgreSQL is ready
docker-compose logs postgres

# Restart backend after database is ready
docker-compose restart backend
```

### Socket.IO Connection Issues

**Connection refused:**
- Check backend is running on port 3001
- Verify CORS settings in backend
- Check firewall/network settings

**Authentication fails:**
- Verify JWT token is being sent
- Check token expiration
- Verify Google OAuth credentials

### Build Errors

**Frontend build fails:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

**Backend build fails:**
```bash
cd backend
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

## 📝 Development Workflow

1. **Make changes** to backend or frontend code
2. **Test locally** with `npm run start:dev` (backend) or `npm run dev` (frontend)
3. **Build Docker images** with `docker-compose build`
4. **Test in Docker** with `docker-compose up`
5. **Commit changes** to version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Socket.IO for real-time capabilities
- Google for OAuth authentication
- React team for the UI library

---

**Built with ❤️ using NestJS, React, and Socket.IO**
