<script setup>
import { Head } from '@inertiajs/vue3';
import { computed, onMounted, ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const props = defineProps({
    project: Object,
});
console.log(props.project);

const canvasRef = ref(null);
const currentImage = ref(props.project.start_image);
let scene;
let camera;
let renderer;
let controls;
let sphere;
let hotspotSprites = [];

const allImages = computed(() => {
    return props.project.scenes.flatMap(s => s.images);
});

function initThreeJS() {
    if (!canvasRef.value) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 0.1);

    renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.value,
        antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.rotateSpeed = -0.5;
    controls.minDistance = 0.1;
    controls.maxDistance = 10;

    const geometry = new THREE.SphereGeometry(10, 60, 40);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial();
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    loadImage(currentImage.value);

    window.addEventListener('resize', onWindowResize);
    canvasRef.value.addEventListener('click', onCanvasClick);

    animate();
}

function loadImage(image) {
    currentImage.value = image;

    clearHotspots();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(`/images/${image.slug}/download`, (texture) => {
        sphere.material.map = texture;
        sphere.material.needsUpdate = true;

        createHotspots(image.hotspots);
    });
}

function createHotspots(hotspots) {
    hotspots.forEach(hotspot => {
        const spriteMaterial = new THREE.SpriteMaterial({
            color: 0xffffff,
            sizeAttenuation: false,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.03, 0.03, 1);

        const position = new THREE.Vector3(
            hotspot.position_x * 0.95,
            hotspot.position_y * 0.95,
            hotspot.position_z * 0.95
        );
        sprite.position.copy(position);

        sprite.hotspotData = hotspot;

        scene.add(sprite);
        hotspotSprites.push(sprite);
    });
}

function clearHotspots() {
    hotspotSprites.forEach(sprite => scene.remove(sprite));
    hotspotSprites = [];
}

function onCanvasClick(event) {
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(hotspotSprites);

    if (intersects.length > 0) {
        const hotspot = intersects[0].object.hotspotData;
        const targetImage = allImages.value.find(img => img.id === hotspot.target_image_id);

        if (targetImage) {
            loadImage(targetImage);
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

onMounted(() => {
    initThreeJS();
});
</script>

<template>
    <div class="relative w-screen h-screen overflow-hidden">

        <Head :title="project.name" />

        <canvas ref="canvasRef" class="w-full h-full" />

        <div class="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
            <h1 class="text-2xl font-bold mb-1">{{ project.name }}</h1>
            <p v-if="project.description" class="text-sm text-muted-foreground mb-2">
                {{ project.description }}
            </p>
            <p class="text-xs text-muted-foreground">
                Actuellement dans : {{ currentImage.name || "Sans nom" }}
            </p>
        </div>

        <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <p class="text-xs text-muted-foreground text-center">
                Cliquez sur les points blancs pour naviguer
            </p>
        </div>
    </div>
</template>