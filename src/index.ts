import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

// Create server instance
const server = new McpServer({
  name: "demo",
  version: "1.0.0",
});

// Register the add tool
server.registerTool(
  "add",
  {
    description: "Add two numbers together",
    inputSchema: z.object({
      a: z.number().describe("First number to add"),
      b: z.number().describe("Second number to add"),
    }),
  },
  async ({ a, b }: { a: number; b: number }) => {
    const result = a + b;
    return {
      content: [
        {
          type: "text",
          text: `${a} + ${b} = ${result}`,
        },
      ],
    };
  }
);

// Main function to run the server
async function main() {
  const transportType = process.argv[2];

  if (transportType === "http") {
    // HTTP transport for n8n integration
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => Math.random().toString(36).substring(7),
    });

    await server.connect(transport);

    // Start a simple HTTP server
    const http = await import("http");
    const server_http = http.createServer(async (req, res) => {
      if (req.method === "POST" && req.url === "/mcp") {
        let body = "";
        req.on("data", chunk => body += chunk);
        req.on("end", async () => {
          await transport.handleRequest(req, res, body);
        });
      } else {
        res.statusCode = 404;
        res.end();
      }
    });

    server_http.listen(3000, "0.0.0.0", () => {
      console.error("MCP Server running on http://0.0.0.0:3000/mcp");
    });
  } else {
    // Stdio transport for local debugging
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});