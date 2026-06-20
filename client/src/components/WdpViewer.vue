<template>
  <div class="wdp-wrapper">
    <div id="wdp-container" ref="wdpContainer" class="wdp-container"></div>
    <div v-if="showLoading" class="loading-overlay">
      <div class="loading-card">
        <h3>场景加载中</h3>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ loadingProgress }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useWdpEngine } from '../composables/useWdpEngine'

const wdpContainer = ref(null)
const { init, isSceneReady, loadingProgress } = useWdpEngine()

const showLoading = ref(!isSceneReady.value && loadingProgress.value < 100)

const INITIAL_CAMERA = {
  location: [113.9834465855843, 22.485124279571089, 2400.6137883582801],
  rotation: {
    pitch: -24.2247314453125,
    yaw: -88.110244750976562
  },
  locationLimit: [],
  pitchLimit: [-89, 0],
  yawLimit: [-180, 179.99899291992188],
  viewDistanceLimit: [1, 10000],
  controlMode: 'RTS',
  fieldOfView: 90
}

onMounted(async () => {
  await init('wdp-container', {
    onSceneReady: async (App) => {
      await App.Renderer.SetRendererMode('full', [3840, 2160])
      await App.Environment.SetSkylightTime('18:30', 1, false)
      await App.CameraControl.UpdateCamera(INITIAL_CAMERA)
    }
  })
  showLoading.value = false
})
</script>

<style scoped>
.wdp-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.wdp-container {
  width: 100%;
  height: 100%;
}
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 15, 0.92);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.loading-card h3 {
  font-size: 18px;
  color: var(--green-primary);
  font-weight: 600;
  margin: 0;
}
.progress-track {
  width: 260px;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--green-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px var(--green-glow);
}
.progress-text {
  font-size: 13px;
  color: var(--text-secondary);
}
</style>
