// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as http from "http";

// Create MCP server instance
const server = new McpServer({
  name: "demo",
  version: "1.0.0",
});

// Register "add" tool
server.registerTool(
  "add",
  {
    description: "Add two numbers together",
    inputSchema: z.object({
      a: z.number().describe("First number to add"),
      b: z.number().describe("Second number to add"),
    }),
  },
  async ({ a, b }: { a: number; b: number }) => ({
    content: [
      {
        type: "text",
        text: `${a} + ${b} = ${a + b}`,
      },
    ],
  })
);

// Optional: register a simple "health" tool for testing
server.registerTool(
  "health",
  {
    description: "Check server health",
    inputSchema: z.object({}),
  },
  async () => ({
    content: [
      {
        type: "text",
        text: `Server is healthy!`,
      },
    ],
  })
);

async function main() {
  const transportType = process.argv[2];

  if (transportType === "http") {
    // HTTP transport
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => Math.random().toString(36).substring(2),
    });

    await server.connect(transport);

    // Monkey-patch transport to handle n8n's getTools request properly
    transport.on("getTools", async () => {
      // n8n expects a simple array of tools: name + description
      return server.getTools().map((tool) => ({
        name: tool.name,
        description: tool.description,
      }));
    });

    const server_http = http.createServer(async (req, res) => {
      // Health endpoint
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", version: "1.0.0" }));
        return;
      }

      // MCP endpoint
      if (req.method === "POST" && req.url === "/mcp") {
        res.setHeader("Content-Type", "application/json");
        await transport.handleRequest(req, res);
        return;
      }

      // Fallback 404
      res.writeHead(404).end("Not Found");
    });

    server_http.listen(1303, "0.0.0.0", () => {
      console.log("MCP Server running on http://0.0.0.0:1303/mcp");
      console.log("Health endpoint available at http://0.0.0.0:1303/health");
    });
  } else {
    // Fallback: stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP Server running on stdio");
  }
}

main().catch((err) => {
  console.error("Fatal error in MCP server:", err);
  process.exit(1);
});
