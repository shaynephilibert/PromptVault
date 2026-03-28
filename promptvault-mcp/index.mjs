#!/usr/bin/env node
import { createServer } from 'node:http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// In-memory vault cache — populated when the extension pushes data
let vault = null; // { prompts: Prompt[], categories: string[] }

// ─── HTTP Bridge (receives vault data from extension) ────────────────────────

const BRIDGE_PORT = 7427;

const bridge = createServer((req, res) => {
  // CORS — only accept extension origins
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/vault') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        vault = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'invalid JSON' }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

bridge.listen(BRIDGE_PORT, '127.0.0.1', () => {
  process.stderr.write(`PromptVault MCP bridge listening on http://127.0.0.1:${BRIDGE_PORT}\n`);
});

// ─── MCP Server ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: 'promptvault',
  version: '1.0.0',
});

function lockedResponse() {
  return {
    content: [{ type: 'text', text: JSON.stringify({ status: 'locked', message: 'Unlock PromptVault in Chrome first.' }) }],
  };
}

function promptsResponse(prompts) {
  return {
    content: [{ type: 'text', text: JSON.stringify({ prompts }) }],
  };
}

server.tool('promptvault_status', 'Get vault status — whether it is locked and how many prompts are stored', {}, () => {
  if (!vault) return lockedResponse();
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        status: 'unlocked',
        promptCount: vault.prompts.length,
        categories: vault.categories,
      }),
    }],
  };
});

server.tool(
  'promptvault_get_all',
  'Return all prompts in the vault',
  {},
  () => {
    if (!vault) return lockedResponse();
    return promptsResponse(vault.prompts);
  }
);

server.tool(
  'promptvault_search',
  'Search prompts by keyword — matches title, body, and tags',
  { query: z.string().describe('Search term') },
  ({ query }) => {
    if (!vault) return lockedResponse();
    const q = query.toLowerCase();
    const results = vault.prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
    return promptsResponse(results);
  }
);

server.tool(
  'promptvault_get_by_category',
  'Return all prompts in a specific category',
  { category: z.string().describe('Category name (case-sensitive)') },
  ({ category }) => {
    if (!vault) return lockedResponse();
    return promptsResponse(vault.prompts.filter((p) => p.category === category));
  }
);

server.tool(
  'promptvault_get_by_tag',
  'Return all prompts that have a specific tag',
  { tag: z.string().describe('Tag name (case-insensitive)') },
  ({ tag }) => {
    if (!vault) return lockedResponse();
    const t = tag.toLowerCase();
    return promptsResponse(vault.prompts.filter((p) => p.tags.some((pt) => pt.toLowerCase() === t)));
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
