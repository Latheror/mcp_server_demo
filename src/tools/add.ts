import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const textResponse = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

export function registerAddTool(server: McpServer) {
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
