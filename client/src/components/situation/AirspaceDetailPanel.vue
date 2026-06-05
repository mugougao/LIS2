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
    <section>
      <h3>关联航线</h3>
      <p v-for="route in item.relatedRoutes" :key="route">{{ route }} <em>生效中</em></p>
    </section>
    <section>
      <h3>关联飞行器</h3>
      <div class="bars"><span>在线飞行器</span><ProgressBar :value="53" /><b>8 / 15</b></div>
      <div class="bars"><span>执行中</span><ProgressBar :value="40" tone="cyan" /><b>2 / 5</b></div>
    </section>
    <section class="metric-grid">
      <MetricCard icon="⌁" label="飞行任务/计划" :value="item.plans.total" />
      <MetricCard icon="☁" label="气象环境" :value="weather.temperature" tone="cyan" />
      <MetricCard icon="▣" label="规则约束" value="12" />
      <MetricCard icon="!" label="近期告警" value="2" tone="red" />
    </section>
    <section>
      <h3>近期告警</h3>
      <p class="alert">10:28 冲突预警：UAV-117 与 UAV-045 在空域内可能冲突</p>
      <p class="warning">10:15 临时管控：D07 活动保障区临时管控生效</p>
    </section>
  </div>
</template>

<script setup>
import { weather } from '../../data/situationMock'
import RingProgress from './RingProgress.vue'
import ProgressBar from './ProgressBar.vue'
import MetricCard from './MetricCard.vue'

defineProps({
  item: { type: Object, required: true }
})
</script>

<style scoped src="./panel.css"></style>
