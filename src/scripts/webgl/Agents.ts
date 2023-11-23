import * as THREE from 'three'
import { PingpongFBO } from './FBO'
import { three } from './core/Three'
import vertexShader from './shader/quad.vs'
import fragmentShader from './shader/agents.fs'
import { gui } from './Gui'

export class Agents extends PingpongFBO {
  private mesh: THREE.Mesh<THREE.BufferGeometry, THREE.RawShaderMaterial>

  constructor(width: number, height: number) {
    super(width, height, Agents.createDatas(width, height))
    this.mesh = this.createMesh(width, height)
    this.setControls()
  }

  private static createDatas(width: number, height: number) {
    const count = width * height
    const datas = new Float32Array(count * 4)

    const hueSet = [0, 1 / 3, 2 / 3]

    for (let i = 0; i < count; i++) {
      const x = 0.002 * Math.sin(Math.random() * Math.PI * 2) + 0.5 + (Math.random() * 2.0 - 1.0) * 0.03
      const y = 0.002 * Math.cos(Math.random() * Math.PI * 2) + 0.5 + (Math.random() * 2.0 - 1.0) * 0.03 * three.size.aspect

      datas[i * 4 + 0] = x // pos x
      datas[i * 4 + 1] = y // pos y
      datas[i * 4 + 2] = Math.random() // angle
      datas[i * 4 + 3] = hueSet[i % 3] // 個体の識別パラメーター（表現用なので使ってもいいし使わなくてもいい）
    }

    return datas
  }

  private createMesh(width: number, height: number) {
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        tTrailMap: { value: null },
        tPrev: { value: null },
        uPx: { value: [1 / width, 1 / height] },
        uTime: { value: 0 },
        uSa: { value: 0.33 }, // センサーの開き(角度)
        uRa: { value: 0.1 }, // Agentの回転角
        uSo: { value: 6.7 }, // センサーの長さ
        uSs: { value: 0.4 }, // Agentの移動量
      },
      vertexShader,
      fragmentShader,
    })
    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)
    three.addDisposableObject(geometry, material)
    return mesh
  }

  private setControls() {
    const folder = gui.addFolder('Agents')
    folder.add(this.uniforms.uSa, 'value', 0.1, 1.0, 0.01).name('ditection angle')
    folder.add(this.uniforms.uRa, 'value', 0.1, 1.0, 0.01).name('rotation angle')
    folder.add(this.uniforms.uSo, 'value', 5, 20, 0.1).name('senser length')
    folder.add(this.uniforms.uSs, 'value', 0, 2, 0.01).name('movement')
  }

  get uniforms() {
    return this.mesh.material.uniforms
  }

  render() {
    this.swap()
    this.mesh.visible = true

    this.uniforms.tPrev.value = this.texture
    this.uniforms.uTime.value += three.time.delta

    super.render()
    this.mesh.visible = false
  }
}
