import * as THREE from 'three'
import { Buffer } from 'buffer'

export function parse(msg): THREE.Points {
  const buffer = Buffer.from(msg.data)
  const xyz_data = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(xyz_data, 3))
  const material = new THREE.PointsMaterial({ size: 0.1, color: 0xff0000 })
  const mesh = new THREE.Points(geometry, material)
  return mesh
}
