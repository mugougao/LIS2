/**
 * useAgentTimeline.js — 智能体会话时序状态聚合
 *
 * 职责：把 WebSocket 上的扁平 tool_call / tool_result / text 等消息归并为
 *       面向"步骤(Step)"的时序结构，供 UI 折叠/展开渲染。
 *
 * 设计要点：
 *   - 同一轮 LLM 思考产生的连续 tool_call 会聚合到同一个 step-group；
 *     一旦遇到 text / user / system 等非工具消息，下一次 tool_call 开启新组。
 *   - tool_result 通过 tool_call_id 精确回填到对应 Step。
 *
 * 不依赖任何 UI 框架以外的库；纯函数式逻辑容易测试。
 */
import { ref } from 'vue'

// 工具元数据：仅中文名。其他参数渲染交给 UI 层。
const TOOL_META = {
  query_conflict_detail:     { label: '查询冲突详情' },
  query_plan_detail:         { label: '查询计划详情' },
  adjust_time:               { label: '调整时间' },
  adjust_altitude:           { label: '调整高度' },
  set_avoidance_zone:        { label: '设置避让区' },
  replan_route:              { label: '重新规划航路' },
  detect_conflict_for_plans: { label: '重检冲突' },
  confirm_solution:          { label: '提交方案' }
}

function getToolLabel(name) {
  return (TOOL_META[name] && TOOL_META[name].label) || name || '工具调用'
}

// 折叠态下的参数摘要：用最关键的 1~2 个字段简短表达
function getStepSummary(name, args) {
  if (!args || typeof args !== 'object') return ''
  const shortId = (v) => (typeof v === 'string' ? v.substring(0, 8) : v)
  switch (name) {
    case 'query_conflict_detail': return shortId(args.conflict_id) || ''
    case 'query_plan_detail':     return shortId(args.plan_id) || ''
    case 'adjust_time':
      if (args.offset_minutes == null) return ''
      return (args.offset_minutes > 0 ? '+' : '') + args.offset_minutes + ' 分钟'
    case 'adjust_altitude':
      return args.new_altitude != null ? `→ ${args.new_altitude}m` : ''
    case 'set_avoidance_zone':
      if (args.center_lon == null) return ''
      return `(${Number(args.center_lon).toFixed(3)}, ${Number(args.center_lat).toFixed(3)}) r=${args.radius || 100}m`
    case 'replan_route': return shortId(args.plan_id) || ''
    case 'detect_conflict_for_plans':
      return Array.isArray(args.plan_ids) ? `${args.plan_ids.length} 个计划` : ''
    case 'confirm_solution': return shortId(args.conflict_id) || ''
    default: return ''
  }
}

function safeParse(v) {
  if (v == null) return v
  if (typeof v !== 'string') return v
  try { return JSON.parse(v) } catch { return v }
}

function isFailedResult(result) {
  if (!result || typeof result !== 'object') return false
  return !!result.error
}

export function useAgentTimeline() {
  // timeline 元素类型：
  //   { kind: 'user'|'assistant', content, ts }
  //   { kind: 'system', content, level: 'info'|'error'|'end', ts }
  //   { kind: 'step-group', ts, steps: Step[] }
  const timeline = ref([])

  function _last() {
    return timeline.value[timeline.value.length - 1]
  }

  function _pushNonStep(item) {
    timeline.value.push(item)
  }

  function appendUser(content) {
    _pushNonStep({ kind: 'user', content, ts: Date.now() })
  }

  function appendAssistant(content) {
    _pushNonStep({ kind: 'assistant', content, ts: Date.now() })
  }

  function appendSystem(content, level = 'info') {
    _pushNonStep({ kind: 'system', content, level, ts: Date.now() })
  }

  function appendToolCall(msg) {
    const args = safeParse(msg.arguments)
    const step = {
      id: msg.tool_call_id || `tc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: msg.name,
      label: getToolLabel(msg.name),
      summary: getStepSummary(msg.name, args),
      args,
      result: null,
      status: 'running',
      startedAt: Date.now(),
      endedAt: null,
      expanded: false
    }
    const last = _last()
    if (last && last.kind === 'step-group') {
      last.steps.push(step)
    } else {
      timeline.value.push({ kind: 'step-group', ts: Date.now(), steps: [step] })
    }
  }

  function appendToolResult(msg) {
    const result = safeParse(msg.result)
    // 从后往前找尚未填充结果的同 id Step
    for (let i = timeline.value.length - 1; i >= 0; i--) {
      const item = timeline.value[i]
      if (item.kind !== 'step-group') continue
      for (let j = item.steps.length - 1; j >= 0; j--) {
        const s = item.steps[j]
        if (s.id === msg.tool_call_id && s.status === 'running') {
          s.result = result
          s.endedAt = Date.now()
          s.status = isFailedResult(result) ? 'failed' : 'success'
          return
        }
      }
    }
    // 没匹配到（极端情况）：单独新建一个 group 仅含结果占位
    timeline.value.push({
      kind: 'step-group',
      ts: Date.now(),
      steps: [{
        id: msg.tool_call_id || `tr_${Date.now()}`,
        name: msg.name || 'unknown',
        label: getToolLabel(msg.name),
        summary: '',
        args: null,
        result,
        status: isFailedResult(result) ? 'failed' : 'success',
        startedAt: Date.now(),
        endedAt: Date.now(),
        expanded: false
      }]
    })
  }

  function toggleStep(step) {
    step.expanded = !step.expanded
  }

  function clear() {
    timeline.value = []
  }

  return {
    timeline,
    appendUser,
    appendAssistant,
    appendSystem,
    appendToolCall,
    appendToolResult,
    toggleStep,
    clear,
    getToolLabel
  }
}
