#!/usr/bin/env node
/*
 Minimal CLI for Miro Mindmap (experimental API)
 Commands:
   node scripts/miro/mindmap.js list [--limit N] [--cursor CUR]
   node scripts/miro/mindmap.js get <nodeId>
   node scripts/miro/mindmap.js create [--content "Text"] [--x 0] [--y 0] [--parent <nodeId>]
   node scripts/miro/mindmap.js delete <nodeId>

 Docs:
 - Create mind map node: https://developers.miro.com/reference/create-mindmap-nodes-experimental
 - Get mind map nodes:  https://developers.miro.com/reference/get-mindmap-nodes-experimental
 - Get mind map node:   https://developers.miro.com/reference/get-mindmap-node-experimental
 - Delete mind map node: https://developers.miro.com/reference/delete-mindmap-node-experimental
*/

const fs = require('fs');
const path = require('path');

function readEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('Missing .env file at project root');
  }
  const envRaw = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of envRaw.split('\n')) {
    if (!line || line.trim().startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const token = (env.MIRO_ACCESS_TOKEN || '').startsWith('Bearer ')
    ? env.MIRO_ACCESS_TOKEN
    : `Bearer ${env.MIRO_ACCESS_TOKEN}`;
  const boardId = env.MIRO_BOARD_ID || 'uXjVJAgB8Ik=';
  return { token, boardId };
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { args._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) { args[key] = next; i++; }
    else { args[key] = true; }
  }
  return args;
}

function printHelp() {
  console.log('Miro Mindmap CLI (experimental)');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/miro/mindmap.js list [--limit N] [--cursor CUR]');
  console.log('  node scripts/miro/mindmap.js get <nodeId>');
  console.log('  node scripts/miro/mindmap.js children <nodeId> [--limit N]');
  console.log('  node scripts/miro/mindmap.js create [--content "Text"] [--x 0] [--y 0] [--parent <nodeId>]');
  console.log('  node scripts/miro/mindmap.js delete <nodeId>');
  console.log('');
  console.log('Docs:');
  console.log('  Create: https://developers.miro.com/reference/create-mindmap-nodes-experimental');
  console.log('  List:   https://developers.miro.com/reference/get-mindmap-nodes-experimental');
  console.log('  Get:    https://developers.miro.com/reference/get-mindmap-node-experimental');
  console.log('  Delete: https://developers.miro.com/reference/delete-mindmap-node-experimental');
}

async function listNodes({ token, boardId }, { limit, cursor }) {
  const url = new URL(`https://api.miro.com/v2-experimental/boards/${boardId}/mindmap_nodes`);
  if (limit) url.searchParams.set('limit', String(limit));
  if (cursor) url.searchParams.set('cursor', String(cursor));
  const res = await fetch(url, { headers: { Authorization: token } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`List failed: ${res.status} ${res.statusText}\n${txt}`);
  }
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

async function getNode({ token, boardId }, nodeId) {
  if (!nodeId) throw new Error('Missing <nodeId>');
  const url = `https://api.miro.com/v2-experimental/boards/${boardId}/mindmap_nodes/${nodeId}`;
  const res = await fetch(url, { headers: { Authorization: token } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Get failed: ${res.status} ${res.statusText}\n${txt}`);
  }
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

async function getChildren({ token, boardId }, nodeId, { limit }) {
  if (!nodeId) throw new Error('Missing <nodeId>');
  const url = new URL(`https://api.miro.com/v2-experimental/boards/${boardId}/mindmap_nodes`);
  url.searchParams.set('parent_item_id', nodeId);
  if (limit) url.searchParams.set('limit', String(limit));
  const res = await fetch(url, { headers: { Authorization: token } });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Get children failed: ${res.status} ${res.statusText}\n${txt}`);
  }
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

async function createNode({ token, boardId }, { content, x, y, parent }) {
  const body = {};
  if (content) {
    body.data = {
      nodeView: {
        data: {
          content: content
        }
      }
    };
  }
  if (x !== undefined || y !== undefined) {
    body.position = { 
      x: x ? Number(x) : 0, 
      y: y ? Number(y) : 0 
    };
  }
  if (parent) body.parent = { id: String(parent) };
  
  const res = await fetch(`https://api.miro.com/v2-experimental/boards/${boardId}/mindmap_nodes`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`Create failed: ${res.status} ${res.statusText}\n${txt}`);
  console.log(txt);
}

async function deleteNode({ token, boardId }, nodeId) {
  if (!nodeId) throw new Error('Missing <nodeId>');
  const res = await fetch(`https://api.miro.com/v2-experimental/boards/${boardId}/mindmap_nodes/${nodeId}`, {
    method: 'DELETE',
    headers: { Authorization: token }
  });
  if (res.status === 204) { console.log('{"status":"deleted"}'); return; }
  const txt = await res.text();
  if (!res.ok) throw new Error(`Delete failed: ${res.status} ${res.statusText}\n${txt}`);
  console.log(txt);
}

(async function run() {
  try {
    const { token, boardId } = readEnv();
    const args = parseArgs(process.argv.slice(2));
    const [cmd, a1] = args._;
    if (!cmd || cmd === 'help' || cmd === '-h' || cmd === '--help') {
      printHelp();
      return;
    }
    if (cmd === 'list') {
      await listNodes({ token, boardId }, { limit: args.limit, cursor: args.cursor });
      return;
    }
    if (cmd === 'get') {
      await getNode({ token, boardId }, a1);
      return;
    }
    if (cmd === 'children') {
      await getChildren({ token, boardId }, a1, { limit: args.limit });
      return;
    }
    if (cmd === 'create') {
      await createNode({ token, boardId }, { content: args.content, x: args.x, y: args.y, parent: args.parent });
      return;
    }
    if (cmd === 'delete') {
      await deleteNode({ token, boardId }, a1);
      return;
    }
    printHelp();
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();


