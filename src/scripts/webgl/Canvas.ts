import * as THREE from 'three'
import { three } from './core/Three'
import vertexShader from './shader/quad.vs'
import screenFs from './shader/screen.fs'
import afterimageFs from './shader/afterimage.fs'
import { Trails } from './Trails'
import { Agents } from './Agents'
import { Entities } from './Entities'
import { gui } from './Gui'

export class Canvas {
  private trails!: Trails
  private agents!: Agents
  private entities!: Entities
  private screen!: THREE.Mesh<THREE.BufferGeometry, THREE.RawShaderMaterial>
  private afterimageFilter!: THREE.Mesh<THREE.BufferGeometry, THREE.RawShaderMaterial>

  private bgRT: {
    src1: THREE.WebGLRenderTarget
    src2: THREE.WebGLRenderTarget
    prev: THREE.WebGLRenderTarget
    current: THREE.WebGLRenderTarget
  }

  constructor(canvas: HTMLCanvasElement) {
    this.init(canvas)
    this.createFBO()
    const rt1 = this.createRenderTarget()
    const rt2 = this.createRenderTarget()
    this.bgRT = { src1: rt1, src2: rt2, prev: rt1, current: rt2 }

    this.afterimageFilter = this.createAfterimageFilter()
    this.screen = this.createScreen()

    this.addEvents()
    three.animation(this.anime)
  }

  private init(canvas: HTMLCanvasElement) {
    three.setup(canvas)
    three.scene.background = new THREE.Color('#000')
  }

  private createFBO() {
    const size = 256
    let widthSize, heightSize
    if (1 < three.size.aspect) {
      heightSize = size
      widthSize = Math.trunc(heightSize * three.size.aspect)
    } else {
      widthSize = size
      heightSize = Math.trunc(widthSize * (1 / three.size.aspect))
    }

    const { width, height } = three.size

    this.trails = new Trails(width, height)
    this.agents = new Agents(widthSize, heightSize)
    this.entities = new Entities(width, height, widthSize, heightSize)

    this.trails.uniforms.tEntityMap.value = this.entities.texture
    this.agents.uniforms.tTrailMap.value = this.trails.texture
    this.entities.uniforms.tAgentMap.value = this.agents.texture
  }

  private createRenderTarget() {
    const rt = new THREE.WebGLRenderTarget(three.size.width, three.size.height)
    return rt
  }

  private createScreen() {
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        tTrailMap: { value: this.trails.texture },
        uUvTransform: { value: three.coveredScale(this.trails.width / this.trails.height) },
      },
      vertexShader,
      fragmentShader: screenFs,
      transparent: true,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geometry, material)
    three.scene.add(mesh)
    mesh.renderOrder = 1

    return mesh
  }

  private createAfterimageFilter() {
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.RawShaderMaterial({
      uniforms: {
        tBackground: { value: null },
        uOpacity: { value: 0.99 },
      },
      vertexShader,
      fragmentShader: afterimageFs,
      transparent: true,
      depthTest: false,
    })
    const mesh = new THREE.Mesh(geometry, material)
    three.scene.add(mesh)
    mesh.renderOrder = 0

    const folder = gui.addFolder('screen')
    folder.add(material.uniforms.uOpacity, 'value', 0.9, 0.999, 0.001).name('afterimage')

    return mesh
  }

  private addEvents() {
    three.addEventListener('resize', () => {
      this.screen.material.uniforms.uUvTransform.value = three.coveredScale(this.trails.width / this.trails.height)
    })
  }

  private anime = () => {
    this.trails.render()
    this.agents.render()
    this.entities.render()

    // afterimage
    // swap background render target
    this.bgRT.current = this.bgRT.current === this.bgRT.src1 ? this.bgRT.src2 : this.bgRT.src1
    this.bgRT.prev = this.bgRT.current === this.bgRT.src1 ? this.bgRT.src2 : this.bgRT.src1
    // update background texture
    this.afterimageFilter.material.uniforms.tBackground.value = this.bgRT.prev.texture
    // draw to background render target
    three.renderer.setRenderTarget(this.bgRT.current)
    three.renderer.render(three.scene, three.camera)
    three.renderer.setRenderTarget(null)

    three.render()
  }

  dispose() {
    three.dispose()
  }
}
