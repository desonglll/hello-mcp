import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getResourceTemplate, resourceTemplates } from "./resource-templates";
import { toolHandlers } from "./tools";
import { resourceHandlers, resources } from "./resources";
import { promptHandlers, prompts } from "./prompts";
import { tools } from "./tools";

export const setupHandlers = (server: Server) => {
  // List available resources when clients request them
  server.setRequestHandler(ListResourcesRequestSchema, () => ({ resources }));
  // Resource Templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
    resourceTemplates,
  }));
  // Return resource content when clients request it
  server.setRequestHandler(ReadResourceRequestSchema, (request) => {
    const { uri } = request.params ?? {};
    const resourceHandler =
      resourceHandlers[uri as keyof typeof resourceHandlers];
    if (resourceHandler) {
      const result = resourceHandler();
      return result || { contents: [] };
    }
    const resourceTemplateHandler = getResourceTemplate(uri);
    if (resourceTemplateHandler) {
      const result = resourceTemplateHandler();
      return result || { contents: [] };
    }
    return { contents: [] };
  });
  // Prompts
  server.setRequestHandler(ListPromptsRequestSchema, () => ({
    prompts: Object.values(prompts),
  }));
  server.setRequestHandler(GetPromptRequestSchema, (request) => {
    const { name, arguments: args } = request.params;
    const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
    if (promptHandler)
      return promptHandler(args as { name: string; style?: string });
    throw new Error("Prompt not found");
  });

  // tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    type ToolHandlerKey = keyof typeof toolHandlers;
    const { name, arguments: params } = request.params ?? {};
    const handler = toolHandlers[name as ToolHandlerKey];

    if (!handler) throw new Error("Tool not found");

    type HandlerParams = Parameters<typeof handler>;
    return handler(...([params] as HandlerParams));
  });
};
