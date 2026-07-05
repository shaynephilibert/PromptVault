# PromptVault Roadmap

Items planned or under consideration for future releases.

---

## MCP Server Integration (Claude Code / AI agents)

**Status:** Built, not shipped — held in `promptvault-mcp/`

**What it does:**  
A companion Node.js MCP server that lets Claude Code (and any MCP-compatible agent) read your vault directly. When the extension is unlocked, it pushes the decrypted vault to a local HTTP bridge on `127.0.0.1:7427`. The MCP server exposes 5 tools: `promptvault_status`, `promptvault_get_all`, `promptvault_search`, `promptvault_get_by_category`, `promptvault_get_by_tag`.

**Why it's on hold:**  
- Not discoverable — users have no way to find out this feature exists from within the extension
- Requires manual setup outside of Chrome (running a Node.js process, configuring Claude Code settings)
- Sends decrypted vault over localhost — safe, but needs clear user consent and explanation before shipping

**What needs to happen before shipping:**
- In-extension onboarding/discovery: a "Use with Claude Code" section in Settings
- Setup guide linked from within the extension
- User-controlled toggle to enable/disable the bridge
- Consider adding a shared secret so only the paired MCP server can receive vault data
