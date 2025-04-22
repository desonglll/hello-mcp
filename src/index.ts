import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupHandlers } from "./handlers.ts";

// Initialize server with resource capabilities
const server = new Server(
  {
    name: "hello-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {}, // Enable prompts
      resources: {}, // Enable resources
      tools: {},
    },
  }
);

setupHandlers(server);

const transport = new StdioServerTransport();
server.connect(transport);
console.info(
  '{"jsonrpc": "2.0", "method": "log", "params": { "message": "Server running..." }}'
);
