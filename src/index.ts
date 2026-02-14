// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import * as http from "http";

const PORT = 1303;
const HOST = "0.0.0.0";

// Helper to create text content responses
const textResponse = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

// Helper function to register tools on a server instance
function registerTools(server: McpServer) {
  // Simple tools definition
  const simpleTools = [
    {
      name: "health",
      description: "Check server health",
      handler: () => textResponse("Server is healthy!"),
    },
    {
      name: "getweather",
      description: "Get the current weather",
      handler: () => textResponse("sunny"),
    },
  ];

  // Register simple tools
  simpleTools.forEach(({ name, description, handler }) => {
    server.registerTool(name, { description, inputSchema: z.object({}) }, handler);
  });

  // Register "add" tool (has custom logic)
  server.registerTool(
    "add",
    {
      description: "Add two numbers together",
      inputSchema: z.object({
        a: z.string().describe("First number to add"),
        b: z.string().describe("Second number to add"),
      }),
    },
    async ({ a, b }: { a: string; b: string }) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);

      if (isNaN(numA) || isNaN(numB)) {
        return textResponse("Error: Invalid numbers provided");
      }

      return textResponse(`${numA} + ${numB} = ${numA + numB}`);
    }
  );
}

async function main() {
  const server_http = http.createServer(async (req, res) => {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Last-Event-ID, mcp-protocol-version");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", version: "1.0.0" }));
      return;
    }

    if ((req.method === "POST" || req.method === "GET") && req.url === "/") {
      try {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
          enableJsonResponse: true,
        });

        const requestServer = new McpServer({ name: "demo", version: "1.0.0" });
        registerTools(requestServer);

        await requestServer.connect(transport);
        await transport.handleRequest(req, res);
      } catch (error) {
        console.error("Error handling MCP request:", error);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            jsonrpc: "2.0",
            error: { code: -32603, message: "Internal server error" },
            id: null
          }));
        }
      }
      return;
    }

    res.writeHead(404).end("Not Found");
  });

  server_http.listen(PORT, HOST, () => {
    console.log(`MCP Server running on http://${HOST}:${PORT}`);
    console.log(`Health endpoint available at http://${HOST}:${PORT}/health`);
  });
}

main().catch((err) => {
  console.error("Fatal error in MCP server:", err);
  process.exit(1);
});
