const agentService = require('../services/agentService');

async function handleAgentWebSocket(ws, req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    ws.send(JSON.stringify({ type: 'error', content: 'Missing sessionId' }));
    ws.close();
    return;
  }

  const session = agentService.getSession(sessionId);
  if (!session) {
    ws.send(JSON.stringify({ type: 'error', content: '会话不存在' }));
    ws.close();
    return;
  }

  const wsSend = (msg) => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(msg));
    }
  };

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'user_message':
          wsSend({ type: 'text', content: '正在分析...' });
          try {
            await agentService.runAgentRound(sessionId, msg.content, wsSend);
          } catch (err) {
            wsSend({ type: 'error', content: `Agent处理失败: ${err.message}` });
          }
          break;

        case 'confirm_solution':
          try {
            const result = await agentService.handleConfirm(sessionId, msg.accept !== false);
            wsSend({
              type: 'session_end',
              status: result.status,
              message: result.status === 'resolved' ? '冲突已解决' : '方案已拒绝'
            });
            setTimeout(() => ws.close(), 1000);
          } catch (err) {
            wsSend({ type: 'error', content: err.message });
          }
          break;

        case 'cancel_session':
          await agentService.handleConfirm(sessionId, false);
          wsSend({ type: 'session_end', status: 'cancelled', message: '会话已取消' });
          ws.close();
          break;

        default:
          wsSend({ type: 'error', content: '未知消息类型' });
      }
    } catch (err) {
      wsSend({ type: 'error', content: `消息处理失败: ${err.message}` });
    }
  });

  ws.on('close', () => {
    agentService.endSession(sessionId, 'closed');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });

  wsSend({
    type: 'text',
    content: '会话已建立，冲突协调Agent就绪。请描述您的调整需求，或让Agent自动分析冲突并提出解决方案。'
  });

  if (session.conflict_event_id) {
    wsSend({
      type: 'text',
      content: `已加载冲突事件 ${session.conflict_event_id}，Agent正在分析...`
    });
    try {
      await agentService.runAgentRound(sessionId, '请分析此冲突并提出解决方案', wsSend);
    } catch (err) {
      wsSend({ type: 'error', content: `Agent初始化失败: ${err.message}` });
    }
  }
}

module.exports = { handleAgentWebSocket };
