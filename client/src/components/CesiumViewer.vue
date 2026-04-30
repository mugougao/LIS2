<template>
  <div ref="cesiumContainer" class="cesium-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as Cesium from 'cesium';
import { usePlansStore } from '../stores/plans';
import { useNoFlyStore } from '../stores/nofly';
import { useConflictStore } from '../stores/conflict';

const cesiumContainer = ref(null);
let viewer = null;
const plansStore = usePlansStore();
const noflyStore = useNoFlyStore();
const conflictStore = useConflictStore();

const operatorColors = {
  'op-a': Cesium.Color.fromCssColorString('#4fc3f7'),
  'op-b': Cesium.Color.fromCssColorString('#ff8a65'),
  'op-c': Cesium.Color.fromCssColorString('#81c784')
};

function getColor(operatorId) {
  return operatorColors[operatorId] || Cesium.Color.WHITE;
}

function parseWaypoints(wp) {
  if (!wp) return null;
  try {
    const parsed = typeof wp === 'string' ? JSON.parse(wp) : wp;
    if (parsed.coordinates) return parsed.coordinates;
    if (Array.isArray(parsed)) return parsed;
    return null;
  } catch { return null; }
}

function drawPlans() {
  if (!viewer) return;
  viewer.entities.values
    .filter(e => e._lisType === 'plan')
    .forEach(e => viewer.entities.remove(e));

  const plans = plansStore.plans;
  for (const plan of plans) {
    const coords = parseWaypoints(plan.waypoints);
    if (!coords || coords.length < 2) continue;

    const color = getColor(plan.operator_id);
    const positions = coords.map(([lon, lat, alt]) =>
      Cesium.Cartesian3.fromDegrees(lon, lat, alt || 100)
    );

    viewer.entities.add({
      _lisType: 'plan',
      name: plan.plan_name || plan.id,
      polyline: {
        positions,
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({ color }),
        clampToGround: false
      }
    });

    const startPos = Cesium.Cartesian3.fromDegrees(plan.start_lon, plan.start_lat, plan.start_alt);
    const endPos = Cesium.Cartesian3.fromDegrees(plan.end_lon, plan.end_lat, plan.end_alt);
    viewer.entities.add({
      _lisType: 'plan',
      position: startPos,
      point: { pixelSize: 8, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 1 },
      label: { text: plan.plan_name || plan.id.substring(0, 8), font: '12px sans-serif', fillColor: color, verticalOrigin: Cesium.VerticalOrigin.BOTTOM, pixelOffset: new Cesium.Cartesian2(0, -10) }
    });
    viewer.entities.add({
      _lisType: 'plan',
      position: endPos,
      point: { pixelSize: 6, color: color.withAlpha(0.6), outlineColor: Cesium.Color.WHITE, outlineWidth: 1 }
    });
  }
}

function drawNoFlyZones() {
  if (!viewer) return;
  viewer.entities.values
    .filter(e => e._lisType === 'nofly')
    .forEach(e => viewer.entities.remove(e));

  const zones = noflyStore.zones;
  for (const zone of zones) {
    try {
      const geom = typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry;
      if (!geom.coordinates || !geom.coordinates[0]) continue;

      const coords = geom.coordinates[0];
      const cartesians = coords.map(([lon, lat]) =>
        Cesium.Cartesian3.fromDegrees(lon, lat)
      );

      const minAlt = zone.min_alt || 0;
      const maxAlt = zone.max_alt || 500;

      viewer.entities.add({
        _lisType: 'nofly',
        name: zone.name || '禁飞区',
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(cartesians),
          material: Cesium.Color.RED.withAlpha(0.25),
          outline: true,
          outlineColor: Cesium.Color.RED,
          height: minAlt,
          extrudedHeight: maxAlt,
          heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
          extrudedHeightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
        },
        label: {
          text: zone.name || '禁飞区',
          font: '12px sans-serif',
          fillColor: Cesium.Color.RED,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
      });
    } catch (e) {
      console.warn('Failed to draw no-fly zone:', e);
    }
  }
}

function drawConflictPoints() {
  if (!viewer) return;
  viewer.entities.values
    .filter(e => e._lisType === 'conflict')
    .forEach(e => viewer.entities.remove(e));

  const conflicts = conflictStore.conflicts.filter(c => c.status !== 'resolved');
  for (const c of conflicts) {
    if (!c.conflict_point_lon) continue;
    const color = c.severity === 'high' ? Cesium.Color.RED :
      c.severity === 'medium' ? Cesium.Color.ORANGE : Cesium.Color.YELLOW;
    viewer.entities.add({
      _lisType: 'conflict',
      position: Cesium.Cartesian3.fromDegrees(c.conflict_point_lon, c.conflict_point_lat, c.conflict_alt || 100),
      point: { pixelSize: 12, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 1 },
      label: { text: `冲突:${c.id.substring(0, 6)}`, font: '11px sans-serif', fillColor: color, verticalOrigin: Cesium.VerticalOrigin.BOTTOM }
    });
  }
}

onMounted(async () => {
  Cesium.Ion.defaultAccessToken = undefined;

  const tdtKey = 'be777587a0a7598eb18dd5bf9da0114a';
  const textCredit = new Cesium.Credit('', true);

  const tdtBasicLayer = new Cesium.ImageryLayer(
    new Cesium.WebMapTileServiceImageryProvider({
      url: `http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tdtKey}`,
      layer: 'tdtBasicLayer',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
      credit: textCredit
    })
  );

  const tdtLabelLayer = new Cesium.ImageryLayer(
    new Cesium.WebMapTileServiceImageryProvider({
      url: `http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${tdtKey}`,
      layer: 'tdtAnnoLayer',
      style: 'default',
      format: 'image/jpeg',
      tileMatrixSetID: 'GoogleMapsCompatible',
      credit: textCredit
    })
  );

  viewer = new Cesium.Viewer(cesiumContainer.value, {
    baseLayerPicker: false,
    animation: false,
    timeline: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    selectionIndicator: false,
    infoBox: false
  });

  viewer.imageryLayers.add(tdtBasicLayer);
  viewer.imageryLayers.add(tdtLabelLayer);

  viewer.scene.globe.enableLighting = false;
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#0A0F0F');

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 50000),
    orientation: { heading: 0, pitch: -Math.PI / 4, roll: 0 }
  });

  drawPlans();
  drawNoFlyZones();
  drawConflictPoints();
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});

watch(() => plansStore.plans, () => drawPlans(), { deep: true });
watch(() => noflyStore.zones, () => drawNoFlyZones(), { deep: true });
watch(() => conflictStore.conflicts, () => drawConflictPoints(), { deep: true });
</script>

<style scoped>
.cesium-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
