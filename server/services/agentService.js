const { queryAll, queryOne, run } = require('../database');
const { v4: uuidv4 } = require('uuid');
const planService = require('./planService');
const conflictService = require('./conflictService');
const routingService = require('./routingService');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'query_conflict_detail',
      description: '查询冲突事件详情，返回结构化冲突信息',
      parameters: {
        type: 'object',
        properties: {
          conflict_id: { type: 'string', description: '冲突事件ID' }
        },
        required: ['conflict_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_plan_detail',
      description: '查询飞行计划详情',
      parameters: {
        type: 'object',
        properties: {
          plan_id: { type: 'string', description: '飞行计划ID' }
        },
        required: ['plan_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'adjust_time',
      description: '调整计划的时间（偏移量），需校验时间柔性',
      parameters: {
        type: 'object',
        properties: {
          plan_id: { type: 'string', description: '飞行计划ID' },
          offset_minutes: { type: 'number', description: '时间偏移量（分钟），正数为延迟，负数为提前' }
        },
        required: ['plan_id', 'offset_minutes']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'adjust_altitude',
      description: '调整计划某段高度，需校验高度柔性',
      parameters: {
        type: 'object',
        properties: {
          plan_id: { type: 'string', description: '飞行计划ID' },
          new_altitude: { type: 'number', description: '新的飞行高度（米）' }
        },
        required: ['plan_id', 'new_altitude']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_avoidance_zone',
      description: '在特定位置设置圆柱形避让区',
      parameters: {
        type: 'object',
        properties: {
          center_lon: { type: 'number', description: '避让区中心经度' },
          center_lat: { type: 'number', description: '避让区中心纬度' },
          altitude: { type: 'number', description: '避让区参考高度（米）' },
          radius: { type: 'number', description: '避让区半径（米）', default: 100 }
        },
        required: ['center_lon', 'center_lat', 'altitude']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'replan_route',
      description: '调用航路规划生成新航路（带避让区参数）',
      parameters: {
        type: 'object',
        properties: {
          plan_id: { type: 'string', description: '飞行计划ID' },
          avoidance_zones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                center_lon: { type: 'number' },
                center_lat: { type: 'number' },
                altitude: { type: 'number' },
                radius: { type: 'number' }
              }
            }
          }
        },
        required: ['plan_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'detect_conflict_for_plans',
      description: '对指定计划集合进行冲突检测',
      parameters: {
        type: 'object',
        properties: {
          plan_ids: {
            type: 'array',
            items: { type: 'string' },
            description: '需要检测的计划ID列表，至少2个'
          }
        },
        required: ['plan_ids']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'confirm_solution',
      description: '提交最终方案供用户确认，执行计划更新',
      parameters: {
        type: 'object',
        properties: {
          changes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                plan_id: { type: 'string' },
                field: { type: 'string', description: 'modified field' },
                value: { description: 'new value' }
              }
            }
          },
          conflict_id: { type: 'string' }
        },
        required: ['conflict_id']
      }
    }
  }
];

const SYSTEM_PROMPT = `你是一个低空多无人机运营的智能调度协调员。你的任务是解决飞行计划之间的时空冲突。
你可以使用提供的工具来查询、调整和验证计划。你必须遵守每个计划的可调节约束（时间是否可变、高度是否可变、任务是否可中断）以及非结构化诉求。
在调整时，优先考虑时间偏移，其次是高度层分离，最后是绕飞避让。始终在调整后重新检测冲突。最后向用户提出清晰简洁的调整建议。`;

async function callLLM(messages, tools = TOOLS) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM API error: ${response.status} ${errText}`);
  }

  return response.json();
}

function executeToolCall(toolName, args) {
  switch (toolName) {
    case 'query_conflict_detail': {
      const conflict = conflictService.getConflict(args.conflict_id);
      const plans = conflict ? planService.getPlansByIds(JSON.parse(conflict.involved_plans)) : [];
      return { conflict, plans };
    }
    case 'query_plan_detail': {
      return planService.getPlan(args.plan_id);
    }
    case 'adjust_time': {
      const plan = planService.getPlan(args.plan_id);
      if (!plan) return { error: '计划不存在' };
      if (!plan.time_flexible) return { error: '该计划时间不可变更' };
      const startTime = new Date(plan.start_time);
      const offsetMs = args.offset_minutes * 60 * 1000;
      const newStartTime = new Date(startTime.getTime() + offsetMs).toISOString();
      let newEndTime = null;
      if (plan.end_time) {
        const endTime = new Date(plan.end_time);
        newEndTime = new Date(endTime.getTime() + offsetMs).toISOString();
      }
      planService.updatePlan(args.plan_id, {
        start_time: newStartTime,
        end_time: newEndTime,
        status: 'modified'
      });
      return { success: true, plan: planService.getPlan(args.plan_id) };
    }
    case 'adjust_altitude': {
      const plan = planService.getPlan(args.plan_id);
      if (!plan) return { error: '计划不存在' };
      if (!plan.alt_flexible) return { error: '该计划高度不可变更' };
      planService.updatePlan(args.plan_id, {
        start_alt: args.new_altitude,
        end_alt: args.new_altitude,
        status: 'modified'
      });
      return { success: true, plan: planService.getPlan(args.plan_id) };
    }
    case 'set_avoidance_zone': {
      return {
        success: true,
        zone: {
          center_lon: args.center_lon,
          center_lat: args.center_lat,
          altitude: args.altitude,
          radius: args.radius || 100
        }
      };
    }
    case 'replan_route': {
      const result = routingService.replanRoute(args.plan_id, args.avoidance_zones || []);
      return { success: true, waypoints: result };
    }
    case 'detect_conflict_for_plans': {
      if (!args.plan_ids || args.plan_ids.length < 2) return { error: '至少需要2个计划ID' };
      const p1 = planService.getPlan(args.plan_ids[0]);
      const p2 = planService.getPlan(args.plan_ids[1]);
      const result = conflictService.detectPair(args.plan_ids[0], args.plan_ids[1]);
      return result || { message: '未检测到冲突' };
    }
    case 'confirm_solution': {
      conflictService.updateConflictStatus(args.conflict_id, 'resolved');
      return { success: true, message: '方案已确认，冲突已解决' };
    }
    default:
      return { error: `未知工具: ${toolName}` };
  }
}

function createSession(conflictEventId) {
  const sessionId = uuidv4();
  run('INSERT INTO agent_sessions (id, conflict_event_id, status) VALUES (?,?,?)',
    [sessionId, conflictEventId || null, 'active']);
  return getSession(sessionId);
}

function getSession(sessionId) {
  return queryOne('SELECT * FROM agent_sessions WHERE id = ?', [sessionId]);
}

function getSessionMessages(sessionId) {
  return queryAll('SELECT * FROM session_messages WHERE session_id = ? ORDER BY timestamp ASC', [sessionId]);
}

function addMessage(sessionId, role, content) {
  const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
  run('INSERT INTO session_messages (session_id, role, content) VALUES (?,?,?)',
    [sessionId, role, contentStr]);
}

function endSession(sessionId, status) {
  run('UPDATE agent_sessions SET status = ? WHERE id = ?', [status, sessionId]);
}

async function runAgentRound(sessionId, userMessage, wsSend) {
  const session = getSession(sessionId);
  if (!session) throw new Error('会话不存在');

  addMessage(sessionId, 'user', userMessage);

  const history = getSessionMessages(sessionId);
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];

  if (session.conflict_event_id) {
    const conflict = conflictService.getConflict(session.conflict_event_id);
    if (conflict) {
      const involvedPlans = planService.getPlansByIds(JSON.parse(conflict.involved_plans));
      messages.push({
        role: 'system',
        content: `当前处理的冲突事件信息：\n${JSON.stringify({ conflict, involvedPlans }, null, 2)}`
      });
    }
  }

  for (const msg of history) {
    if (msg.role === 'user' || msg.role === 'system') {
      messages.push({ role: msg.role, content: msg.content });
    } else if (msg.role === 'assistant') {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.type === 'tool_call') {
          messages.push({
            role: 'assistant',
            content: null,
            tool_calls: [{
              id: parsed.tool_call_id || 'call_' + Date.now(),
              type: 'function',
              function: {
                name: parsed.name,
                arguments: typeof parsed.arguments === 'string' ? parsed.arguments : JSON.stringify(parsed.arguments)
              }
            }]
          });
        } else {
          messages.push({ role: 'assistant', content: msg.content });
        }
      } catch {
        messages.push({ role: 'assistant', content: msg.content });
      }
    } else if (msg.role === 'tool') {
      try {
        const parsed = JSON.parse(msg.content);
        messages.push({
          role: 'tool',
          tool_call_id: parsed.tool_call_id || 'call_' + Date.now(),
          content: parsed.result ? JSON.stringify(parsed.result) : msg.content
        });
      } catch {
        messages.push({ role: 'tool', tool_call_id: 'call_' + Date.now(), content: msg.content });
      }
    }
  }

  let continueLoop = true;
  let loopCount = 0;
  const MAX_LOOPS = 10;

  while (continueLoop && loopCount < MAX_LOOPS) {
    loopCount++;
    continueLoop = false;

    const response = await callLLM(messages);
    const choice = response.choices[0];

    if (choice.finish_reason === 'tool_calls') {
      for (const toolCall of choice.message.tool_calls) {
        const toolMsg = {
          type: 'tool_call',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          arguments: toolCall.function.arguments
        };
        wsSend(toolMsg);
        addMessage(sessionId, 'assistant', JSON.stringify(toolMsg));

        let args;
        try {
          args = typeof toolCall.function.arguments === 'string'
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments;
        } catch {
          args = {};
        }

        const result = executeToolCall(toolCall.function.name, args);
        const toolResultMsg = {
          type: 'tool_result',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          result
        };
        wsSend(toolResultMsg);
        addMessage(sessionId, 'tool', JSON.stringify(toolResultMsg));

        messages.push({
          role: 'assistant',
          content: null,
          tool_calls: [toolCall]
        });
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });
      }
      continueLoop = true;
    } else {
      const text = choice.message.content;
      wsSend({ type: 'text', content: text });
      addMessage(sessionId, 'assistant', text);

      wsSend({
        type: 'confirmation_required',
        message: '请确认上述调整方案，或提出修改意见'
      });
    }
  }

  if (loopCount >= MAX_LOOPS) {
    wsSend({ type: 'text', content: '已达到最大协商轮次，请手动处理' });
    wsSend({ type: 'confirmation_required', message: '请手动处理此冲突' });
  }
}

async function handleConfirm(sessionId, accept) {
  const session = getSession(sessionId);
  if (!session) throw new Error('会话不存在');

  if (accept && session.conflict_event_id) {
    conflictService.updateConflictStatus(session.conflict_event_id, 'resolved');
    addMessage(sessionId, 'system', '用户确认方案，冲突已解决');
  } else {
    addMessage(sessionId, 'system', '用户拒绝方案');
  }

  endSession(sessionId, accept ? 'completed' : 'failed');
  return { status: accept ? 'resolved' : 'rejected' };
}

module.exports = {
  TOOLS, SYSTEM_PROMPT,
  createSession, getSession, getSessionMessages, addMessage, endSession,
  runAgentRound, handleConfirm, executeToolCall, callLLM
};
