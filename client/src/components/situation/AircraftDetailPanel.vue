<template>
  <div class="detail-body">
    <section>
      <h3>基本信息</h3>
      <div class="info-grid">
        <div class="field"><span>机型</span><b>{{ item.type }}</b></div>
        <div class="field"><span>编号</span><b>{{ item.id }}</b></div>
        <div class="field"><span>所属单位</span><b>{{ item.unit }}</b></div>
        <div class="field"><span>设备ID</span><b>{{ item.deviceId }}</b></div>
        <div class="field"><span>起飞时间</span><b>{{ item.takeoffTime }}</b></div>
        <div class="field"><span>任务类型</span><b>{{ item.missionType }}</b></div>
      </div>
    </section>
    <section>
      <h3>飞行状态</h3>
      <div class="info-grid">
        <div class="field"><span>任务状态</span><b class="green">{{ item.status }}</b></div>
        <div class="field"><span>自动驾驶</span><b>已启用</b></div>
        <div class="field"><span>飞行模式</span><b>{{ item.mode }}</b></div>
        <div class="field"><span>健康状态</span><b class="green">{{ item.health }}</b></div>
      </div>
    </section>
    <section>
      <h3>实时位置</h3>
      <div class="info-grid">
        <div class="field"><span>经度</span><b>{{ item.longitude }}</b></div>
        <div class="field"><span>纬度</span><b>{{ item.latitude }}</b></div>
        <div class="field"><span>地理位置</span><b>{{ item.location }}</b></div>
      </div>
    </section>
    <section>
      <h3>高度 / 速度</h3>
      <div class="info-grid">
        <div class="field"><span>当前高度</span><b>{{ item.altitude }}m</b></div>
        <div class="field"><span>垂直速度</span><b>{{ item.verticalSpeed }}</b></div>
        <div class="field"><span>地速</span><b>{{ item.speed }}</b></div>
        <div class="field"><span>航向</span><b>{{ item.heading }}</b></div>
      </div>
    </section>
    <section>
      <h3>飞行任务</h3>
      <p>{{ item.mission }}</p>
      <div class="bars"><span>任务进度</span><ProgressBar :value="item.missionProgress" /><b>{{ item.missionProgress }}%</b></div>
      <div class="info-grid">
        <div class="field"><span>计划航时</span><b>{{ item.planTime }}</b></div>
        <div class="field"><span>已飞航时</span><b>{{ item.flownTime }}</b></div>
      </div>
    </section>
    <section>
      <h3>电量 / 通信状态</h3>
      <div class="bars"><span>电量</span><ProgressBar :value="item.battery" /><b>{{ item.battery }}%</b></div>
      <p>通信状态 <em>{{ item.communication }}</em></p>
    </section>
    <section>
      <h3>历史轨迹摘要</h3>
      <div class="info-grid">
        <div class="field"><span>飞行里程</span><b>{{ item.mileage }}</b></div>
        <div class="field"><span>平均速度</span><b>{{ item.avgSpeed }}</b></div>
        <div class="field"><span>最大高度</span><b>{{ item.maxAltitude }}</b></div>
        <div class="field"><span>告警次数</span><b>{{ item.alertCount }}</b></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import ProgressBar from './ProgressBar.vue'

defineProps({
  item: { type: Object, required: true }
})
</script>

<style scoped src="./panel.css"></style>
