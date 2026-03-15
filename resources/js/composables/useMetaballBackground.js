import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { useTheme } from '@/composables/useTheme'

// ── OKLch → sRGB conversion ──────────────────────────────────────────────────

function oklchToSrgb(L, C, h) {
  const hRad = (h * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  const gamma = (x) => (x >= 0.0031308 ? 1.055 * Math.pow(x, 1 / 2.4) - 0.055 : 12.92 * x)
  return [
    Math.max(0, Math.min(1, gamma(r))),
    Math.max(0, Math.min(1, gamma(g))),
    Math.max(0, Math.min(1, gamma(bl))),
  ]
}

// ── Palette generation ───────────────────────────────────────────────────────

function buildPalette(primaryHue, secondaryHue, isDark) {
  const pH = primaryHue
  const sH = secondaryHue
  const blend = (a, b, t) => a + (b - a) * t

  if (isDark) {
    return [
      oklchToSrgb(0.96, 0.04, pH),
      oklchToSrgb(0.88, 0.14, pH),
      oklchToSrgb(0.78, 0.16, blend(pH, sH, 0.3)),
      oklchToSrgb(0.68, 0.17, blend(pH, sH, 0.5)),
      oklchToSrgb(0.58, 0.16, blend(pH, sH, 0.7)),
      oklchToSrgb(0.48, 0.14, sH),
      oklchToSrgb(0.38, 0.12, sH + 10),
      oklchToSrgb(0.30, 0.10, sH + 20),
    ]
  }

  // Light mode: invert primary/secondary, white highlight
  return [
    [1.0, 1.0, 1.0],
    oklchToSrgb(0.90, 0.08, sH),
    oklchToSrgb(0.82, 0.10, blend(sH, pH, 0.3)),
    oklchToSrgb(0.74, 0.12, blend(sH, pH, 0.5)),
    oklchToSrgb(0.66, 0.10, blend(sH, pH, 0.7)),
    oklchToSrgb(0.56, 0.08, pH),
    oklchToSrgb(0.46, 0.06, pH + 10),
    oklchToSrgb(0.38, 0.05, pH + 20),
  ]
}

function buildBgColor(primaryHue, secondaryHue, isDark) {
  if (isDark) return oklchToSrgb(0.14, 0.01, primaryHue)
  return oklchToSrgb(0.97, 0.01, secondaryHue)
}

function buildSpecTint(primaryHue, secondaryHue, isDark) {
  if (isDark) return oklchToSrgb(0.95, 0.04, primaryHue)
  return [1.0, 1.0, 1.0]
}

// ── Ball physics ─────────────────────────────────────────────────────────────

function fract(x) { return x - Math.floor(x) }
function hashF(n) { return fract(Math.sin(n * 127.1) * 43758.5453) }

function calcBallRadius(b, rmin, rmax) {
  const sr = b.h1 * 0.8 + b.h2 * 0.2
  if (sr < 0.15) return rmax * 0.65 + b.h1 * rmax * 0.35
  if (sr < 0.35) return rmax * 0.45 + b.h2 * rmax * 0.2
  if (sr < 0.65) return rmin + b.h3 * (rmax * 0.35 - rmin)
  if (sr < 0.85) return rmin + b.h1 * (rmax * 0.25 - rmin)
  return rmin + b.h2 * rmin * 0.5
}

function initBalls(count, rmin, rmax, drift) {
  const balls = []
  for (let i = 0; i < count; i++) {
    const h1 = hashF(i * 1.37 + 0.31)
    const h2 = hashF(i * 2.73 + 1.51)
    const h3 = hashF(i * 4.17 + 2.93)
    const eg = i % 4
    let bx, by
    const pull = 0.01 + h1 * 0.07

    if (eg === 0) { bx = pull; by = h2 }
    else if (eg === 1) { bx = 1 - pull; by = h2 }
    else if (eg === 2) { bx = h2; by = 1 - pull }
    else { bx = h2; by = pull }

    if (i >= count - 4) {
      const ci = i - (count - 4)
      const cp = 0.03 + h3 * 0.05
      bx = (ci % 2 === 0) ? cp : 1 - cp
      by = (ci < 2) ? cp : 1 - cp
    }

    const ball = { homeX: bx, homeY: by, x: bx, y: by, vx: 0, vy: 0, r: 0, h1, h2, h3, phase: i * 0.75, speed: drift + h1 * drift * 1.8, edgeGroup: eg }
    ball.r = calcBallRadius(ball, rmin, rmax)
    balls.push(ball)
  }
  return balls
}

function updateBalls(balls, time, mx, my, mvx, mvy, c) {
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i]
    const t = time * b.speed + b.phase
    const ed = Math.sin(t * 0.5 + b.h3 * 6.28) * 0.18
    const wobble = Math.sin(t * 0.8 + b.h2 * 6.28) * (0.02 + b.h3 * 0.05)

    let hx = b.homeX, hy = b.homeY
    if (b.edgeGroup === 0) { hx += wobble; hy = b.homeY + ed }
    else if (b.edgeGroup === 1) { hx -= wobble; hy = b.homeY + ed }
    else if (b.edgeGroup === 2) { hx = b.homeX + ed; hy -= wobble }
    else { hx = b.homeX + ed; hy += wobble }

    if (i >= balls.length - 4) {
      hx = b.homeX + Math.sin(t * 0.6) * 0.04
      hy = b.homeY + Math.cos(t * 0.5) * 0.04
    }
    hx = Math.max(-0.15, Math.min(1.15, hx))
    hy = Math.max(-0.15, Math.min(1.15, hy))

    let fx = (hx - b.x) * c.spring
    let fy = (hy - b.y) * c.spring

    const dx = b.x - mx, dy = b.y - my
    const dist = Math.sqrt(dx * dx + dy * dy)
    const cr = b.r * c.contact
    if (dist < cr && dist > 0.001) {
      const pen = 1 - dist / cr
      const ms = Math.sqrt(mvx * mvx + mvy * mvy)
      const fb = 1 + ms * c.flick
      const nx = dx / dist, ny = dy / dist
      fx += nx * pen * c.repulse * fb
      fy += ny * pen * c.repulse * fb
      fx += mvx * 2 * pen
      fy += mvy * 2 * pen
    }

    const mass = 1 + b.r * 15
    b.vx += (fx / mass) / 60
    b.vy += (fy / mass) / 60
    b.vx *= c.damp
    b.vy *= c.damp
    b.x += b.vx
    b.y += b.vy
    if (b.x < -0.1) { b.x = -0.1; b.vx *= -0.3 }
    if (b.x > 1.1) { b.x = 1.1; b.vx *= -0.3 }
    if (b.y < -0.1) { b.y = -0.1; b.vy *= -0.3 }
    if (b.y > 1.1) { b.y = 1.1; b.vy *= -0.3 }
  }
}

// ── Shaders ──────────────────────────────────────────────────────────────────

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`

function buildFragmentShader(ballCount, enableShadow) {
  return `
    precision highp float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec3 u_balls[${ballCount}];
    uniform float u_merge;
    uniform float u_sharp;
    uniform float u_normalStr;
    uniform float u_sat;
    uniform float u_specInt;
    uniform float u_fresnelInt;
    uniform vec3 u_palette[8];
    uniform vec3 u_bgColor;
    uniform vec3 u_specTint;
    uniform int u_ballCount;
    uniform float u_vignette;
    uniform float u_noise;

    #define PI 3.14159265
    #define N ${ballCount}

    float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash2(i), hash2(i + vec2(1, 0)), f.x),
        mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
    }

    float fbm(vec2 p){
      return noise(p) * 0.5 + noise(p * 2.03) * 0.25 + noise(p * 4.01) * 0.125 + noise(p * 8.05) * 0.0625;
    }

    float gField(vec2 p, vec2 c, float r){
      vec2 d = p - c; float fr = r * u_merge;
      return exp(-dot(d, d) / (fr * fr));
    }

    vec2 gGrad(vec2 p, vec2 c, float r){
      vec2 d = p - c; float fr = r * u_merge; float r2 = fr * fr;
      return -2.0 * d / r2 * exp(-dot(d, d) / r2);
    }

    vec3 chromeColor(float field, float threshold, vec2 gd, vec2 sp, float t, vec2 ms){
      float raw = clamp((field - threshold) / (3.0 - threshold), 0.0, 1.0);
      float ring = pow(raw, 0.4);
      float rim = 1.0 - ring;

      float ang = atan(gd.y, gd.x);
      float an = ang / PI * 0.5 + 0.5;
      float cs = sp.x * 0.45 + sp.y * 0.3 + an * 0.5 + ms.x * 0.3;

      float n1 = fbm(vec2(cs * 3.5, t * 0.14));
      float n2 = fbm(vec2(cs * 2.8 + 10.0, t * 0.11));
      float n3 = fbm(vec2(cs * 3.1 + 20.0, t * 0.13));
      float n4 = fbm(vec2(cs * 2.6 + 30.0, t * 0.10));

      vec3 cWW = u_palette[0], cBY = u_palette[1], cG = u_palette[2], cA = u_palette[3];
      vec3 cO = u_palette[4], cDO = u_palette[5], cR = u_palette[6], cCr = u_palette[7];

      float w0 = exp(-pow(rim * 5.0, 2.0));
      vec3 c0 = mix(cWW, cBY, 0.15); c0 = mix(c0, cG, n1 * 0.1);

      float w1 = exp(-pow((rim - 0.28) * 6.5, 2.0));
      vec3 c1 = mix(cBY, cG, n2); c1 = mix(c1, cA, n3 * 0.3);

      float w2 = exp(-pow((rim - 0.50) * 6.5, 2.0));
      vec3 c2 = mix(cA, cO, n3); c2 = mix(c2, cDO, n1 * 0.3);

      float w3 = exp(-pow((rim - 0.72) * 6.5, 2.0));
      vec3 c3 = mix(cDO, cR, n4); c3 = mix(c3, cO, n2 * 0.2);

      float w4 = exp(-pow((rim - 0.93) * 5.5, 2.0));
      vec3 c4 = mix(cR, cCr, n1 * 0.6); c4 = mix(c4, cDO, n3 * 0.15);

      vec3 col = (c0 * w0 + c1 * w1 + c2 * w2 + c3 * w3 + c4 * w4) / (w0 + w1 + w2 + w3 + w4 + 0.001);

      float br = 0.48 + w0 * 0.42 + w1 * 0.15 + w4 * 0.20;
      col = col * br * 1.5;
      col += cWW * exp(-pow((rim - 0.22) * 16.0, 2.0)) * 0.12;
      col += mix(cWW, cBY, 0.5) * exp(-pow((rim - 0.55) * 18.0, 2.0)) * 0.08;

      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(vec3(lum), col, u_sat + rim * 0.8);
      col = max(col, cCr * 0.4);
      return col;
    }

    vec3 calcSpec(vec3 n, vec2 ms){
      vec3 V = vec3(0, 0, 1), ts = vec3(0);
      vec3 st = u_specTint;

      vec3 H1 = normalize(normalize(vec3(.4 + ms.x * .5, .6 + ms.y * .4, .8)) + V);
      ts += st * pow(max(dot(n, H1), 0.0), 300.0) * u_specInt;
      ts += st * 0.85 * pow(max(dot(n, H1), 0.0), 40.0) * u_specInt * 0.05;

      vec3 H2 = normalize(normalize(vec3(-.5 + ms.x * .3, .4 + ms.y * .2, .7)) + V);
      ts += st * pow(max(dot(n, H2), 0.0), 200.0) * u_specInt * 0.6;
      ts += st * 0.85 * pow(max(dot(n, H2), 0.0), 30.0) * u_specInt * 0.03;

      vec3 H3 = normalize(normalize(vec3(.1 - ms.x * .2, -.6 - ms.y * .3, .5)) + V);
      ts += st * 0.8 * pow(max(dot(n, H3), 0.0), 150.0) * u_specInt * 0.4;

      vec3 H4 = normalize(normalize(vec3(ms.x * 1.5, ms.y * 1.2, .6)) + V);
      ts += st * pow(max(dot(n, H4), 0.0), 250.0) * u_specInt * 0.67;

      float f = pow(1.0 - max(dot(n, V), 0.0), 4.0);
      ts += st * 0.8 * f * u_fresnelInt;
      return ts;
    }

    void main(){
      float aspect = u_res.x / u_res.y;
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p = uv; p.x *= aspect;

      float tf = 0.0; vec2 tg = vec2(0);
      for(int i = 0; i < N; i++){
        if(i >= u_ballCount) break;
        vec2 c = u_balls[i].xy; float r = u_balls[i].z;
        tf += gField(p, c, r);
        tg += gGrad(p, c, r);
      }

      float thr = 1.0;
      float edge = smoothstep(thr - u_sharp, thr + u_sharp * 0.125, tf);

      vec2 ng = vec2(
        noise(p * 22.0 + u_time * 0.3) - 0.5,
        noise(p * 22.0 + vec2(7.7, 3.3) + u_time * 0.2) - 0.5
      ) * u_noise;

      vec2 g = tg + ng;
      float gm = length(g);
      vec2 gd = gm > 0.001 ? g / gm : vec2(0, 1);
      vec3 normal = normalize(vec3(gd * u_normalStr, 1.0));

      vec2 ms = (u_mouse - 0.5) * 0.3;
      vec3 mc = chromeColor(tf, thr, gd, p, u_time, ms);
      mc += calcSpec(normal, ms);

      float ao = smoothstep(thr - u_sharp, thr + 1.0, tf);
      mc *= 0.42 + ao * 0.58;
      mc *= 1.0 - (1.0 - smoothstep(thr, thr + 0.4, tf)) * 0.08;

      ${enableShadow ? `
      float sf = 0.0;
      for(int i = 0; i < N; i++){
        if(i >= u_ballCount) break;
        vec2 c = u_balls[i].xy; float r = u_balls[i].z;
        sf += gField(p - vec2(.008, -.01), c, r * 1.08);
      }
      float shadow = smoothstep(thr - 0.3, thr, sf) * 0.3;
      ` : `
      float shadow = 0.0;
      `}

      vec3 bg = u_bgColor + vec3(0.012, 0.008, 0.004) * (1.0 - uv.y);
      vec3 ws = mix(bg, bg * 0.3, shadow * (1.0 - edge));
      vec3 color = mix(ws, mc, edge);
      color *= 1.0 - length((uv - 0.5) * 1.2) * u_vignette;

      gl_FragColor = vec4(color, 1.0);
    }
  `
}

// ── Performance detection ────────────────────────────────────────────────────

function detectTier() {
  if (typeof window === 'undefined') return 'none'
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return 'none'

  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  if (!gl) return 'none'

  const isMobile = window.innerWidth < 768
  if (isMobile) return 'low'

  const cores = navigator.hardwareConcurrency || 2
  return cores >= 4 ? 'high' : 'medium'
}

const TIER_CONFIG = {
  high:   { maxBalls: 32, pixelRatio: 1.5, shadow: true },
  medium: { maxBalls: 24, pixelRatio: 1.0, shadow: true },
  low:    { maxBalls: 16, pixelRatio: 0.75, shadow: false },
  none:   { maxBalls: 0, pixelRatio: 0, shadow: false },
}

// ── Composable ───────────────────────────────────────────────────────────────

export function useMetaballBackground(canvasRef) {
  const isSupported = ref(false)
  const {
    primaryHue, secondaryHue, isDark,
    bubblesEnabled, bubblesRepulse, bubblesDrift, bubblesMerge,
    bubblesSat, bubblesSpec, bubblesFresnel, bubblesSize,
    bubblesFlick, bubblesSpring, bubblesDamp, bubblesContact,
    bubblesSharp, bubblesNormal, bubblesRmin,
    bubblesVignette, bubblesBallCount, bubblesNoise, bubblesParallax,
  } = useTheme()

  let renderer = null
  let scene = null
  let camera = null
  let material = null
  let geometry = null
  let balls = []
  let ballUniformArray = []
  let uniforms = null
  let animationId = null
  let clock = null
  let paused = false
  let tierConfig = null

  // Mouse state
  let rawMX = 0.5, rawMY = 0.5, smMX = 0.5, smMY = 0.5
  let prevMX = 0.5, prevMY = 0.5, mvx = 0, mvy = 0

  function onMouseMove(e) {
    rawMX = e.clientX / window.innerWidth
    rawMY = 1 - e.clientY / window.innerHeight
  }

  function onVisibilityChange() {
    if (document.hidden) {
      paused = true
    } else {
      paused = false
      if (clock) clock.start()
    }
  }

  function onResize() {
    if (!renderer) return
    const w = window.innerWidth, h = window.innerHeight
    renderer.setSize(w, h)
    if (uniforms) {
      uniforms.u_res.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio())
    }
  }

  function applyThemeColors() {
    if (!uniforms) return
    const palette = buildPalette(primaryHue.value, secondaryHue.value, isDark.value)
    for (let i = 0; i < 8; i++) {
      uniforms.u_palette.value[i].set(palette[i][0], palette[i][1], palette[i][2])
    }
    const bg = buildBgColor(primaryHue.value, secondaryHue.value, isDark.value)
    uniforms.u_bgColor.value.set(bg[0], bg[1], bg[2])
    const st = buildSpecTint(primaryHue.value, secondaryHue.value, isDark.value)
    uniforms.u_specTint.value.set(st[0], st[1], st[2])
  }

  function getEffectiveBallCount() {
    if (!tierConfig) return 32
    return Math.min(bubblesBallCount.value, tierConfig.maxBalls)
  }

  function init() {
    const tier = detectTier()
    tierConfig = TIER_CONFIG[tier]

    if (tier === 'none' || !canvasRef.value) return

    isSupported.value = true

    const canvas = canvasRef.value
    const bc = Math.min(bubblesBallCount.value, tierConfig.maxBalls)

    // Init balls (always allocate maxBalls for the uniform array, use u_ballCount to control active count)
    const maxBc = tierConfig.maxBalls
    balls = initBalls(maxBc, bubblesRmin.value, bubblesSize.value, bubblesDrift.value)
    ballUniformArray = []
    for (let i = 0; i < maxBc; i++) {
      ballUniformArray.push(new THREE.Vector3(0, 0, 0))
    }

    // Palette uniform array
    const paletteArray = []
    for (let i = 0; i < 8; i++) {
      paletteArray.push(new THREE.Vector3(0, 0, 0))
    }

    // Uniforms
    uniforms = {
      u_res:        { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_time:       { value: 0.0 },
      u_mouse:      { value: new THREE.Vector2(0.5, 0.5) },
      u_balls:      { value: ballUniformArray },
      u_merge:      { value: bubblesMerge.value },
      u_sharp:      { value: bubblesSharp.value },
      u_normalStr:  { value: bubblesNormal.value },
      u_sat:        { value: bubblesSat.value },
      u_specInt:    { value: bubblesSpec.value },
      u_fresnelInt: { value: bubblesFresnel.value },
      u_palette:    { value: paletteArray },
      u_bgColor:    { value: new THREE.Vector3(0.07, 0.06, 0.05) },
      u_specTint:   { value: new THREE.Vector3(1, 0.96, 0.9) },
      u_ballCount:  { value: bc },
      u_vignette:   { value: bubblesVignette.value },
      u_noise:      { value: bubblesNoise.value },
    }

    // Apply initial theme colors
    applyThemeColors()

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tierConfig.pixelRatio))
    renderer.setSize(window.innerWidth, window.innerHeight)

    // Camera & scene
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    scene = new THREE.Scene()

    // Shader material
    const fragmentShader = buildFragmentShader(maxBc, tierConfig.shadow)
    geometry = new THREE.PlaneGeometry(2, 2)
    material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Resolution
    uniforms.u_res.value.set(
      window.innerWidth * renderer.getPixelRatio(),
      window.innerHeight * renderer.getPixelRatio(),
    )

    // Events
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('resize', onResize)

    // Start animation
    clock = new THREE.Clock()
    animate()
  }

  function animate() {
    animationId = requestAnimationFrame(animate)
    if (paused || !renderer) return

    const elapsed = clock.getElapsedTime()

    // Smooth mouse
    smMX += (rawMX - smMX) * 0.15
    smMY += (rawMY - smMY) * 0.15
    mvx = smMX - prevMX
    mvy = smMY - prevMY
    prevMX = smMX
    prevMY = smMY

    // Build physics config from all reactive theme values
    const c = {
      repulse: bubblesRepulse.value,
      flick: bubblesFlick.value,
      spring: bubblesSpring.value,
      damp: bubblesDamp.value,
      contact: bubblesContact.value,
    }

    // Update physics
    updateBalls(balls, elapsed, smMX, smMY, mvx, mvy, c)

    // Update all shader uniforms from reactive config
    uniforms.u_merge.value = bubblesMerge.value
    uniforms.u_sharp.value = bubblesSharp.value
    uniforms.u_normalStr.value = bubblesNormal.value
    uniforms.u_sat.value = bubblesSat.value
    uniforms.u_specInt.value = bubblesSpec.value
    uniforms.u_fresnelInt.value = bubblesFresnel.value
    uniforms.u_vignette.value = bubblesVignette.value
    uniforms.u_noise.value = bubblesNoise.value
    uniforms.u_ballCount.value = getEffectiveBallCount()

    // Pack ball data into uniforms
    const aspect = window.innerWidth / window.innerHeight
    const scrollOff = window.scrollY * bubblesParallax.value
    const activeBalls = getEffectiveBallCount()
    for (let i = 0; i < activeBalls; i++) {
      ballUniformArray[i].set(
        balls[i].x * aspect,
        balls[i].y + scrollOff,
        balls[i].r,
      )
    }

    // Update uniforms
    uniforms.u_time.value = elapsed
    uniforms.u_mouse.value.set(smMX, smMY)

    renderer.render(scene, camera)
  }

  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    window.removeEventListener('resize', onResize)

    if (geometry) { geometry.dispose(); geometry = null }
    if (material) { material.dispose(); material = null }
    if (renderer) { renderer.dispose(); renderer = null }
    scene = null
    camera = null
    uniforms = null
    clock = null
    balls = []
    ballUniformArray = []
  }

  // Watch theme changes
  watch([primaryHue, secondaryHue, isDark], applyThemeColors)

  // Watch bubble size / rmin — recalculate ball radii
  watch([bubblesSize, bubblesRmin], () => {
    for (const b of balls) {
      b.r = calcBallRadius(b, bubblesRmin.value, bubblesSize.value)
    }
  })

  // Watch drift speed
  watch(bubblesDrift, (newDrift) => {
    for (const b of balls) {
      b.speed = newDrift + b.h1 * newDrift * 1.8
    }
  })

  // Watch enabled toggle
  watch(bubblesEnabled, (enabled) => {
    if (!enabled) {
      isSupported.value = false
      if (canvasRef.value) canvasRef.value.style.display = 'none'
    } else if (renderer) {
      isSupported.value = true
      if (canvasRef.value) canvasRef.value.style.display = ''
    } else {
      init()
    }
  })

  onMounted(() => {
    if (!bubblesEnabled.value) return
    requestAnimationFrame(() => init())
  })

  onUnmounted(cleanup)

  return { isSupported }
}
