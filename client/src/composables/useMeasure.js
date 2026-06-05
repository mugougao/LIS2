import { useWdpEngine } from './useWdpEngine'

export function useMeasure() {
  const { getApp, isSceneReady } = useWdpEngine()

  async function startPolygonMeasure() {
    const App = getApp()
    if (!App || !isSceneReady.value) {
      console.warn('[Measure] 场景未就绪，无法启动测量')
      return null
    }

    return new Promise((resolve) => {
      App.Renderer.RegisterSceneEvent([{
        name: 'MeasureResult',
        func: (result) => {
          App.Tools.Measure.End()

          const rawPoints = result.result?.Points ?? []

          const ring = rawPoints.map(s => {
            const [lon, lat] = s.split(',').map(Number)
            return [lon, lat]
          })

          if (ring.length > 0) {
            const first = ring[0]
            const last = ring[ring.length - 1]
            if (first[0] !== last[0] || first[1] !== last[1]) {
              ring.push([first[0], first[1]])
            }
          }

          const geojson = ring.length >= 3 ? JSON.stringify({
            type: 'Polygon',
            coordinates: [ring]
          }, null, 2) : ''

          resolve(geojson)
        }
      }])
      App.Tools.Measure.Start()
    })
  }

  async function startPointPick() {
    const App = getApp()
    if (!App || !isSceneReady.value) {
      console.warn('[Measure] 场景未就绪，无法启动取点')
      return null
    }

    return new Promise((resolve) => {
      let resolved = false

      function onPickPointEvent(result) {
        if (resolved) return
        resolved = true
        App.Renderer.UnRegisterSceneEvent(['PickPointEvent'])

        let points = result.result.Points
        if (!points || points.length === 0) {
          App.Tools.PickerPoint.EndPickPoint()
          resolve(null)
          return
        }

        const p = points[0]
        const lonlat = typeof p === 'string' ? p.split(',').map(Number) : p
        App.Tools.PickerPoint.EndPickPoint()
        resolve({ lon: lonlat[0], lat: lonlat[1], alt: lonlat[2] ?? 0 })
      }

      App.Renderer.RegisterSceneEvent([{
        name: 'PickPointEvent',
        func: onPickPointEvent
      }])

      setTimeout(() => {
        if (!resolved) {
          resolved = true
          App.Renderer.UnRegisterSceneEvent(['PickPointEvent'])
          App.Tools.PickerPoint.EndPickPoint()
          resolve(null)
        }
      }, 30000)

      App.Tools.PickerPoint.StartPickPoint(true, true, 'ground')
    })
  }

  return { startPolygonMeasure, startPointPick }
}
