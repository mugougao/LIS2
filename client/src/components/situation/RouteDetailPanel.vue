<template>
  <div class="detail-body">
    <section>
      <h3>基本信息</h3>
      <div class="info-grid">
        <span>航线类型</span><b>{{ item.type }}</b>
        <span>航路长度</span><b>{{ item.length }}</b>
        <span>高度范围</span><b>{{ item.heightRange }}</b>
        <span>点位数量</span><b>{{ item.waypointCount }} 个</b>
      </div>
    </section>
    <section>
      <h3>航线属性</h3>
      <div class="info-grid">
        <span>占用率</span><b>{{ item.occupancy }}%（{{ item.occupied }}）</b>
        <span>优先级</span><b>{{ item.priority }}</b>
        <span>执行时段</span><b>{{ item.timeRange }}</b>
        <span>执行频率</span><b>{{ item.frequency }}</b>
      </div>
    </section>
    <section>
      <h3>经过点位</h3>
      <p>{{ item.waypoints.slice(0, 4).join(' → ') }}</p>
      <p>{{ item.waypoints.slice(4).join(' → ') }}</p>
    </section>
    <section>
      <h3>关联飞行器</h3>
      <p v-for="aircraftId in item.relatedAircraft" :key="aircraftId">{{ aircraftId }} · 多旋翼无人机 <em>执行中</em></p>
    </section>
    <section>
      <h3>关联飞行计划</h3>
      <p>{{ item.relatedPlan }} · {{ item.planName }} <em>执行中</em></p>
    </section>
    <section class="metric-grid">
      <MetricCard icon="☁" label="气象环境" :value="weather.windSpeed" tone="cyan" />
      <MetricCard icon="△" label="风险点位" :value="item.riskPoints" tone="yellow" />
      <MetricCard icon="▣" label="规则约束" value="3" />
      <MetricCard icon="!" label="近期告警" :value="item.alerts" tone="red" />
    </section>
  </div>
</template>

<script setup>
import { weather } from '../../data/situationMock'
import MetricCard from './MetricCard.vue'

defineProps({
  item: { type: Object, required: true }
})
</script>

<style scoped src="./panel.css"></style>
