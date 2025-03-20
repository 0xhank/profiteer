# Profiteer

A decentralized application for news token creation and trading, built on Solana.

## Project Overview

News.fun is a platform that allows users to create and trade tokens related to news articles and topics. The platform leverages Solana blockchain technology to enable:

-   Creation of bonding curves for news-related tokens
-   Trading of tokens through both bonding curves and liquidity pools
-   Article and topic indexing with connections to Wikipedia information
-   Seamless user experience through a modern React frontend

The project consists of multiple components working together to provide a complete decentralized news token trading experience.

## Architecture Overview

The project follows a monorepo structure with the following components:

### Frontend (React App)

-   Modern React application built with Vite
-   Provides user interface for token creation, trading, and management
-   Connects to backend services via tRPC

### Backend Services

-   **Server**: Provides API endpoints for the frontend, handling communication with the blockchain
-   **Indexer**: Processes and indexes news articles and blockchain data

### Blockchain Layer

-   **Solana Programs**: Smart contracts that implement bonding curves and token functionality
-   Leverages the Pump Science protocol for bonding curve mechanics

### Shared Utilities

-   Common types and functions used across frontend and backend components

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later)
-   [pnpm](https://pnpm.io/) for package management
-   [Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools) for blockchain interaction
-   [Supabase](https://supabase.com/) account for database services

## Installation and Setup

1. Clone the repository:

    ```
    git clone https://github.com/0xhank/profiteer.git
    cd profiteer
    ```

2. Install dependencies:

    ```
    pnpm install
    ```

3. Set up environment variables:

    ```
    cp .env.example .env
    ```

    Edit the `.env` file with your specific configuration settings.

4. Generate database types (if using Supabase):
    ```
    pnpm gen:db-types
    ```

## Running the Project

### Start the Solana Test Validator (for local development)

```
pnpm node
```

### Start the Backend Server

```
pnpm dev:server
```

### Start the Frontend Application

```
pnpm dev:react
```

### Start the Indexer

```
pnpm dev:indexer
```

### Run Everything Together

```
pnpm dev
```

## Development Guide

### Project Structure

```
profiteer/
├── apps/
│   ├── react/         # Frontend application
│   ├── server/        # Backend API server
│   └── indexer/       # Data indexing service
├── packages/
│   ├── programs/      # Solana programs (smart contracts)
│   └── shared/        # Shared utilities and types
└── .tsconfigs/        # TypeScript configurations
```

### Development Workflow

1. Make changes to your code
2. Test changes locally with `pnpm dev`
3. Commit and push your changes
4. Deploy to your target environment

### Testing

Each component has its own testing methodology:

-   Frontend: Component and integration tests
-   Backend: API and service tests
-   Solana Programs: Unit and integration tests using the Anchor framework

## Deployment

### Frontend Deployment

The React app can be deployed using Vercel or any other static site hosting platform:

```
cd apps/react
pnpm build
```

### Backend Deployment

The server and indexer can be deployed using Docker:

```
# Server
cd apps/server
docker build -t profiteer-server .

# Indexer
cd apps/indexer
docker build -t profiteer-indexer .
```

### Solana Program Deployment

Deploy Solana programs to the desired network (devnet or mainnet):

```
cd packages/programs
anchor deploy
```

## API Documentation

The backend provides a tRPC API with endpoints for:

-   Authentication
-   Token creation and management
-   Swapping and trading
-   Article information retrieval
-   Blockchain interaction

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
