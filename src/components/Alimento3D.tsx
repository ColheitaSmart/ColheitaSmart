import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

type Props = { alimento: string }

/** Modelos GLB reais dos seis alimentos, com rotação por mouse e toque. */
export default function Alimento3D({ alimento }: Props) {
  const area = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = area.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.1, 5.8)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    container.appendChild(renderer.domElement)

    const group = new THREE.Group()
    scene.add(group)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x808080, 1.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(-3, 5, 6)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.65)
    fillLight.position.set(4, 1, -4)
    scene.add(fillLight)

    const message = document.createElement('div')
    message.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;color:#f0fdf4;font:500 14px system-ui;pointer-events:none;'
    container.style.position = 'relative'
    container.appendChild(message)
    let active = true

    const arquivos: Record<string, string> = {
      Tomate: 'tomate.glb',
      Banana: 'banana.glb',
      Alface: 'alface.glb',
      Morango: 'morango.glb',
      Manga: 'manga.glb',
      Batata: 'batata.glb',
    }
    const arquivo = arquivos[alimento]

    if (arquivo) {
      message.textContent = `Carregando ${alimento.toLowerCase()} em 3D...`
      new GLTFLoader().load(
        `/models/${arquivo}`, 
        gltf => {
          if (!active) return
          const model = gltf.scene
          // Preserve as texturas originais; não substitua materiais por cores sólidas.
          model.traverse(object => {
            if (!(object instanceof THREE.Mesh)) return
            const materials = Array.isArray(object.material) ? object.material : [object.material]
            materials.forEach(material => {
              if (!(material instanceof THREE.MeshStandardMaterial)) return
              // Folhas finas podem ter a face traseira invisível.
              if (alimento === 'Alface') material.side = THREE.DoubleSide
              if (material.map) {
                material.map.colorSpace = THREE.SRGBColorSpace
                material.map.needsUpdate = true
              }
              material.needsUpdate = true
            })
          })
          const bounds = new THREE.Box3().setFromObject(model)
          const size = bounds.getSize(new THREE.Vector3())
          const center = bounds.getCenter(new THREE.Vector3())
          const longest = Math.max(size.x, size.y, size.z)
          if (!Number.isFinite(longest) || longest <= 0) {
            message.textContent = 'Não foi possível exibir este modelo 3D.'
            return
          }
          model.position.sub(center)
          const normalized = new THREE.Group()
          normalized.add(model)
          normalized.scale.setScalar(2.45 / longest)
          group.add(normalized)
          message.textContent = ''
        },
        undefined,
        () => {
          if (active) message.textContent = `Não foi possível carregar ${arquivo}. Confira o arquivo em public/models.`
        }
      )
    } else {
      message.textContent = `Não há um modelo 3D configurado para ${alimento}.`
    }

    let dragging = false
    let lastX = 0
    let lastY = 0
    const canvas = renderer.domElement
    canvas.style.touchAction = 'none'
    canvas.style.cursor = 'grab'
    const down = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      canvas.setPointerCapture(event.pointerId)
      canvas.style.cursor = 'grabbing'
    }
    const move = (event: PointerEvent) => {
      if (!dragging) return
      group.rotation.y += (event.clientX - lastX) * 0.01
      group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + (event.clientY - lastY) * 0.006, -0.8, 0.8)
      lastX = event.clientX
      lastY = event.clientY
    }
    const up = () => {
      dragging = false
      canvas.style.cursor = 'grab'
    }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)

    const resize = () => {
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()

    let frame = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      if (!dragging) group.rotation.y += 0.004
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      active = false
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      group.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach(material => {
            if (!material) return
            Object.values(material).forEach(value => {
              if (value instanceof THREE.Texture) value.dispose()
            })
            material.dispose()
          })
        }
      })
      renderer.dispose()
      canvas.remove()
      message.remove()
    }
  }, [alimento])

  return (
    <div
      ref={area}
      role="img"
      aria-label={`Modelo 3D de ${alimento}. Arraste para girar.`}
      className="h-[290px] w-full sm:h-[350px]"
    />
  )
}
