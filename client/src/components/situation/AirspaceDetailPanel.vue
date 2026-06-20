<template>
  <div class="detail-body">
    <section>
      <h3>基本信息</h3>
      <div class="info-grid">
        <span>高度范围</span><b>{{ item.heightRange }}</b>
        <span>空域类型</span><b>{{ item.type }}</b>
        <span>管理单位</span><b>{{ item.unit }}</b>
        <span>生效时间</span><b>{{ item.effectiveTime }}</b>
        <span>状态</span><b class="green">{{ item.status }}</b>
        <span>优先级</span><b>{{ item.priority }}</b>
      </div>
    </section>
    <section class="occupancy-row">
      <RingProgress :value="item.occupancy" />
      <div class="info-grid compact">
        <span>占用体积</span><b>{{ item.volume }}</b>
        <span>剩余体积</span><b>{{ item.remainingVolume }}</b>
      </div>
    </section>
    <section class="route-links-row">
      <h3>关联航线</h3>
      <p v-for="route in item.relatedRoutes" :key="route">{{ route }} <em>生效中</em></p>
    </section>
    <section>
      <h3>关联飞行器</h3>
      <div class="bars"><span>在线飞行器</span><ProgressBar :value="53" /><b>8 / 15</b></div>
      <div class="bars"><span>执行中</span><ProgressBar :value="40" tone="cyan" /><b>2 / 5</b></div>
    </section>
    <section class="metric-grid">
      <MetricCard :image="metricIcons.flightTask" label="飞行任务/计划" :value="item.plans.total" />
      <MetricCard :image="metricIcons.weather" label="气象环境" :value="weather.temperature" tone="cyan" />
      <MetricCard :image="metricIcons.rules" label="规则约束" value="12" />
      <MetricCard :image="metricIcons.recentAlerts" label="近期告警" value="2" tone="red" />
    </section>
    <section class="alert-list">
      <h3>近期告警</h3>
      <article
        v-for="alert in alertItems"
        :key="alert.id"
        class="alert-entry"
        :class="[alert.tone, { active: selectedAlertId === alert.id }]"
        role="button"
        tabindex="0"
        :aria-selected="selectedAlertId === alert.id"
        @click="selectAlert(alert.id)"
        @keydown.enter.prevent="selectAlert(alert.id)"
        @keydown.space.prevent="selectAlert(alert.id)"
      >
        <span class="alert-entry__icon"><img :src="alert.icon" alt="" /></span>
        <span class="alert-entry__main">
          <span class="alert-entry__meta">
            <b>{{ alert.time }}</b>
            <em>{{ alert.type }}</em>
          </span>
          <strong>{{ alert.title }}</strong>
          <small>{{ alert.detail }}</small>
        </span>
        <button type="button" class="alert-entry__action" @click.stop="openAlertDetail(alert)">查看</button>
      </article>
    </section>

    <Teleport to="body">
      <div v-if="detailAlert" class="alert-modal-backdrop" @click="closeAlertDetail">
        <section class="alert-modal" :class="detailAlert.tone" role="dialog" aria-modal="true" aria-labelledby="alert-detail-title" @click.stop>
          <button type="button" class="alert-modal__close" aria-label="关闭告警详情" @click="closeAlertDetail">×</button>
          <div class="alert-modal__head">
            <span class="alert-modal__icon"><img :src="detailAlert.icon" alt="" /></span>
            <div>
              <span class="alert-modal__eyebrow">{{ detailAlert.time }} · {{ detailAlert.type }}</span>
              <h2 id="alert-detail-title">{{ detailAlert.title }}</h2>
              <p>{{ detailAlert.detail }}</p>
            </div>
            <b>{{ detailAlert.level }}</b>
          </div>

          <div class="alert-modal__summary">
            <strong>{{ detailAlert.summary }}</strong>
            <span>{{ detailAlert.status }}</span>
          </div>

          <div class="alert-modal__grid">
            <div><span>所属空域</span><b>{{ item.name }}</b></div>
            <div><span>高度范围</span><b>{{ item.heightRange }}</b></div>
            <div><span>触发对象</span><b>{{ detailAlert.target }}</b></div>
            <div><span>影响范围</span><b>{{ detailAlert.impact }}</b></div>
            <div><span>判定来源</span><b>{{ detailAlert.source }}</b></div>
            <div><span>建议响应</span><b>{{ detailAlert.response }}</b></div>
          </div>

          <div class="alert-modal__split">
            <div>
              <h3>事件过程</h3>
              <ol class="alert-modal__timeline">
                <li v-for="step in detailAlert.timeline" :key="step.time">
                  <b>{{ step.time }}</b>
                  <span>{{ step.text }}</span>
                </li>
              </ol>
            </div>
            <div>
              <h3>处置建议</h3>
              <ul class="alert-modal__actions">
                <li v-for="action in detailAlert.actions" :key="action">{{ action }}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { weather } from '../../data/situationMock'
import RingProgress from './RingProgress.vue'
import ProgressBar from './ProgressBar.vue'
import MetricCard from './MetricCard.vue'
import flightTaskIcon from '../../assets/airspace-metric-icons/flight-task.png'
import weatherIcon from '../../assets/airspace-metric-icons/weather.png'
import rulesIcon from '../../assets/airspace-metric-icons/rules.png'
import recentAlertsIcon from '../../assets/airspace-metric-icons/recent-alerts.png'

const metricIcons = {
  flightTask: flightTaskIcon,
  weather: weatherIcon,
  rules: rulesIcon,
  recentAlerts: recentAlertsIcon
}

const alertItems = [
  {
    id: 'conflict-uav-117-045',
    time: '10:28',
    type: '冲突预警',
    title: 'UAV-117 与 UAV-045',
    detail: '在空域内可能冲突',
    tone: 'critical',
    icon: recentAlertsIcon,
    level: '高风险',
    status: '待确认 · 建议立即复核',
    target: 'UAV-117 / UAV-045',
    impact: 'A01 监控区核心航路交汇段',
    source: '轨迹预测 + 间隔规则',
    response: '2 分钟内人工确认',
    summary: '系统检测到两架飞行器预测航迹在短时窗口内出现横向间隔不足，存在近距离会遇风险。',
    timeline: [
      { time: '10:24', text: 'UAV-117 进入 A01 监控区北侧航段，航速保持稳定。' },
      { time: '10:26', text: 'UAV-045 计划航迹与 UAV-117 预测航迹出现交汇。' },
      { time: '10:28', text: '最小预测间隔低于安全阈值，生成冲突预警。' }
    ],
    actions: ['通知值守员复核两机任务状态', '优先调整低优先级飞行器航线或高度层', '持续跟踪 3 分钟内的预测间隔变化']
  },
  {
    id: 'temp-control-d07',
    time: '10:15',
    type: '临时管控',
    title: 'D07 活动保障区',
    detail: '临时管控生效',
    tone: 'warning',
    icon: rulesIcon,
    level: '管控中',
    status: '已生效 · 持续监视',
    target: 'D07 活动保障区',
    impact: '关联航线与任务计划需避让',
    source: '规则约束 + 计划联动',
    response: '保持广播并同步计划',
    summary: '活动保障区进入临时管控窗口，系统已提示相关任务进行航线避让和计划校验。',
    timeline: [
      { time: '10:10', text: '保障区管控计划进入生效前检查。' },
      { time: '10:14', text: '关联航线完成规则匹配，发现需避让任务。' },
      { time: '10:15', text: '临时管控正式生效，进入持续监视状态。' }
    ],
    actions: ['检查关联任务是否完成改航确认', '对未确认任务保持黄色提示', '管控结束前保留规则约束校验']
  }
]

const selectedAlertId = ref(alertItems[0].id)
const detailAlert = ref(null)

function selectAlert(id) {
  selectedAlertId.value = id
}

function openAlertDetail(alert) {
  selectedAlertId.value = alert.id
  detailAlert.value = alert
}

function closeAlertDetail() {
  detailAlert.value = null
}

defineProps({
  item: { type: Object, required: true }
})
</script>

<style scoped src="./panel.css"></style>
