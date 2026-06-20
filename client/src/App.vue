<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <div class="app-shell">
      <TopBar />
      <div class="app-content">
        <WdpViewer class="global-wdp" />
        <iframe
          v-if="windLayer"
          class="wind-earth-overlay"
          title="earth 风场"
          src="https://earth.nullschool.net/zh-cn/#current/wind/surface/level/orthographic=-246.27,22.84,9843/loc=114.382,22.588"
        ></iframe>
        <div class="page-layer">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </div>
      </div>
    </div>
  </n-config-provider>
</template>

<script setup>
import { darkTheme, NConfigProvider } from 'naive-ui'
import WdpViewer from './components/WdpViewer.vue'
import TopBar from './components/situation/TopBar.vue'
import { useSceneLayers } from './composables/useSceneLayers'

const { windLayer } = useSceneLayers()

const themeOverrides = {
  common: {
    primaryColor: '#76B900',
    primaryColorHover: '#A8FF25',
    primaryColorPressed: '#5C9400',
    primaryColorSuppl: '#22D7FF',
    borderRadius: '8px',
    popoverColor: 'rgba(7, 15, 13, 0.96)',
    cardColor: 'rgba(7, 15, 13, 0.96)',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '8px',
      }
    }
  },
  DatePicker: {
    itemBorderRadius: '8px',
    panelColor: 'rgba(7, 15, 13, 0.96)',
  },
  TimePicker: {
    panelColor: 'rgba(7, 15, 13, 0.96)',
  },
}

const naiveTheme = darkTheme
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 50% 0%, rgba(118, 185, 0, 0.16), transparent 34%),
    radial-gradient(circle at 92% 12%, rgba(34, 215, 255, 0.08), transparent 24%),
    linear-gradient(180deg, #010404, #06100e 45%, #020706);
}
.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.global-wdp {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.wind-earth-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  z-index: 1;
  background: #020708;
}
.page-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
</style>

<style>
.n-popover,
.n-select-menu,
.n-date-panel,
.n-time-panel {
  backdrop-filter: blur(12px);
}
</style>
