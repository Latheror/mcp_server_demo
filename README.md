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

## Integration with n8n

To access from n8n docker container, run the server with HTTP transport. If n8n is in Docker, ensure the host port 1303 is accessible (e.g., use host networking or port mapping).