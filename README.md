# Context Refinery MCP Server

> A lightweight, open-source Model Context Protocol (MCP) utility designed to flatten chaotic data oceans into pristine, chronologically ordered Markdown timelines stored in local SQLite.

## 🚀 The Core Philosophy

Large language models and AI agents crash, lag, and hallucinate when fed tens of gigabytes of unstructured, reversed context files (e.g., Google Takeout, Slack exports, unformatted Word docs). 

**Context Refinery** acts as a local digital filter:
- **Zero Black Boxes:** Everything runs locally on disk in plain text and standard SQLite.
- **Timeline Normalization:** Automatically detects and flips reversed chat timelines back into chronological reading order.
- **Zero Bloat:** Strips unnecessary styles, images, and heavy scaffolding, serving pure text context to LLMs instantly.

---

## 🛠️ Installation & Setup

Add this utility server to your MCP Client Configuration file (e.g., Cursor, Claude Desktop, or custom Agent framework):

```json
{
  "mcpServers": {
    "context-refinery": {
      "command": "node",
      "args": ["/path/to/context-refinery/refinery.js"]
    }
  }
}
