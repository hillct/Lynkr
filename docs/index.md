<link rel="stylesheet" href="style.css">

# Lynkr

**Self-hosted Claude Code & Cursor proxy with multi-provider support and 60-80% cost reduction.**

[GitHub](https://github.com/vishalveerareddy123/Lynkr) | [Documentation](https://github.com/vishalveerareddy123/Lynkr/tree/main/documentation) | [NPM](https://www.npmjs.com/package/lynkr)

---

## What is Lynkr?

Lynkr is a proxy server that enables **Claude Code CLI**, **Cursor IDE**, **Codex CLI**, **ClawdBot**, and other AI coding tools to work with any LLM provider - not just Anthropic.

**Key Benefits:**
- **10+ Providers** - Databricks, AWS Bedrock, OpenRouter, Ollama, llama.cpp, Azure OpenAI, Azure Anthropic, OpenAI, LM Studio, MLX OpenAI Server
- **60-80% Cost Savings** - Token optimization through smart tool selection, prompt caching, and memory deduplication
- **100% Local Option** - Run completely offline with Ollama, llama.cpp, or MLX (free)
- **Remote or Local** - Connect to providers on any IP/hostname (not limited to localhost)
- **Drop-in Replacement** - No code changes required to Claude Code CLI or Cursor

---

## Quick Start

### Install

```bash
npm install -g lynkr
# or
brew tap vishalveerareddy123/lynkr && brew install lynkr
```

### Configure (Example: Ollama)

```bash
export MODEL_PROVIDER=ollama
export OLLAMA_MODEL=qwen2.5-coder:latest
```

### Run

```bash
npm start
# Server: http://localhost:8081
```

### Connect Claude Code CLI

```bash
export ANTHROPIC_BASE_URL=http://localhost:8081
export ANTHROPIC_API_KEY=dummy
claude
```

---

## Supported Providers

| Provider | Type | Cost | Platform |
|----------|------|------|----------|
| Ollama | Local | FREE | Cross-platform |
| llama.cpp | Local | FREE | Cross-platform |
| LM Studio | Local | FREE | Cross-platform |
| MLX OpenAI Server | Local | FREE | Apple Silicon |
| AWS Bedrock | Cloud | $$ | 100+ models |
| OpenRouter | Cloud | $ | 100+ models |
| Databricks | Cloud | $$$ | Claude 4.5 |
| Azure OpenAI | Cloud | $$$ | GPT-4o, o1 |
| Azure Anthropic | Cloud | $$$ | Claude |
| OpenAI | Cloud | $$$ | GPT-4o, o1 |

> 🌐 **Remote Support:** All endpoints support remote addresses - run models on GPU servers, share across teams.

---

## Supported Clients

| Client | Setup |
|--------|-------|
| **Claude Code CLI** | `export ANTHROPIC_BASE_URL=http://localhost:8081` |
| **Cursor IDE** | Settings → Models → Base URL: `http://localhost:8081/v1` |
| **Codex CLI** | `export OPENAI_BASE_URL=http://localhost:8081/v1` |
| **ClawdBot** | Copilot Proxy base URL: `http://localhost:8081/v1` |
| **Cline / Continue.dev** | OpenAI-compatible endpoint |

---

## Documentation

Full documentation: [documentation/](https://github.com/vishalveerareddy123/Lynkr/tree/main/documentation)

### Getting Started
- [Installation](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/installation.md)
- [Provider Configuration](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/providers.md)
- [Troubleshooting](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/troubleshooting.md)

### Client Integration
- [Claude Code CLI Setup](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/claude-code-cli.md)
- [Cursor IDE Integration](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/cursor-integration.md)
- [Embeddings (@Codebase)](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/embeddings.md)

### Features
- [Token Optimization](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/token-optimization.md)
- [Memory System](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/memory-system.md)
- [Headroom Compression](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/headroom.md)
- [API Reference](https://github.com/vishalveerareddy123/Lynkr/blob/main/documentation/api.md)

---

## Architecture

```
Claude Code / Cursor / Codex / ClawdBot
                │
                ▼
        ┌───────────────┐
        │  Lynkr Proxy  │  Format conversion, caching,
        │  :8081        │  token optimization, tools
        └───────┬───────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  Local       Cloud      Remote
  ───────     ─────      ──────
  Ollama      Databricks  GPU Server
  llama.cpp   Bedrock     (any IP)
  LM Studio   OpenRouter
  MLX Server  Azure/OpenAI
```

---

## Features

- **Multi-Provider Support** - Switch providers without code changes
- **Token Optimization** - 60-80% cost reduction
- **Prompt Caching** - SQLite-backed LRU cache with TTL
- **Long-Term Memory** - Titans-inspired memory system
- **History Compression** - Smart context window management
- **Tool Calling** - Full MCP integration
- **Embeddings** - @Codebase semantic search
- **Remote Endpoints** - Connect to models on any machine
- **Enterprise Ready** - Circuit breakers, load shedding, metrics, health checks

---

## Quick Config Examples

**Local (Ollama)**
```bash
export MODEL_PROVIDER=ollama
export OLLAMA_MODEL=qwen2.5-coder:latest
```

**Local (MLX - Apple Silicon)**
```bash
# Start MLX server first
mlx-openai-server launch --model-path mlx-community/Qwen2.5-Coder-7B-Instruct-4bit --model-type lm

# Configure Lynkr
export MODEL_PROVIDER=openai
export OPENAI_ENDPOINT=http://localhost:8000/v1/chat/completions
export OPENAI_API_KEY=not-needed
```

**Remote (GPU Server)**
```bash
export MODEL_PROVIDER=ollama
export OLLAMA_ENDPOINT=http://192.168.1.100:11434
```

**Cloud (AWS Bedrock)**
```bash
export MODEL_PROVIDER=bedrock
export AWS_BEDROCK_API_KEY=your-key
export AWS_BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
```

---

## Links

- [GitHub Repository](https://github.com/vishalveerareddy123/Lynkr)
- [NPM Package](https://www.npmjs.com/package/lynkr)
- [Issues](https://github.com/vishalveerareddy123/Lynkr/issues)
- [Discussions](https://github.com/vishalveerareddy123/Lynkr/discussions)

---

## License

Apache 2.0

---

## Keywords

`claude-code` `claude-proxy` `anthropic-api` `databricks-llm` `aws-bedrock` `openrouter` `ollama` `llama-cpp` `mlx` `azure-openai` `mcp-server` `prompt-caching` `token-optimization` `ai-coding-assistant` `llm-proxy` `self-hosted-ai` `cursor-ide` `codex-cli` `clawdbot`
