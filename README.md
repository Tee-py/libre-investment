# 🏦 Libre Investment API

A secure and scalable API for managing investment transactions in fund tokens across multiple blockchain networks.

## 🚀 Project Setup

### 📋 Prerequisites
- 🐳 Docker and Docker Compose
- ⚡ Node.js (v18 or higher)
- 📦 npm or yarn

### ⚙️ Local Setup Using Docker

1. 📥 Clone the repository:
```bash
git clone <repository-url>
cd libre-investment
```

2. 📝 Create environment files:
```bash
cp .env.example .env.dev
```

3. 🔧 Update the environment variables in `.env.dev`:
```env
JWT_SECRET=your-secret-key
POLYGON_AMOY_RPC="https://polygon-amoy-bor-rpc.publicnode.com"
BASE_SEPOLIA_RPC="https://sepolia.base.org"
```
> Note: The nodes are free nodes. You can update to your personal testnet rpcs

4. 🚀 Start the services:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- [API service](http://localhost:4000)
- PostgreSQL database (port 5432)
- Redis (port 6379)
- [Prisma Studio](http://localhost:5555)
- Contract Indexer
- Transaction Monitor

> Before starting the API, it also seeds the database with a deployed FundToken that can be used for local testing

## 📚 API Documentation

### 🏥 Health Check

The health check endpoint provides detailed information about the system's status and its dependencies.

```http
GET /api/health
```

Response:
```json
{
  "uptime": "5m 30s",
  "message": "OK",
  "timestamp": 1700000000000,
  "checks": {
    "app": {
      "status": "up",
      "timestamp": 1700000000000
    },
    "database": {
      "status": "up",
      "timestamp": 1700000000000
    },
    "redis": {
      "status": "up",
      "timestamp": 1700000000000
    },
    "baseSepoliaRpc": {
      "status": "up",
      "currentBlock": 1234567,
      "timestamp": 1700000000000
    },
    "polygonAmoyRpc": {
      "status": "up",
      "currentBlock": 1234567,
      "timestamp": 1700000000000
    }
  }
}
```

The endpoint checks:
- 🏢 Application uptime
- 💾 Database connection
- 🔄 Redis connection
- ⛓️ Base Sepolia RPC connection and current block
- ⛓️ Polygon Amoy RPC connection and current block

Status Codes:
- 200: All systems operational
- 503: One or more systems are down

### 🔐 Authentication

The API uses JWT-based authentication with [SIWE (Sign-In with Ethereum)](https://docs.login.xyz/) for secure wallet-based authentication.

#### 🔄 Authentication Flow

1. 🔑 Get Nonce
```http
POST /api/auth/nonce
Content-Type: application/json

{
  "address": "0x..."
}
```

Possible Error Responses:
```json
// Validation Error (400)
{
  "error": "Validation Error",
  "message": "Validation failed",
  "data": [
    {
      "path": "body.address",
      "message": "address is required"
    }
  ]
}

// Redis Error (500)
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

2. ✍️ Sign Message
- Client signs the message using their wallet
- Message format follows [SIWE](https://docs.login.xyz/) standard

3. 🔓 Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "message": "signed message",
  "signature": "signature"
}
```

Possible Error Responses:
```json
// Validation Error (400)
{
  "error": "Validation Error",
  "message": "Validation failed",
  "data": [
    {
      "path": "body.message",
      "message": "message is required"
    }
  ]
}

// Authentication Error (401)
{
  "error": "Authentication Error",
  "message": "Invalid nonce"
}

// Contract Error (400)
{
  "error": "Contract Error",
  "message": "Error during contract call: Invalid signature"
}
```

4. 🎫 Use Token
- Include the JWT token in subsequent requests:
```http
Authorization: Bearer <token>
```

### 💰 Investment Endpoints

All investment endpoints require authentication.

#### 📈 Get Investment Transaction
```http
POST /api/investment/transactions/invest
Authorization: Bearer <token>
Content-Type: application/json

{
  "fund": "<fund token address>",
  "usdAmount": 100
}
```

Possible Error Responses:
```json
// Validation Error (400)
{
  "error": "Validation Error",
  "message": "Validation failed",
  "data": [
    {
      "path": "body.usdAmount",
      "message": "usdAmount cannot be less than zero"
    }
  ]
}

// API Error (400)
{
  "error": "API Error",
  "message": "FundToken with address 0x... and chain 84532 not found"
}

// RPC Error (400)
{
  "error": "RPC Error",
  "message": "An Error occurred: Failed to get transaction count"
}
```

#### 📉 Get Redemption Transaction
```http
POST /api/investment/transactions/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "fund": "<fund token address>",
  "share": 10
}
```

Possible Error Responses:
```json
// Validation Error (400)
{
  "error": "Validation Error",
  "message": "Validation failed",
  "data": [
    {
      "path": "body.share",
      "message": "share cannot be less than zero"
    }
  ]
}

// API Error (400)
{
  "error": "API Error",
  "message": "FundToken with address 0x... and chain 84532 not found"
}

// RPC Error (400)
{
  "error": "RPC Error",
  "message": "An Error occurred: Failed to get transaction count"
}
```

#### 📤 Publish Transaction
```http
POST /api/investment/transactions/publish
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "invest" | "redeem",
  "fund": "<fund token address>",
  "signedTransaction": "0x..."
}
```

Possible Error Responses:
```json
// Validation Error (400)
{
  "error": "Validation Error",
  "message": "Validation failed",
  "data": [
    {
      "path": "body.type",
      "message": "type must be either 'invest' or 'redeem'"
    }
  ]
}

// API Error (400)
{
  "error": "API Error",
  "message": "Invalid transaction. Expected chainId: 84532 found chainId: 80002"
}

// Contract Error (400)
{
  "error": "Contract Error",
  "message": "Insufficient funds for transaction"
}

// RPC Error (400)
{
  "error": "RPC Error",
  "message": "An Error occurred: Failed to submit transaction"
}
```

#### 💵 Get Investor Balance
```http
GET /api/investment/:fund/balance
Authorization: Bearer <token>
```

Possible Error Responses:
```json
// API Error (400)
{
  "error": "API Error",
  "message": "FundToken with address 0x... and chain 84532 not found"
}

// RPC Error (400)
{
  "error": "RPC Error",
  "message": "An Error occurred: Failed to get balance"
}
```

#### 📊 Get Fund Metrics
```http
GET /api/investment/:fund/metrics
Authorization: Bearer <token>
```

Possible Error Responses:
```json
// API Error (400)
{
  "error": "API Error",
  "message": "FundToken with address 0x... not found"
}

// RPC Error (400)
{
  "error": "RPC Error",
  "message": "An Error occurred: Failed to get fund metrics"
}
```

#### 📜 Get Transaction History
```http
GET /api/investment/transactions?page=1
Authorization: Bearer <token>
```

Possible Error Responses:
```json
// Validation Error (400)
{
  "error": "Validation Error",
  "message": "Validation failed",
  "data": [
    {
      "path": "query.page",
      "message": "page must be a positive number"
    }
  ]
}
```

## 🏗️ Main Design Decisions

### 1. 🔒 Security
- 🛡️ **SIWE Authentication**: Uses Sign-In with Ethereum for secure wallet-based authentication
- 🔑 **JWT Tokens**: Implements JWT for session management
- ⏱️ **Rate Limiting**: Implements different rate limits for auth and regular endpoints
- 🌐 **CORS Protection**: Whitelists specific origins for API access
- 🪖 **Helmet**: Implements neccesary security headers

### 2. 🏛️ Architecture
- 🏢 **Microservices**: Separate services for API, Indexer, and Monitor
- 🔄 **Event-Driven**: Uses blockchain events for real-time updates
- 🚀 **Caching**: Implements Redis caching for performance optimization
- 💾 **Database**: Uses PostgreSQL with Prisma ORM for data persistence

### 3. ⛓️ Blockchain Integration
- 🌐 **Multi-Chain Support**: Supports multiple blockchain networks (Base Sepolia, Polygon Amoy)
- 💱 **Transaction Management**: Handles transaction creation, signing, and publishing
- 📡 **Event Indexing**: Tracks blockchain events for transaction status updates

### 4. ⚠️ Error Handling
- 🎯 **Custom Error Types**: Implements specific error types for different scenarios
- 🎛️ **Centralized Error Handling**: Uses middleware for consistent error responses
- 📝 **Logging**: Implements comprehensive logging for debugging and monitoring

### 5. ⚡ Performance
- 🔄 **Caching Strategy**: Implements TTL-based caching for frequently accessed data
- ⏱️ **Rate Limiting**: Prevents abuse and ensures service availability
- 🚀 **Database Optimization**: Uses Prisma for efficient database queries

### 6. 👩‍💻 Development Experience
- 🐳 **Docker Compose**: Provides consistent development environment
- 📊 **Prisma Studio**: Enables easy database management
- 📘 **TypeScript**: Ensures type safety and better developer experience
- ✅ **Zod Validation**: Implements runtime type checking for API requests

## 📋 Postman Collection

A Postman collection is available for testing the API endpoints. You can import it from:
[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/13640451-2a45db3f-fac7-49de-a3e1-b85606c227ce?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D13640451-2a45db3f-fac7-49de-a3e1-b85606c227ce%26entityType%3Dcollection%26workspaceId%3D947fdbb0-0243-41b3-804c-315a81b5da5c)

### 🧪 Test Environment

The Postman collection includes a pre-configured test environment with:

- 🏦 **Test Contracts** deployed on Base Sepolia:
  - USD Token Contract
  - Fund Token Contract
- 💰 **Test Wallet** with:
  - Prefunded with test USD tokens
  - Prefunded with Base Sepolia ETH
  - Private key embedded in the environment variables

This setup allows you to perform end-to-end testing of the API locally without needing to:
- Deploy your own contracts
- Fund test wallets
- Manage test tokens

Simply import the collection and environment, and you're ready to test all API endpoints!
