/**
 * MCP CLIENT
 * -------------------------------------------------------------------------
 * Connects to the IAM Audit Evidence MCP server (apps/mcp-server-v2) over
 * streamable HTTP. Mirrors the server's stateless design: each call opens
 * a fresh connection, does one thing, and closes it. There is no session
 * to keep alive or expire.
 *
 * This file runs SERVER-SIDE ONLY, same as ai-provider.ts.
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL ?? "http://localhost:5000/mcp";

/**
 * Opens a fresh connection to the MCP server, runs the given function with
 * the connected client, then always closes the connection afterward.
 */
async function withMcpClient<T>(
  fn: (client: Client) => Promise<T>
): Promise<T> {
  const client = new Client({
    name: "iam-audit-evidence-web",
    version: "0.1.0",
  });

  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_SERVER_URL)
  );

  await client.connect(transport);

  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

/**
 * Lists the tools the MCP server currently exposes. Useful for a quick
 * connectivity test, and later for passing tool definitions to Claude.
 */
export async function listMcpTools() {
  return withMcpClient(async (client) => {
    const result = await client.listTools();
    return result.tools;
  });
}

/**
 * Calls one MCP tool by name with the given arguments and returns its
 * result.
 */
export async function callMcpTool(name: string, args: Record<string, unknown>) {
  return withMcpClient(async (client) => {
    return client.callTool({ name, arguments: args });
  });
}