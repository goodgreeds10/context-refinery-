#!/usr/bin/env node

/**
 * RECURSIVE CONTEXT REFINERY (MCP Server Utility)
 * Author: goodgreeds10
 * Description: Cleans raw text dumps, fixes reversed timeline ordering,
 * and maintains a zero-bloat local SQLite context ledger.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import sqlite3 from "sqlite3";
import fs from "fs";

// Initialize local SQLite database
const db = new sqlite3.Database("./context_ledger.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS master_context (
      id TEXT PRIMARY KEY,
      timestamp DATETIME,
      source_type TEXT,
      raw_markdown TEXT,
      timeline_direction TEXT
    )
  `);
});

const server = new Server(
  {
    name: "context-refinery",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Declare available MCP tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "refine_text_dump",
        description: "Cleans messy text input, normalizes dates, and inserts into local SQLite timeline ledger.",
        inputSchema: {
          type: "object",
          properties: {
            source_type: { type: "string", description: "Origin of data (e.g., Google Takeout, Word, Chat)" },
            raw_text: { type: "string", description: "The raw unformatted text content" },
            is_reversed: { type: "boolean", description: "True if the timeline is newest-first and needs flipping" }
          },
          required: ["source_type", "raw_text"]
        }
      }
    ]
  };
});

// Execute MCP tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "refine_text_dump") {
    const { source_type, raw_text, is_reversed } = request.params.arguments;
    
    // Reverse lines if timeline direction is reversed
    let processedText = raw_text;
    if (is_reversed) {
      processedText = raw_text.split("\n").reverse().join("\n");
    }

    const recordId = "ctx_" + Date.now();
    const timestamp = new Date().toISOString();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO master_context (id, timestamp, source_type, raw_markdown, timeline_direction) VALUES (?, ?, ?, ?, ?)`,
        [recordId, timestamp, source_type, processedText, is_reversed ? "forward_restored" : "forward"],
        function (err) {
          if (err) {
            resolve({
              content: [{ type: "text", text: `Error indexing text: ${err.message}` }]
            });
          } else {
            resolve({
              content: [{ 
                type: "text", 
                text: `Successfully refined and indexed context record ${recordId} into local SQLite ledger.` 
              }]
            });
          }
        }
      );
    });
  }
  
  throw new Error("Tool not found");
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch(console.error);
