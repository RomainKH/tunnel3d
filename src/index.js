// Import de tous les différents dossiers/fichiers 
import './css/style.styl'
import * as THREE from 'three'
import * as POSTPROCESSING from 'postprocessing'
import { PlaneBufferGeometry, PlaneGeometry, MeshPhongMaterial, MeshStandardMaterial } from 'three'
//import OrbitControls from 'three-orbitcontrols'

let keyboard = {}
const loader = new THREE.FontLoader(),
      arrayObjects = new Array()
/**
 * Sizes
 */
const sizes = {}
sizes.width = window.innerWidth
sizes.height = window.innerHeight
window.addEventListener('resize', () => {
    //Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    //update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    //update
    renderer.setSize(sizes.width, sizes.height)
})

/**
 * Cursor
 */
const cursor = new THREE.Vector2()
window.addEventListener('mousemove', (event) =>
{
    cursor.x = ( event.clientX / window.innerWidth ) * 2 - 1
    cursor.y = - ( event.clientY / window.innerHeight ) * 2 + 1
})

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height)

camera.position.set(0, 5, -6)
camera.lookAt(new THREE.Vector3(0, 5, 0))
scene.add(camera)

// player


// asteroid
function asteroid(posZ) {
    let asteroid = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.9, 0),
        new MeshStandardMaterial({color: 0xFFFF00})
    )
    asteroid.position.set(0, 5, 10)
    scene.add(asteroid)
    setInterval(() => {
        asteroid.position.z -= 4
        asteroid.rotation.x += 0.01
        asteroid.rotation.y += 0.08
    }, 20)
    let randomNb1 = (Math.random()*9)-4.5, randomNb2 = (Math.random()*9)
    asteroid.position.set(randomNb1, randomNb2, posZ)
    console.log(asteroid.position)
}
setInterval(() => {
    asteroid(130)
}, 5*200)
/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer()
renderer.setSize(sizes.width, sizes.height)
document.body.appendChild(renderer.domElement)
renderer.domElement.classList.add('three')

// Controls
//let controls = new THREE.OrbitControls(camera)
//controls.addEventListener('change', renderer)

// Generate Texture
var w = 32

var l = Math.pow(w, 2)
var data = new Uint8Array(l * 3)

for (var i = 0; i < l; i++) {
    let stride = i * 3;
    data[stride] = Math.random() * 90;//R
    data[stride + 1] = Math.random() * 256;//G
    data[stride + 2] = Math.random() * 10;//B
}

var dataTex = new THREE.DataTexture(data, w, w, THREE.RGBFormat, THREE.UnsignedByteType);

dataTex.magFilter = THREE.NearestFilter;
dataTex.needsUpdate = true;

var geometry = new THREE.PlaneBufferGeometry(1, 1);
var material = new THREE.MeshBasicMaterial({
  map: dataTex,
  side: THREE.DoubleSide
});
var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh)


/**
 * Shaders SAHHHH
 */
function vertexShader() {
    return `
        varying vec3 vUv; 

        void main() {
        vUv = position; 

        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewPosition; 
        }
    `
}
function fragmentShader() {
    return `
        uniform vec3 colorA; 
        uniform vec3 colorB; 
        varying vec3 vUv;

        void main() {
            gl_FragColor = vec4(mix(colorA, colorB, vUv.x), 1.0);
        }
    `
}
let uniforms = {
        colorB: {type: 'vec3', value: new THREE.Color(0xACB6E5)},
        colorA: {type: 'vec3', value: new THREE.Color(0x74ebd5)}
    }

let materialShader =  new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: fragmentShader(),
    vertexShader: vertexShader(),
    side: THREE.DoubleSide
})

// object
function createTube(whereBegin){
    let geometry = new THREE.BufferGeometry()
    let vertices = new Float32Array([
        // first face
        // first triangle
        0, 10, 0,
        0, 0, 0,
        10, 0, 0,
        // second triangle
        10, 10, 0,
        0, 10, 0,
        10, 0, 0,
        // seconde face
        // first triangle
        10, 10, 10,
        0, 10, 10,
        10, 0, 10,
        // second triangle
        0, 10, 10,
        0, 0, 10,
        10, 0, 10,
        // troisieme face
        // first triangle
        0, 10, 0,
        10, 10, 0,
        10, 10, 10,
        // second triangle
        10, 10, 10,
        0, 10, 10,
        0, 10, 0,
        // quatrieme face
        // first triangle
        0, 0, 0,
        10, 0, 0,
        10, 0, 10,
        // second triangle
        10, 0, 10,
        0, 0, 10,
        0, 0, 0,
    ])
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
    let triangle = new THREE.Mesh(
        geometry,
        materialShader
    )
    triangle.rotation.y = Math.PI / 2
    triangle.position.z = whereBegin
    triangle.position.y = 0
    triangle.position.x = -5
    setInterval(() => {
        triangle.position.z -= 1.8
    }, 20)
    scene.add(triangle)
    arrayObjects.push(triangle)
}
let wasTrue = false
document.querySelector('button').addEventListener('click', () => {
    if (wasTrue == false) {
        setInterval(() => {
            createTube(150)
        }, 15*20)
        wasTrue = true
    }
})

/**
 * Lights
*/

const ambientLight = new THREE.AmbientLight(0xedd84e, 2.8)
scene.add(ambientLight)

/**
 * Postprocessing
 */
let composer = new POSTPROCESSING.EffectComposer(renderer)
composer.addPass(new POSTPROCESSING.RenderPass(scene, camera))
const effectPass = new POSTPROCESSING.EffectPass(
    camera,
    new POSTPROCESSING.BloomEffect()
)
effectPass.renderToScreen = true
composer.addPass(effectPass)

/**
 * Loop Render
 */
const render = () =>
{
    let everyChild = scene.children

    // remove object when out of side
    for (const child of everyChild) {
        if (child.position.z < -2) {
            scene.remove(child)
        }
    }
	if(keyboard[81]){ // Q key
        // Redirect motion by 90 degrees
        if (camera.position.x < 3) {
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * 0.2
        }
	}
    if(keyboard[68]){ // D key
        if (camera.position.x > -3) {
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * 0.2
        }
    }
    // Update camera
    window.requestAnimationFrame(render)

    // Render
    composer.render( scene, camera )

}

function keyDown(event){
	keyboard[event.keyCode] = true
}

function keyUp(event){
	keyboard[event.keyCode] = false
}

window.addEventListener('keydown', keyDown)
window.addEventListener('keyup', keyUp)

// btn 
const three = document.querySelector('.three')
const btn = document.querySelector('button')
btn.addEventListener('click', () => {
    btn.style.opacity = 0
    setTimeout(() => {
        btn.remove()
    }, 200)
})

//smooth display three js after page is loaded
window.addEventListener('load', () => {
    three.style.opacity = 1
    three.style.zIndex = 0
    render()
    setTimeout(() => {
        three.style.transition = '.3s ease-out'
    }, 1)
})

