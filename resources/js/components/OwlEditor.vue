<template>
    <div>
        <div ref="renderView" class="w-full h-full min-h-96"></div>
    </div>
</template>
<script setup>
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { onMounted, reactive, shallowRef, ref, toRaw } from "vue";

const renderView = ref(null);
const scene = shallowRef(null);
const camera = shallowRef(null);
const renderer = shallowRef(null);
const geometry = shallowRef(null);
const textureLoader = shallowRef(null);
const controls = shallowRef(null);
const currentMesh = shallowRef(null);
const count = shallowRef(1);

const setNext = () => {
    count.value += 1;
    setPanorama(`/pano/pano${count.value}.jpeg`);
};

const setPrev = () => {
    count.value -= 1;
    setPanorama(`/pano/pano${count.value}.jpeg`);
};
const setPanorama = async (panorama) => {
    if (currentMesh.value) scene.value.remove(currentMesh.value);
    const texture = textureLoader.value.loadAsync(panorama);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.value.add(mesh);
    currentMesh.value = mesh;
};
const animate = () => {2
    controls.value.update();
    renderer.value.render(toRaw(scene), toRaw(camera));
};
const onResize = (width, height) => {
    camera.value.aspect = width / height;
    camera.value.updateProjectionMatrix();
    renderer.value.setSize(width, height);
};
const onMouseClick = (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.value.children, true);

    if (intersects.length > 0) {
        const intersection = intersects[0];
        console.log('Sphere intersection:', cartesianToSpherical(intersection.point));
        console.log('Hit point:', intersection.point);
        console.log('Object:', intersection.object);
        console.log('Face:', intersection.face);
        console.log('UV:', intersection.uv);

        const hotspotTexture = textureLoader.value.load('/door-open.png');
        // const spriteMaterial = new THREE.SpriteMaterial({
        //     map: spriteMap,
        //     sizeAttenuation: false // Constant size regardless of distance
        // });
        const geometry = new THREE.PlaneGeometry(20, 20);
        const material = new THREE.MeshBasicMaterial({
            map: hotspotTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false
        });
        const hotspot = new THREE.Mesh(geometry, material);

        // Position it
        hotspot.position.set(intersection.point.x * 0.95, intersection.point.y * 0.95, intersection.point.z * 0.95);

        // Make it face the camera
        hotspot.lookAt(camera.value.position);
        hotspot.scale.set(5, 5, 0.1);
        scene.value.add(hotspot);

    }
}

const cartesianToSpherical = (point) => {
    const radius = point.length();
    const theta = Math.atan2(point.x, point.z);
    const phi = Math.acos(point.y / radius);
    return { theta, phi, radius };
}

onMounted(() => {
    scene.value = new THREE.Scene();
    scene.value.background = new THREE.Color(0xFFAA);
    console.log(renderView);
    camera.value = new THREE.PerspectiveCamera(
        75,
        renderView.value.innerWidth / renderView.value.innerHeight,
        1,
        1500
    );
    camera.value.position.set(0, 0, 0.1);
    renderer.value = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        depth: true,
        powerPshallowReference: 'high-performance'
    });
    renderer.value.shadowMap.enabled = true;
    renderer.value.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.value.outputColorSpace = THREE.SRGBColorSpace;
    renderer.value.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.value.toneMappingExposure = 1.0;
    renderer.value.setSize(window.innerWidth, window.innerHeight);

    geometry.value = new THREE.SphereGeometry(
        1500,        // radius
        60,         // widthSegments (higher = smoother)
        40,         // heightSegments
        0,          // phiStart
        Math.PI * 2, // phiLength
        0,          // thetaStart
        Math.PI     // thetaLength
    );

    geometry.value.scale(-1, 1, 1);

    textureLoader.value = new THREE.TextureLoader();
    renderView.value.appendChild(renderer.value.domElement);

    controls.value = new OrbitControls(toRaw(camera.value), renderer.value.domElement);
    controls.value.enableDamping = true;
    controls.value.dampingFactor = 0.05;
    controls.value.enableZoom = true;
    controls.value.enablePan = false;
    controls.value.rotateSpeed = -0.5;

    setPanorama(`/pano/pano2.jpeg`);

    renderer.value.setAnimationLoop(animate);
    window.addEventListener("resize", onResize);
});
</script>