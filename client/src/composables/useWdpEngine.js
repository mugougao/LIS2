import { ref } from 'vue'
import WdpApi from 'wdpapi'

let _App = null
let _initPromise = null
const _sceneReady = ref(false)
const _loadingProgress = ref(0)

// 模块加载时即声明全局 App，避免未就绪时引用报 ReferenceError
if (typeof window !== 'undefined' && window.App === undefined) window.App = null
if (typeof globalThis !== 'undefined' && globalThis.App === undefined) globalThis.App = null

export function useWdpEngine() {
  return { getApp, init, isSceneReady: _sceneReady, loadingProgress: _loadingProgress }
}


function getApp() {
  return _App
}

function exposeAppGlobally(app) {
  if (typeof window !== 'undefined') window.App = app
  if (typeof globalThis !== 'undefined') globalThis.App = app
}

async function init(containerId, options = {}) {
  if (_initPromise) return _initPromise
  if (_App) return _App

  const { onSceneReady } = options

  const wdpUrl = import.meta.env.VITE_WDP_URL || ''
  const wdpOrder = import.meta.env.VITE_WDP_ORDER || ''

  if (!wdpUrl || !wdpOrder) {
    console.warn('[WdpEngine] 未配置 VITE_WDP_URL / VITE_WDP_ORDER，跳过初始化')
    _sceneReady.value = true
    _loadingProgress.value = 100
    return _App
  }

  _initPromise = new Promise((resolve, reject) => {
    const app = new WdpApi({
      id: containerId,
      url: wdpUrl,
      order: wdpOrder,
      debugMode: 'normal',
      keyboard: { normal: false, func: false }
    })

    app.Renderer.RegisterEvent([
      { name: 'onVideoReady', func: () => { } },
      { name: 'onStopedRenderCloud', func: () => { } }
    ])

    app.Renderer.RegisterSceneEvent([{
      name: 'OnWdpSceneIsReady',
      func: async (res) => {
        if (res.result && res.result.progress != null) {
          _loadingProgress.value = Math.round(res.result.progress)
          if (res.result.progress === 100) {
            _App = app
            exposeAppGlobally(app)
            _sceneReady.value = true
            if (onSceneReady) {
              await onSceneReady(_App)
            }
            resolve(_App)
          }
        }
      }
    }])

    app.Renderer.Start().catch((e) => {
      console.warn('[WdpEngine] 启动失败:', e.message)
      _App = app
      exposeAppGlobally(app)
      _sceneReady.value = true
      _loadingProgress.value = 100
      resolve(app)
    })
  })

  return _initPromise
}
