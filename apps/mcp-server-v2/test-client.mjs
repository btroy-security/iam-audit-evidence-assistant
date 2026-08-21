import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = "http://localhost:5000/mcp";

function log(label, obj) {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(obj, null, 2).slice(0, 1200));
}

async function callTool(name, args) {
  // Stateless server: fresh client+connection per call, mirroring how a
  // real caller would use it.
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
  const client = new Client(
    { name: "test-client", version: "0.1.0" },
    { capabilities: {} }
  );
  await client.connect(transport);
  const result = await client.callTool({ name, arguments: args });
  await client.close();
  return result;
}

async function main() {
  let failures = 0;

  try {
    const tools = await (async () => {
      const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));
      const client = new Client(
        { name: "test-client", version: "0.1.0" },
        { capabilities: {} }
      );
      await client.connect(transport);
      const t = await client.listTools();
      await client.close();
      return t;
    })();
    log("tools/list", { count: tools.tools.length, names: tools.tools.map((t) => t.name) });
    if (tools.tools.length !== 7) {
      console.error(`EXPECTED 7 tools, got ${tools.tools.length}`);
      failures++;
    }
  } catch (err) {
    console.error("tools/list FAILED:", err.message);
    failures++;
  }

  // 1. list_frameworks
  try {
    const r = await callTool("list_frameworks", {});
    log("list_frameworks", JSON.parse(r.content[0].text));
  } catch (err) {
    console.error("list_frameworks FAILED:", err.message);
    failures++;
  }

  // 2. search_controls
  let firstControlId;
  try {
    const r = await callTool("search_controls", { keyword: "MFA" });
    const parsed = JSON.parse(r.content[0].text);
    log("search_controls(MFA)", parsed);
    firstControlId = parsed.results[0]?.id;
    if (parsed.matchCount !== 1) {
      console.error(`EXPECTED 1 match for MFA, got ${parsed.matchCount}`);
      failures++;
    }
  } catch (err) {
    console.error("search_controls FAILED:", err.message);
    failures++;
  }

  // 2b. search_controls with invalid framework (error handling test)
  try {
    const r = await callTool("search_controls", { framework: "Not A Real Framework" });
    log("search_controls(invalid framework)", r);
    if (!r.isError) {
      console.error("EXPECTED isError:true for invalid framework, got success");
      failures++;
    }
  } catch (err) {
    console.error("search_controls(invalid) FAILED unexpectedly:", err.message);
    failures++;
  }

  // 3. get_control_details
  try {
    const r = await callTool("get_control_details", { controlId: firstControlId });
    const parsed = JSON.parse(r.content[0].text);
    log("get_control_details", { id: parsed.id, title: parsed.title, relatedControls: parsed.relatedControls });
  } catch (err) {
    console.error("get_control_details FAILED:", err.message);
    failures++;
  }

  // 3b. get_control_details with invalid id
  try {
    const r = await callTool("get_control_details", { controlId: "does-not-exist" });
    log("get_control_details(invalid id)", r);
    if (!r.isError) {
      console.error("EXPECTED isError:true for invalid control id, got success");
      failures++;
    }
  } catch (err) {
    console.error("get_control_details(invalid) FAILED unexpectedly:", err.message);
    failures++;
  }

  // 4. get_evidence_requirements
  let evidenceItemIds = [];
  try {
    const r = await callTool("get_evidence_requirements", { controlId: firstControlId });
    const parsed = JSON.parse(r.content[0].text);
    log("get_evidence_requirements", parsed);
    evidenceItemIds = parsed.evidenceRequested.map((e) => e.id);
  } catch (err) {
    console.error("get_evidence_requirements FAILED:", err.message);
    failures++;
  }

  // 5. validate_evidence_status
  try {
    const checklist = evidenceItemIds.map((id, i) => ({
      evidenceItemId: id,
      status: i === 0 ? "Missing" : "Available",
    }));
    const r = await callTool("validate_evidence_status", {
      controlId: firstControlId,
      checklist,
    });
    const parsed = JSON.parse(r.content[0].text);
    log("validate_evidence_status", parsed);
  } catch (err) {
    console.error("validate_evidence_status FAILED:", err.message);
    failures++;
  }

  // 5b. validate_evidence_status with a bad evidenceItemId
  try {
    const r = await callTool("validate_evidence_status", {
      controlId: firstControlId,
      checklist: [{ evidenceItemId: "not-a-real-item", status: "Missing" }],
    });
    log("validate_evidence_status(bad item id)", r);
    if (!r.isError) {
      console.error("EXPECTED isError:true for bad evidenceItemId, got success");
      failures++;
    }
  } catch (err) {
    console.error("validate_evidence_status(bad) FAILED unexpectedly:", err.message);
    failures++;
  }

  // 6. compare_controls
  try {
    const r = await callTool("search_controls", { keyword: "access" });
    const parsed = JSON.parse(r.content[0].text);
    const ids = parsed.results.slice(0, 2).map((x) => x.id);
    const cmp = await callTool("compare_controls", { controlIds: ids });
    log("compare_controls", JSON.parse(cmp.content[0].text));
  } catch (err) {
    console.error("compare_controls FAILED:", err.message);
    failures++;
  }

  // 7. generate_remediation_guidance
  try {
    const r = await callTool("generate_remediation_guidance", {
      controlId: firstControlId,
      evidenceGaps: [evidenceItemIds[0]],
    });
    log("generate_remediation_guidance", JSON.parse(r.content[0].text));
  } catch (err) {
    console.error("generate_remediation_guidance FAILED:", err.message);
    failures++;
  }

  console.log(`\n\n${failures === 0 ? "ALL TESTS PASSED" : failures + " TEST(S) FAILED"}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
