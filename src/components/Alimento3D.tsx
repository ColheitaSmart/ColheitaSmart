import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type Props = { alimento: string }

/** Modelos tridimensionais estilizados e interativos, gerados em tempo real (sem arquivos GLB). */
export default function Alimento3D({ alimento }: Props) {
  const area = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = area.current
    if (!container) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0.15, 5.5)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)
    const group = new THREE.Group()
    scene.add(group)
    scene.add(new THREE.AmbientLight(0xffffff, 2))
    const light = new THREE.DirectionalLight(0xffffff, 3)
    light.position.set(-3, 5, 6)
    scene.add(light)
    const fill = new THREE.DirectionalLight(0xb5ffb0, 1.5)
    fill.position.set(4, -2, -3)
    scene.add(fill)
    const mat = (color: number, roughness = .48) => new THREE.MeshStandardMaterial({ color, roughness, metalness: .02 })
    const add = (geometry: THREE.BufferGeometry, material: THREE.Material, x=0,y=0,z=0, parent=group) => {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x,y,z)
      parent.add(mesh)
      return mesh
    }
    const ball = (r:number, color:number, x=0,y=0,z=0) => add(new THREE.SphereGeometry(r,32,24),mat(color),x,y,z)
    const leaf = (x:number,y:number,z:number, angle:number, size=.65) => {
      const mesh = add(new THREE.SphereGeometry(1,20,12),mat(0x398b35),x,y,z)
      mesh.scale.set(.15*size,.55*size,.07*size)
      mesh.rotation.z=angle
      return mesh
    }
    if (alimento === 'Tomate') {
      const body=ball(1.05,0xe63a2e)
      body.scale.set(1.1,.94,1)
      add(new THREE.CylinderGeometry(.085,.1,.35,12),mat(0x356c28),0,1.12,0)
      for(let i=0;i<6;i++) leaf(Math.cos(i*Math.PI/3)*.3,.98,Math.sin(i*Math.PI/3)*.3,-i*Math.PI/3,.85)
    } else if (alimento === 'Banana') {
      for(let j=-1;j<=1;j++) {
        const curve=new THREE.CatmullRomCurve3([
          new THREE.Vector3(-.85+j*.2,-.65,j*.18),new THREE.Vector3(-.45+j*.2,-.05,j*.18),
          new THREE.Vector3(.1+j*.2,.42,j*.18),new THREE.Vector3(.75+j*.2,.55,j*.18),
        ])
        add(new THREE.TubeGeometry(curve,44,.21,10,false),mat(j===0?0xfbd447:0xf4c637))
        ball(.11,0x624928,.75+j*.2,.55,j*.18)
      }
      group.rotation.z=-.25
    } else if (alimento === 'Morango') {
      const berry=add(new THREE.SphereGeometry(1,40,30),mat(0xe92535),0,-.1)
      berry.scale.set(.85,1.1,.78)
      for(let i=0;i<7;i++) leaf(Math.cos(i*2*Math.PI/7)*.3,.9,Math.sin(i*2*Math.PI/7)*.3,i*2*Math.PI/7,.75)
      const seedMat=mat(0xffd58a)
      for(let i=0;i<12;i++) for(let j=0;j<15;j++) {
        const theta=(i+.5)/12*Math.PI, phi=j/15*2*Math.PI
        const x=.856*Math.sin(theta)*Math.cos(phi), y=-.1+1.11*Math.cos(theta),z=.786*Math.sin(theta)*Math.sin(phi)
        const seed=add(new THREE.SphereGeometry(.027,7,6),seedMat,x,y,z)
        seed.scale.set(.75,1.45,.65)
      }
    } else if (alimento === 'Alface') {
      ball(.72,0x79bf40)
      for(let i=0;i<15;i++) {
        const angle=i*2.39996, height=(i%5-2)*.21
        const mesh=ball(.48,i%3===0?0x64b83a:0x8bd34b,Math.cos(angle)*.54,height,Math.sin(angle)*.54)
        mesh.scale.set(.85,1.35,.42)
        mesh.rotation.z=angle*.3
      }
    } else if (alimento === 'Manga') {
      const mango=ball(1,0xeeb02e)
      mango.scale.set(.85,1.15,.72)
      mango.rotation.z=.4
      leaf(.2,1.12,0,-.9,1.1)
      add(new THREE.CylinderGeometry(.065,.07,.24,10),mat(0x68462a),0,1.14,0)
    } else {
      const potato=ball(1,0xb9945b)
      potato.scale.set(1.1,.78,.85)
      for(let i=0;i<12;i++) {
        const a=i*2.4,b=(i%4)*.45+.45
        ball(.035,0x73573d,Math.sin(b)*Math.cos(a)*1.1,Math.cos(b)*.78,Math.sin(b)*Math.sin(a)*.85)
      }
    }
    let dragging=false, lastX=0,lastY=0, rotationSpeed=.005
    const down=(e:PointerEvent)=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)}
    const move=(e:PointerEvent)=>{if(!dragging)return;group.rotation.y+=(e.clientX-lastX)*.01;group.rotation.x=THREE.MathUtils.clamp(group.rotation.x+(e.clientY-lastY)*.006,-.65,.65);lastX=e.clientX;lastY=e.clientY}
    const up=()=>{dragging=false}
    renderer.domElement.addEventListener('pointerdown',down)
    renderer.domElement.addEventListener('pointermove',move)
    renderer.domElement.addEventListener('pointerup',up)
    renderer.domElement.addEventListener('pointercancel',up)
    renderer.domElement.style.touchAction='none'
    renderer.domElement.style.cursor='grab'
    const resize=()=>{const w=container.clientWidth,h=container.clientHeight;camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
    const observer=new ResizeObserver(resize)
    observer.observe(container)
    resize()
    let frame=0
    const animate=()=>{frame=requestAnimationFrame(animate);if(!dragging)group.rotation.y+=rotationSpeed;renderer.render(scene,camera)}
    animate()
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const materials=Array.isArray(obj.material)?obj.material:[obj.material];materials.forEach(m=>m.dispose())}});renderer.dispose();renderer.domElement.remove()}
  },[alimento])
  return <div ref={area} role="img" aria-label={`Modelo 3D estilizado de ${alimento}. Arraste para girar.`} className="h-[290px] w-full sm:h-[350px]" />
}
