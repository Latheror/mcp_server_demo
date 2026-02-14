# mcp_server_demo

A basic MCP (Model Context Protocol) server implemented in TypeScript using the MCP SDK.

## Features

- Simple MCP server with one tool: `add` - adds two integers
- Supports both stdio and HTTP transports
- HTTP server runs on port 1303, accessible for integration with tools like n8n

## Files and Their Use

- `src/index.ts`: Main server implementation with the add tool
- `package.json`: Node.js project configuration
- `tsconfig.json`: TypeScript compiler configuration
- `build/index.js`: Compiled JavaScript output
- `Dockerfile`: Multi-stage Docker build configuration
- `docker-compose.yml`: Docker Compose configuration for container management
- `.dockerignore`: Files to exclude from Docker build context
- `.vscode/mcp.json`: VS Code MCP configuration for stdio transport debugging
- `.vscode/tasks.json`: VS Code tasks for running the server in different modes
- `.github/copilot-instructions.md`: Instructions for GitHub Copilot

## Commands to Build and Run

### Prerequisites

- Install Node.js (version 16 or higher)

### Setup

- Install dependencies: `npm install`

### Build

- Build the project: `npm run build`

### Run

- Run HTTP server (for n8n integration): `npm run start:http`
- Run stdio server (for VS Code MCP): `npm run start`

### VS Code Tasks

- Use Ctrl+Shift+P > Tasks: Run Task > Build MCP Server
- Use Ctrl+Shift+P > Tasks: Run Task > Run MCP Server (HTTP)
- Use Ctrl+Shift+P > Tasks: Run Task > Run MCP Server (stdio)
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

2. The server will be available at `http://localhost:1303/mcp`
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