# mcp_server_demo

A basic MCP (Model Context Protocol) server implemented in TypeScript using the MCP SDK.

## Features

- MCP server with three tools:
  - `add` - adds two numbers
  - `health` - check server health status
  - `getweather` - get current weather
- Supports HTTP transport with JSON response mode
- HTTP server runs on port 1303, accessible for integration with tools like n8n
- Modular tool architecture (each tool in a separate file)

## Files and Their Use

- `src/index.ts`: Main server implementation with HTTP handler and tool registration
- `src/tools/add.ts`: Add tool implementation
- `src/tools/health.ts`: Health check tool
- `src/tools/getweather.ts`: Weather tool
- `package.json`: Node.js project configuration
- `tsconfig.json`: TypeScript compiler configuration
- `build/`: Compiled JavaScript output
- `Dockerfile`: Multi-stage Docker build configuration
- `docker-compose.yml`: Docker Compose configuration for container management
- `.dockerignore`: Files to exclude from Docker build context
- `.github/copilot-instructions.md`: Instructions for GitHub Copilot

## Commands to Build and Run

### Prerequisites

- Install Node.js (version 16 or higher)

### Setup

- Install dependencies: `npm install`

### Build

- Build the project: `npm run build`

### Run

- Run HTTP server: `npm run start:http`

### VS Code Tasks

- Use Ctrl+Shift+P > Tasks: Run Task > Build MCP Server
- Use Ctrl+Shift+P > Tasks: Run Task > Run MCP Server (HTTP)
- Use Ctrl+Shift+P > Tasks: Run Task > Test MCP Server
- Use Ctrl+Shift+P > Tasks: Run Task > Build Docker Image
- Use Ctrl+Shift+P > Tasks: Run Task > Run Docker Container
- Use Ctrl+Shift+P > Tasks: Run Task > Docker Compose Up

## Docker Support

The MCP server can be run in a Docker container for easier deployment and isolation.

### Prerequisites

- Install Docker and Docker Compose

### Build and Run with Docker Compose

1. Build and start the container:
   ```bash
   docker-compose up --build
   ```

2. The server will be available at `http://localhost:1303/`
3. Health check endpoint: `http://localhost:1303/health`

### Build and Run with Docker directly

1. Build the image:
   ```bash
   docker build -t mcp-server-demo .
   ```

2. Run the container:
   ```bash
   docker run -p 1303:1303 mcp-server-demo
   ```

### Docker Files

- `Dockerfile`: Multi-stage build for the MCP server
- `docker-compose.yml`: Compose configuration for easy container management
- `.dockerignore`: Files to exclude from Docker build context

## Integration with n8n

To access from n8n docker container, run the server with HTTP transport. If n8n is in Docker, ensure the host port 1303 is accessible (e.g., use host networking or port mapping).