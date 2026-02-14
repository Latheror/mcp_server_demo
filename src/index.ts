// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
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
      a: z.string().describe("First number to add"),
      b: z.string().describe("Second number to add"),
    }),
  },
  async ({ a, b }: { a: string; b: string }) => {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    
    if (isNaN(numA) || isNaN(numB)) {
      return {
        content: [
          {
            type: "text",
            text: "Error: Invalid numbers provided",
          },
        ],
      };
    }
    
    return {
      content: [
        {
          type: "text",
          text: `${numA} + ${numB} = ${numA + numB}`,
        },
      ],
    };
  }
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
    // HTTP transport with JSON response mode (no SSE)
    const server_http = http.createServer(async (req, res) => {
      // Set CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Last-Event-ID, mcp-protocol-version");

      // Handle preflight requests
      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      // Health endpoint
      if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", version: "1.0.0" }));
        return;
      }

      // MCP endpoint - handle both GET and POST to root path
      if ((req.method === "POST" || req.method === "GET") && req.url === "/") {
        try {
          // Create a new transport for each request (stateless)
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // Stateless
            enableJsonResponse: true, // JSON response mode
          });

          // Create a new server instance for this request
          const requestServer = new McpServer({
            name: "demo",
            version: "1.0.0",
          });

          // Register tools on the request server
          requestServer.registerTool(
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
                return {
                  content: [
                    {
                      type: "text",
                      text: "Error: Invalid numbers provided",
                    },
                  ],
                };
              }

              return {
                content: [
                  {
                    type: "text",
                    text: `${numA} + ${numB} = ${numA + numB}`,
                  },
                ],
              };
            }
          );

          requestServer.registerTool(
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

      // Fallback 404
      res.writeHead(404).end("Not Found");
    });

    server_http.listen(1303, "0.0.0.0", () => {
      console.log("MCP Server running on http://0.0.0.0:1303");
      console.log("Health endpoint available at http://0.0.0.0:1303/health");
    });
  } else {
    console.log("MCP Server http error: No valid transport type provided. Use 'http' as an argument to start the server with HTTP transport.");
  }
}

main().catch((err) => {
  console.error("Fatal error in MCP server:", err);
  process.exit(1);
});
