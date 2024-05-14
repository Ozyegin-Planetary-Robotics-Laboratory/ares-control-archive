<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { onMounted, onUnmounted } from 'vue'
import { ObjectLoader } from 'three'

const three: {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls | null
  oloader: ObjectLoader
  objects: Record<string, THREE.Object3D>
} = {
  scene: new THREE.Scene(),
  camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
  renderer: new THREE.WebGLRenderer({
    antialias: true
  }),
  controls: null,
  oloader: new ObjectLoader(),
  objects: {}
}

const controls = new OrbitControls(three.camera, three.renderer.domElement)
three.controls = controls

const initScene = () => {
  three.scene.rotation.x = -Math.PI / 2
  const light1 = new THREE.DirectionalLight(0xffffff, 1)
  const light2 = new THREE.DirectionalLight(0x666666, 1)
  light1.position.set(7, 2, 10)
  light2.position.set(4, 3, -5)
  three.scene.add(light1)
  three.scene.add(light2)
  three.objects['light1'] = light2
  three.objects['light2'] = light2
  three.scene.add(new THREE.AmbientLight(0x666666))
  three.scene.background = new THREE.Color(0xaaaaaa)
}

const initCamera = () => {
  three.camera.position.set(0, 0, 5)
  three.camera.lookAt(0, 0, 0)
}

const initRenderer = () => {
  three.renderer.setSize(window.innerWidth, window.innerHeight)
  three.renderer.setClearColor(0x000000, 1)
}

const initControls = () => {
  three.controls.enableDamping = true
  three.controls.dampingFactor = 0.25
  three.controls.enableZoom = true
}

initScene()
initCamera()
initRenderer()
initControls()

const onResize = () => {
  three.camera.aspect = window.innerWidth / window.innerHeight
  three.camera.updateProjectionMatrix()
  three.renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', onResize)

onMounted(() => {
  const element = document.querySelector('#threejs-container')
  if (element) {
    element.appendChild(three.renderer.domElement)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  three.renderer.setAnimationLoop(null)
  for (const obj of Object.values(three.objects)) {
    if (obj.geometry) {
      obj.geometry.dispose()
      obj.material.dispose()
      three.scene.remove(obj)
    }
  }
  const element = document.querySelector('#threejs-container')
  if (element) {
    element.removeChild(three.renderer.domElement)
  }
})

three.renderer.setAnimationLoop(() => {
  three.controls.update()
  three.renderer.render(three.scene, three.camera)
})

window.electron.onCloud((data: unknown) => {
  const point_cloud = three.oloader.parse(data)
  if (three.objects['terrain']) {
    const obj = three.objects['terrain']
    if (obj.geometry) {
      obj.geometry.dispose()
      obj.material.dispose()
      three.scene.remove(obj)
    }
  }
  three.scene.add(point_cloud)
  three.objects['terrain'] = point_cloud
})
</script>

<template>
  <div id="threejs-container"></div>
</template>

<style scoped>
#threejs-container {
  padding: 0;
  margin: 0;
  position: absolute;
  height: 100%;
  width: 100%;
}
</style>
