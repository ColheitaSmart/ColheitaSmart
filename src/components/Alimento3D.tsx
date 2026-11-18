import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Props = { alimento: string }

/** Modelos procedurais interativos; não requer GLB ou imagens. */
export default function Alimento3D({ alimento }: Props) {
  const area = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = area.current
    if (!container) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.12, 5.8)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5
    container.appendChild(renderer.domElement)
    const group = new THREE.Group()
    scene.add(group)
    scene.add(new THREE.HemisphereLight(0xffffff, 0x496947, 2.7))
    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(-3, 5, 6)
    scene.add(light)
    const fill = new THREE.DirectionalLight(0xc5f6a6, 1.6)
    fill.position.set(4, 0, -3)
    scene.add(fill)

    const mat = (color: number) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide })
    const add = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D = group) => {
      const mesh = new THREE.Mesh(geometry, material)
      parent.add(mesh)
      return mesh
    }
    const sphere = (color: number, x: number, y: number, z: number, sx: number, sy: number, sz: number) => {
      const mesh = add(new THREE.SphereGeometry(1, 36, 28), mat(color))
      mesh.position.set(x, y, z)
      mesh.scale.set(sx, sy, sz)
      return mesh
    }
    const tube = (points: THREE.Vector3[], radius: number, color: number, parent: THREE.Object3D = group) =>
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, radius, 12, false), mat(color), parent)

    // Folha com ponta, borda ondulada e nervura (em vez de esfera achatada).
    const leaf = (length: number, width: number, color: number) => {
      const vertices: number[] = []
      const indices: number[] = []
      const rows = 18, cols = 12
      for (let i = 0; i <= rows; i++) {
        const t = i / rows
        const w = width * Math.pow(Math.sin(Math.PI * t), 0.8)
        for (let j = 0; j <= cols; j++) {
          const u = j / cols * 2 - 1
          vertices.push(u * w * (1 + 0.08 * Math.sin(t * 20 + u * 7)), t * length,
            0.14 * Math.sin(Math.PI * t) + 0.15 * u * u * Math.sin(Math.PI * t))
          if (i < rows && j < cols) {
            const k = i * (cols + 1) + j
            indices.push(k, k + 1, k + cols + 1, k + 1, k + cols + 2, k + cols + 1)
          }
        }
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
      geo.setIndex(indices)
      geo.computeVertexNormals()
      const mesh = add(geo, mat(color))
      tube([new THREE.Vector3(0, 0, 0.015), new THREE.Vector3(0, length * 0.5, 0.17),
        new THREE.Vector3(0, length * 0.96, 0.025)], 0.012, 0x568b31, mesh)
      return mesh
    }

    if (alimento === 'Tomate') {
      sphere(0xe62f28, 0, -0.07, 0, 1.05, 0.98, 1)
      for (let i = 0; i < 7; i++) {
        const f = leaf(0.57, 0.12, i % 2 ? 0x347a2b : 0x458e32)
        f.position.y = 0.88
        f.rotation.order = 'YXZ'
        f.rotation.y = i * Math.PI * 2 / 7
        f.rotation.x = 1.15
      }
      tube([new THREE.Vector3(0, 0.9, 0), new THREE.Vector3(0.03, 1.13, 0),
        new THREE.Vector3(0.17, 1.22, 0)], 0.06, 0x48702b)
    } else if (alimento === 'Banana') {
      // Frutas curvas com pontas estreitas, não tubos de espessura constante.
      for (let b = 0; b < 3; b++) {
        const fruit = new THREE.Group()
        fruit.position.set((b - 1) * 0.22, 0, (b - 1) * -0.24)
        fruit.rotation.z = (b - 1) * 0.12
        group.add(fruit)
        const verts: number[] = [], inds: number[] = []
        const rings = 50, sides = 16
        for (let i = 0; i <= rings; i++) {
          const t = i / rings
          const a = -1.12 + 2.24 * t
          const cx = 1.12 * Math.sin(a), cy = 0.95 * Math.cos(a) - 0.45
          const r = 0.035 + 0.22 * Math.pow(Math.sin(Math.PI * t), 0.7)
          for (let j = 0; j <= sides; j++) {
            const p = j / sides * Math.PI * 2
            verts.push(cx + r * Math.cos(p) * Math.cos(a), cy - r * Math.cos(p) * Math.sin(a), r * Math.sin(p))
            if (i < rings && j < sides) {
              const k = i * (sides + 1) + j
              inds.push(k, k + sides + 1, k + 1, k + 1, k + sides + 1, k + sides + 2)
            }
          }
        }
        const geo = new THREE.BufferGeometry()
        geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
        geo.setIndex(inds)
        geo.computeVertexNormals()
        add(geo, mat(b === 1 ? 0xffd447 : 0xf6c83d), fruit)
      }
      group.rotation.z = -0.25
    } else if (alimento === 'Morango') {
      const verts: number[] = [], inds: number[] = []
      const rings = 36, sides = 48
      for (let i = 0; i <= rings; i++) {
        const t = i / rings
        const r = 0.86 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.8) * (1 - 0.2 * t)
        for (let j = 0; j <= sides; j++) {
          const p = j / sides * Math.PI * 2
          verts.push(r * Math.cos(p), 0.98 - 2.12 * t, r * Math.sin(p) * 0.93)
          if (i < rings && j < sides) {
            const k = i * (sides + 1) + j
            inds.push(k, k + 1, k + sides + 1, k + 1, k + sides + 2, k + sides + 1)
          }
        }
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
      geo.setIndex(inds)
      geo.computeVertexNormals()
      add(geo, mat(0xe92c35))
      const seedGeo = new THREE.SphereGeometry(0.025, 8, 6)
      const seedMat = mat(0xffd58a)
      for (let i = 2; i < 26; i++) {
        const t = i / 29
        const r = 0.86 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.75)), 0.8) * (1 - 0.2 * t)
        const count = Math.max(8, Math.round(r * 21))
        for (let j = 0; j < count; j++) {
          const p = (j + (i % 2) * 0.5) * Math.PI * 2 / count
          const seed = add(seedGeo, seedMat)
          seed.position.set(r * Math.cos(p) * 1.018, 0.98 - 2.12 * t, r * Math.sin(p) * 0.95)
          seed.scale.set(0.8, 1.4, 0.8)
        }
      }
      for (let i = 0; i < 7; i++) {
        const f = leaf(0.55, 0.16, 0x3d8b30)
        f.position.y = 0.95
        f.rotation.order = 'YXZ'
        f.rotation.y = i * Math.PI * 2 / 7
        f.rotation.x = 1.1
      }
    } else if (alimento === 'Alface') {
      sphere(0x8bc64c, 0, -0.28, 0, 0.43, 0.52, 0.43)
      // Três camadas de folhas reconhecíveis, abertas como uma cabeça de alface.
      for (let layer = 0; layer < 3; layer++) {
        const count = [10, 8, 6][layer]
        for (let i = 0; i < count; i++) {
          const a = i * Math.PI * 2 / count + layer * 0.35
          const f = leaf([1.55, 1.3, 1.05][layer], [0.46, 0.39, 0.33][layer],
            [0x6ab73e, 0x90d452, 0xb2e474][layer])
          f.position.set(Math.sin(a) * 0.16, -0.73 + layer * 0.05, Math.cos(a) * 0.16)
          f.rotation.order = 'YXZ'
          f.rotation.y = a
          f.rotation.x = [-0.5, -0.25, 0.08][layer]
        }
      }
      group.rotation.x = -0.12
    } else if (alimento === 'Manga') {
      const mango = sphere(0xf0a632, 0, -0.07, 0, 0.84, 1.12, 0.78)
      mango.rotation.z = 0.34
      const f = leaf(0.87, 0.23, 0x4a9632)
      f.position.set(0.16, 1.05, 0)
      f.rotation.z = -1.1
      tube([new THREE.Vector3(0.14, 1.01, 0), new THREE.Vector3(0.2, 1.23, 0)], 0.06, 0x74522e)
    } else {
      const potato = sphere(0xc29b62, 0, 0, 0, 1.14, 0.79, 0.88)
      potato.rotation.z = -0.17
      const eyeGeo = new THREE.SphereGeometry(0.027, 10, 8)
      const eyeMat = mat(0x85613e)
      for (let i = 0; i < 22; i++) {
        const theta = Math.acos(1 - 2 * (i + 0.5) / 22), phi = i * 2.399963
        const eye = add(eyeGeo, eyeMat)
        eye.position.set(1.15 * Math.sin(theta) * Math.cos(phi), 0.8 * Math.cos(theta),
          0.89 * Math.sin(theta) * Math.sin(phi))
      }
    }

    let dragging = false, lastX = 0, lastY = 0
    const canvas = renderer.domElement
    const down = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      canvas.setPointerCapture(e.pointerId)
      canvas.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (!dragging) return
      group.rotation.y += (e.clientX - lastX) * 0.01
      group.rotation.x = THREE.MathUtils.clamp(group.rotation.x + (e.clientY - lastY) * 0.006, -0.8, 0.8)
      lastX = e.clientX
      lastY = e.clientY
    }
    const up = () => { dragging = false; canvas.style.cursor = 'grab' }
    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    canvas.style.touchAction = 'none'
    canvas.style.cursor = 'grab'
    const resize = () => {
      const width = Math.max(container.clientWidth, 1), height = Math.max(container.clientHeight, 1)
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
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          geometries.add(obj.geometry)
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach(m => materials.add(m))
        }
      })
      geometries.forEach(g => g.dispose())
      materials.forEach(m => m.dispose())
      renderer.dispose()
      canvas.remove()
    }
  }, [alimento])

  return <div ref={area} role="img" aria-label={`Modelo 3D de ${alimento}. Arraste para girar.`}
    className="h-[290px] w-full sm:h-[350px]" />
}
