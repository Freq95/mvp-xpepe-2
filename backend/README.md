# xPEPE Analytics API

Backend API for tracking xPEPE game scoring sessions and blockchain submissions.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
PORT=3001
MONGODB_URI=mongodb://localhost:27017/xpepe-analytics
NODE_ENV=development
```

3. Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB instance.

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Scoring Sessions
- `POST /api/scoring-sessions` - Create a new scoring session
  - Body: `{ address: string, score: number, duration?: number }`
- `GET /api/scoring-sessions/:address` - Get all sessions for an address

### Blockchain Submissions
- `POST /api/blockchain-submissions` - Create a new blockchain submission record
  - Body: `{ address: string, score: number, feePaid?: string, status?: 'pending'|'success'|'failed', transactionHash?: string, errorMessage?: string }`
- `PATCH /api/blockchain-submissions/:submissionId` - Update submission status
- `GET /api/blockchain-submissions/:address` - Get all submissions for an address

### Addresses
- `GET /api/addresses` - Get all addresses with summary statistics
- `GET /api/addresses/:address` - Get detailed information for a specific address

