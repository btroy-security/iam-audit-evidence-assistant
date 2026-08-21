/**
 * IAM Audit Evidence Assistant — MCP Server
 * -------------------------------------------------------------------------
 * Exposes the control library as MCP tools over streamable HTTP, running
 * in STATELESS mode: every request creates its own short-lived transport
 * and closes it when done. This deliberately avoids session-expiry issues
 * (a real bug we hit and fixed while building a client against a
 * different, stateful MCP server) — there's no session to expire.
 */

import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import {
  listFrameworksInputShape,
  listFrameworksHandler,
} from "./tools/listFrameworks.js";
import {
  searchControlsInputShape,
  searchControlsHandler,
} from "./tools/searchControls.js";
import {
  getControlDetailsInputShape,
  getControlDetailsHandler,
} from "./tools/getControlDetails.js";
import {
  getEvidenceRequirementsInputShape,
  getEvidenceRequirementsHandler,
} from "./tools/getEvidenceRequirements.js";
import {
  validateEvidenceStatusInputShape,
  validateEvidenceStatusHandler,
} from "./tools/validateEvidenceStatus.js";
import {
  compareControlsInputShape,
  compareControlsHandler,
} from "./tools/compareControls.js";
import {
  generateRemediationGuidanceInputShape,
  generateRemediationGuidanceHandler,
} from "./tools/generateRemediationGuidance.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

function buildMcpServer(): McpServer {
  const server = new McpServer(
    { name: "iam-audit-evidence-assistant", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    "list_frameworks",
    {
      title: "List Frameworks",
      description:
        "Lists the supported compliance frameworks in the IAM control library, with control counts and covered topics per framework.",
      inputSchema: listFrameworksInputShape,
    },
    listFrameworksHandler
  );

  server.registerTool(
    "search_controls",
    {
      title: "Search Controls",
      description:
        "Searches the IAM control library by framework, topic, and/or free-text keyword. Returns matching control summaries, each with an 'id' to use with other tools.",
      inputSchema: searchControlsInputShape,
    },
    searchControlsHandler
  );

  server.registerTool(
    "get_control_details",
    {
      title: "Get Control Details",
      description:
        "Returns the complete structured record for one control, including evidence requirements, risks, and remediation guidance.",
      inputSchema: getControlDetailsInputShape,
    },
    getControlDetailsHandler
  );

  server.registerTool(
    "get_evidence_requirements",
    {
      title: "Get Evidence Requirements",
      description:
        "Returns the evidence types, suggested evidence owner, evidence-quality criteria, and review frequency for one control.",
      inputSchema: getEvidenceRequirementsInputShape,
    },
    getEvidenceRequirementsHandler
  );

  server.registerTool(
    "validate_evidence_status",
    {
      title: "Validate Evidence Status",
      description:
        "Accepts a control id and a checklist of evidence statuses. Returns a transparent, rules-based readiness score, status, identified gaps, and the specific reasons behind the score.",
      inputSchema: validateEvidenceStatusInputShape,
    },
    validateEvidenceStatusHandler
  );

  server.registerTool(
    "compare_controls",
    {
      title: "Compare Controls",
      description:
        "Accepts two to five control ids and explains their similarities and differences, without claiming they are legally or formally equivalent across frameworks.",
      inputSchema: compareControlsInputShape,
    },
    compareControlsHandler
  );

  server.registerTool(
    "generate_remediation_guidance",
    {
      title: "Generate Remediation Guidance",
      description:
        "Accepts a control id, a list of evidence gaps, and an optional risk-level override. Returns structured remediation recommendations grounded in the control library.",
      inputSchema: generateRemediationGuidanceInputShape,
    },
    generateRemediationGuidanceHandler
  );

  return server;
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "iam-audit-evidence-mcp-server" });
});

app.post("/mcp", async (req, res) => {
  // Stateless mode: a brand-new server + transport per request. No session
  // to track, nothing that can silently expire.
  try {
    const server = buildMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("[/mcp] request failed:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// GET/DELETE aren't meaningful in stateless mode (no session to resume or
// terminate), but respond clearly rather than letting them 404 silently.
app.get("/mcp", (req, res) => {
  res.status(405).json({
    error: "This server runs in stateless mode; GET /mcp is not supported.",
  });
});
app.delete("/mcp", (req, res) => {
  res.status(405).json({
    error: "This server runs in stateless mode; there is no session to terminate.",
  });
});

app.listen(PORT, () => {
  console.log(
    `IAM Audit Evidence MCP server running at http://localhost:${PORT}/mcp`
  );
  console.log(`Health check: http://localhost:${PORT}/health`);
});
