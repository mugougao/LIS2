require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { getDb } = require('./database');
const apiRoutes = require('./routes/api');
const { handleAgentWebSocket } = require('./routes/ws');
const { ensureOperatorsExist } = require('./services/operatorService');

const PORT = process.env.PORT || 3000;

async function main() {
  const db = await getDb();
  console.log('数据库初始化成功');

  ensureOperatorsExist();
  console.log('默认运营商数据已就绪');

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use('/api', apiRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: '/ws/agent' });
  wss.on('connection', (ws, req) => {
    handleAgentWebSocket(ws, req).catch(err => {
      console.error('WebSocket handler error:', err.message);
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'error', content: err.message }));
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`LIS2 后端服务已启动: http://localhost:${PORT}`);
    console.log(`WebSocket 服务已就绪: ws://localhost:${PORT}/ws/agent`);
    console.log(`数据库路径: ${process.env.DB_PATH || '默认'}`);
  });
}

main().catch(err => {
  console.error('服务启动失败:', err);
  process.exit(1);
});
