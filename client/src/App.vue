<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <div class="app-shell">
      <TopBar v-model:scene-mode="sceneMode" />
      <div class="app-content">
        <WdpViewer class="global-wdp" />
        <div class="page-layer">
          <router-view v-slot="{ Component }">
            <component :is="Component" :scene-mode="sceneMode" />
          </router-view>
        </div>
      </div>
    </div>
  </n-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import { darkTheme, NConfigProvider } from 'naive-ui'
import WdpViewer from './components/WdpViewer.vue'
import TopBar from './components/situation/TopBar.vue'

const sceneMode = ref('3D')

const themeOverrides = {
  common: {
    primaryColor: '#17E18A',
    primaryColorHover: '#19F49A',
    primaryColorPressed: '#0FBB72',
    primaryColorSuppl: '#17E18A',
    borderRadius: '6px',
    popoverColor: 'rgba(5, 18, 20, 0.94)',
    cardColor: 'rgba(5, 18, 20, 0.94)',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '6px',
      }
    }
  },
  DatePicker: {
    itemBorderRadius: '6px',
    panelColor: 'rgba(5, 18, 20, 0.94)',
  },
  TimePicker: {
    panelColor: 'rgba(5, 18, 20, 0.94)',
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
    radial-gradient(circle at 50% 0%, rgba(18, 226, 139, 0.12), transparent 34%),
    linear-gradient(180deg, #020708, #061211 45%, #03090a);
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
.page-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
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
