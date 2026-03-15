<script setup>
import { useTheme } from '@/composables/useTheme'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RotateCcw } from 'lucide-vue-next'

defineProps({
  mobile: { type: Boolean, default: false },
})

const {
  isDark, primaryHue, secondaryHue, intensity, radius, fontFamily, fontWeight, borderWidth,
  shadowIntensity, spacing, backgroundStyle, bgIntensity, cursorGlow,
  bubblesEnabled, bubblesRepulse, bubblesDrift, bubblesMerge, bubblesSat, bubblesSpec,
  bubblesFresnel, bubblesSize, bubblesFlick, bubblesSpring, bubblesDamp, bubblesContact,
  bubblesSharp, bubblesNormal, bubblesRmin, bubblesVignette, bubblesBallCount, bubblesNoise,
  bubblesParallax,
  FONT_STACKS,
  setPrimaryHue, setSecondaryHue, setIntensity, setRadius, setFontFamily, setFontWeight,
  setBorderWidth, setShadowIntensity, setSpacing, setBackgroundStyle, setBgIntensity,
  setCursorGlow, setBubblesEnabled, setBubblesRepulse, setBubblesDrift, setBubblesMerge,
  setBubblesSat, setBubblesSpec, setBubblesFresnel, setBubblesSize, setBubblesFlick,
  setBubblesSpring, setBubblesDamp, setBubblesContact, setBubblesSharp, setBubblesNormal,
  setBubblesRmin, setBubblesVignette, setBubblesBallCount, setBubblesNoise, setBubblesParallax,
  resetToDefaults,
} = useTheme()

const fontLabels = {
  'outfit': 'Outfit',
  'bricolage-grotesque': 'Bricolage',
  'ibm-plex-mono': 'IBM Plex',
  'instrument-sans': 'Instrument',
  'inter': 'Inter',
  'nunito': 'Nunito',
  'poppins': 'Poppins',
  'dm-sans': 'DM Sans',
  'system': 'Système'
}

const backgroundStyles = [
  { key: 'solid', label: 'Uni' },
  { key: 'organic', label: 'Organique' },
  { key: 'gradient', label: 'Dégradé' },
  { key: 'radial', label: 'Radial' },
  { key: 'mesh', label: 'Mesh' },
]

const solarpunkPresets = [
  { name: 'Fougère', primary: 145, secondary: 45 },
  { name: 'Aurore', primary: 35, secondary: 15 },
  { name: 'Mousse', primary: 160, secondary: 130 },
  { name: 'Soleil', primary: 55, secondary: 35 },
  { name: 'Canopée', primary: 120, secondary: 80 },
  { name: 'Terre', primary: 30, secondary: 60 },
]

const classicPresets = [
  { name: 'Violet', primary: 286, secondary: 286 },
  { name: 'Bleu', primary: 230, secondary: 200 },
  { name: 'Vert', primary: 140, secondary: 120 },
  { name: 'Orange', primary: 40, secondary: 20 },
  { name: 'Rouge', primary: 10, secondary: 350 },
  { name: 'Cyan', primary: 195, secondary: 180 },
]

const applyPreset = (preset) => {
  setPrimaryHue(preset.primary)
  setSecondaryHue(preset.secondary)
}

const handlePrimaryChange = (event) => {
  setPrimaryHue(parseInt(event.target.value))
}

const handleSecondaryChange = (event) => {
  setSecondaryHue(parseInt(event.target.value))
}

const handleIntensityChange = (event) => {
  setIntensity(parseInt(event.target.value))
}

const handleRadiusChange = (event) => {
  setRadius(parseFloat(event.target.value))
}

const handleFontWeightChange = (event) => {
  setFontWeight(parseInt(event.target.value))
}

const handleBorderWidthChange = (event) => {
  setBorderWidth(parseFloat(event.target.value))
}

const handleShadowIntensityChange = (event) => {
  setShadowIntensity(parseInt(event.target.value))
}

const handleSpacingChange = (event) => {
  setSpacing(parseInt(event.target.value))
}

const handleBgIntensityChange = (event) => {
  setBgIntensity(parseInt(event.target.value))
}

const hueGradient = 'linear-gradient(to right, hsl(0, 80%, 50%), hsl(60, 80%, 50%), hsl(120, 80%, 50%), hsl(180, 80%, 50%), hsl(240, 80%, 50%), hsl(300, 80%, 50%), hsl(360, 80%, 50%))'
</script>

<template>
  <div class="flex flex-col" :class="mobile ? 'max-h-[70vh]' : 'max-h-[80vh] w-80'">
    <!-- Mobile drag handle -->
    <div v-if="mobile" class="flex justify-center pt-2 shrink-0">
      <div class="bg-muted-foreground/30 rounded-full w-10 h-1"></div>
    </div>

    <!-- Sticky header -->
    <div class="flex justify-between items-center p-3 pb-2 border-b border-border shrink-0">
      <div class="flex items-center gap-2">
        <span class="font-medium text-foreground text-sm">Personnalisation</span>
        <span
          class="px-1.5 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider"
          :class="isDark ? 'bg-zinc-700 text-zinc-300' : 'bg-amber-100 text-amber-700'"
        >
          {{ isDark ? 'Sombre' : 'Clair' }}
        </span>
      </div>
      <Button variant="ghost" size="icon" class="w-7 h-7" @click="resetToDefaults" title="Réinitialiser">
        <RotateCcw class="w-3.5 h-3.5" />
      </Button>
    </div>

    <!-- Tabs -->
    <Tabs default-value="colors" class="flex-1 min-h-0">
      <div class="px-3 pt-2 shrink-0">
        <TabsList class="w-full">
          <TabsTrigger value="colors" class="text-xs">Couleurs</TabsTrigger>
          <TabsTrigger value="style" class="text-xs">Style</TabsTrigger>
          <TabsTrigger value="bubbles" class="text-xs">Bulles</TabsTrigger>
        </TabsList>
      </div>

      <!-- Colors Tab -->
      <TabsContent value="colors" class="overflow-y-auto overscroll-contain p-3 space-y-4">
        <!-- Primary Hue -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Teinte primaire</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ primaryHue }}°</span>
          </div>
          <input
            type="range"
            :value="primaryHue"
            min="0"
            max="360"
            step="1"
            class="rounded-full w-full h-2 appearance-none cursor-pointer"
            :style="{ background: hueGradient }"
            @input="handlePrimaryChange"
          />
        </div>

        <!-- Secondary Hue -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Teinte secondaire</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ secondaryHue }}°</span>
          </div>
          <input
            type="range"
            :value="secondaryHue"
            min="0"
            max="360"
            step="1"
            class="rounded-full w-full h-2 appearance-none cursor-pointer"
            :style="{ background: hueGradient }"
            @input="handleSecondaryChange"
          />
        </div>

        <!-- Intensity -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Intensité</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ intensity }}%</span>
          </div>
          <input
            type="range"
            :value="intensity"
            min="0"
            max="100"
            step="1"
            class="bg-linear-to-r from-muted to-primary rounded-full w-full h-2 appearance-none cursor-pointer"
            @input="handleIntensityChange"
          />
        </div>

        <!-- Preview -->
        <div class="flex gap-1.5 pt-1">
          <div class="flex-1 bg-primary rounded h-6" title="Primaire"></div>
          <div class="flex-1 bg-secondary border border-border rounded h-6" title="Secondaire"></div>
          <div class="flex-1 bg-muted rounded h-6" title="Atténué"></div>
          <div class="flex-1 bg-accent rounded h-6" title="Accent"></div>
        </div>

        <!-- Solarpunk Presets -->
        <div class="space-y-1.5 pt-1 border-border border-t">
          <Label class="text-muted-foreground text-xs">Solarpunk</Label>
          <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-thin">
            <Button
              v-for="preset in solarpunkPresets"
              :key="preset.name"
              variant="outline"
              size="sm"
              class="h-7 text-xs shrink-0"
              @click="applyPreset(preset)"
            >
              <span
                class="mr-1.5 rounded-full w-2.5 h-2.5"
                :style="{ background: `oklch(0.5 0.2 ${preset.primary})` }"
              ></span>
              {{ preset.name }}
            </Button>
          </div>
        </div>

        <!-- Classic Presets -->
        <div class="space-y-1.5 pt-1 border-border border-t">
          <Label class="text-muted-foreground text-xs">Classiques</Label>
          <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-thin">
            <Button
              v-for="preset in classicPresets"
              :key="preset.name"
              variant="outline"
              size="sm"
              class="h-7 text-xs shrink-0"
              @click="applyPreset(preset)"
            >
              <span
                class="mr-1.5 rounded-full w-2.5 h-2.5"
                :style="{ background: `oklch(0.5 0.2 ${preset.primary})` }"
              ></span>
              {{ preset.name }}
            </Button>
          </div>
        </div>
      </TabsContent>

      <!-- Style Tab -->
      <TabsContent value="style" class="overflow-y-auto overscroll-contain p-3 space-y-4">
        <!-- Roundedness -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Arrondi</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ radius.toFixed(2) }}rem</span>
          </div>
          <input
            type="range"
            :value="radius"
            min="0"
            max="2"
            step="0.05"
            class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer"
            @input="handleRadiusChange"
          />
        </div>

        <!-- Font Family -->
        <div class="space-y-1.5">
          <Label class="text-muted-foreground text-xs">Police</Label>
          <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-thin">
            <Button
              v-for="(stack, key) in FONT_STACKS"
              :key="key"
              :variant="fontFamily === key ? 'default' : 'outline'"
              size="sm"
              class="h-7 text-xs shrink-0"
              :style="{ fontFamily: stack }"
              @click="setFontFamily(key)"
            >
              {{ fontLabels[key] }}
            </Button>
          </div>
        </div>

        <!-- Font Weight -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Graisse</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ fontWeight }}</span>
          </div>
          <input
            type="range"
            :value="fontWeight"
            min="300"
            max="700"
            step="100"
            class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer"
            @input="handleFontWeightChange"
          />
        </div>

        <!-- Border Width -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Bordures</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ borderWidth }}px</span>
          </div>
          <input
            type="range"
            :value="borderWidth"
            min="0"
            max="10"
            step="0.5"
            class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer"
            @input="handleBorderWidthChange"
          />
        </div>

        <!-- Shadow Intensity -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Ombres</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ shadowIntensity }}%</span>
          </div>
          <input
            type="range"
            :value="shadowIntensity"
            min="0"
            max="200"
            step="10"
            class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer"
            @input="handleShadowIntensityChange"
          />
        </div>

        <!-- Spacing / Density -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Densité</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ spacing }}%</span>
          </div>
          <input
            type="range"
            :value="spacing"
            min="75"
            max="125"
            step="5"
            class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer"
            @input="handleSpacingChange"
          />
        </div>

        <!-- Background Style -->
        <div class="space-y-1.5">
          <Label class="text-muted-foreground text-xs">Arrière-plan</Label>
          <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-thin">
            <Button
              v-for="style in backgroundStyles"
              :key="style.key"
              :variant="backgroundStyle === style.key ? 'default' : 'outline'"
              size="sm"
              class="h-7 text-xs shrink-0"
              @click="setBackgroundStyle(style.key)"
            >
              {{ style.label }}
            </Button>
          </div>
        </div>

        <!-- Background Intensity -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center">
            <Label class="text-muted-foreground text-xs">Intensité arrière-plan</Label>
            <span class="tabular-nums text-muted-foreground text-xs">{{ bgIntensity }}%</span>
          </div>
          <input
            type="range"
            :value="bgIntensity"
            min="0"
            max="200"
            step="10"
            class="bg-linear-to-r from-muted to-primary/50 rounded-full w-full h-2 appearance-none cursor-pointer"
            @input="handleBgIntensityChange"
          />
        </div>

        <!-- Cursor Glow -->
        <div class="flex justify-between items-center">
          <Label class="text-muted-foreground text-xs">Halo du curseur</Label>
          <button
            type="button"
            role="switch"
            :aria-checked="cursorGlow"
            class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :class="cursorGlow ? 'bg-primary' : 'bg-muted'"
            @click="setCursorGlow(!cursorGlow)"
          >
            <span
              class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
              :class="cursorGlow ? 'translate-x-4' : 'translate-x-0'"
            />
          </button>
        </div>
      </TabsContent>

      <!-- Bubbles Tab -->
      <TabsContent value="bubbles" class="overflow-y-auto overscroll-contain p-3 space-y-4">
        <!-- Enable toggle -->
        <div class="flex justify-between items-center">
          <Label class="text-muted-foreground text-xs">Activer les bulles</Label>
          <button
            type="button"
            role="switch"
            :aria-checked="bubblesEnabled"
            class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            :class="bubblesEnabled ? 'bg-primary' : 'bg-muted'"
            @click="setBubblesEnabled(!bubblesEnabled)"
          >
            <span
              class="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform"
              :class="bubblesEnabled ? 'translate-x-4' : 'translate-x-0'"
            />
          </button>
        </div>

        <p v-if="!bubblesEnabled" class="text-muted-foreground text-xs leading-relaxed">
          Les bulles métalliques apparaissent en arrière-plan de la page d'accueil.
        </p>

        <template v-if="bubblesEnabled">
          <!-- ── Physique ── -->
          <div class="space-y-3 pt-1 border-border border-t">
            <Label class="text-muted-foreground/60 font-semibold text-[10px] uppercase tracking-widest">Physique</Label>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Réactivité souris</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesRepulse.toFixed(1) }}</span>
              </div>
              <input type="range" :value="bubblesRepulse" min="1" max="15" step="0.5" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesRepulse(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Élan</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesFlick.toFixed(0) }}</span>
              </div>
              <input type="range" :value="bubblesFlick" min="0" max="30" step="1" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesFlick(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Rappel</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesSpring.toFixed(1) }}</span>
              </div>
              <input type="range" :value="bubblesSpring" min="0.1" max="3" step="0.1" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesSpring(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Amortissement</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesDamp.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesDamp" min="0.80" max="0.99" step="0.01" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesDamp(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Rayon de contact</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesContact.toFixed(1) }}</span>
              </div>
              <input type="range" :value="bubblesContact" min="0.8" max="3.0" step="0.1" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesContact(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Parallaxe scroll</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesParallax.toFixed(4) }}</span>
              </div>
              <input type="range" :value="bubblesParallax" min="0" max="0.001" step="0.0001" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesParallax(parseFloat($event.target.value))" />
            </div>
          </div>

          <!-- ── Apparence ── -->
          <div class="space-y-3 pt-1 border-border border-t">
            <Label class="text-muted-foreground/60 font-semibold text-[10px] uppercase tracking-widest">Apparence</Label>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Fusion</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesMerge.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesMerge" min="0.3" max="1.0" step="0.05" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesMerge(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Netteté des bords</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesSharp.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesSharp" min="0.02" max="0.25" step="0.01" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesSharp(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Force des normales</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesNormal.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesNormal" min="1.0" max="6.0" step="0.25" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesNormal(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Saturation</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesSat.toFixed(1) }}</span>
              </div>
              <input type="range" :value="bubblesSat" min="0.5" max="2.5" step="0.1" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesSat(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Vignette</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesVignette.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesVignette" min="0" max="0.5" step="0.02" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesVignette(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Grain</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesNoise.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesNoise" min="0" max="0.15" step="0.01" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesNoise(parseFloat($event.target.value))" />
            </div>
          </div>

          <!-- ── Tailles ── -->
          <div class="space-y-3 pt-1 border-border border-t">
            <Label class="text-muted-foreground/60 font-semibold text-[10px] uppercase tracking-widest">Tailles</Label>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Taille min</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesRmin.toFixed(3) }}</span>
              </div>
              <input type="range" :value="bubblesRmin" min="0.01" max="0.08" step="0.005" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesRmin(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Taille max</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesSize.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesSize" min="0.08" max="0.30" step="0.01" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesSize(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Vitesse</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesDrift.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesDrift" min="0.01" max="0.20" step="0.01" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesDrift(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Nombre de bulles</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesBallCount }}</span>
              </div>
              <input type="range" :value="bubblesBallCount" min="8" max="32" step="4" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesBallCount(parseInt($event.target.value))" />
            </div>
          </div>

          <!-- ── Reflets ── -->
          <div class="space-y-3 pt-1 border-border border-t">
            <Label class="text-muted-foreground/60 font-semibold text-[10px] uppercase tracking-widest">Reflets</Label>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Reflets</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesSpec.toFixed(1) }}</span>
              </div>
              <input type="range" :value="bubblesSpec" min="0" max="5" step="0.25" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesSpec(parseFloat($event.target.value))" />
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center">
                <Label class="text-muted-foreground text-xs">Contour lumineux</Label>
                <span class="tabular-nums text-muted-foreground text-xs">{{ bubblesFresnel.toFixed(2) }}</span>
              </div>
              <input type="range" :value="bubblesFresnel" min="0" max="1" step="0.05" class="bg-muted rounded-full w-full h-2 appearance-none cursor-pointer" @input="setBubblesFresnel(parseFloat($event.target.value))" />
            </div>
          </div>
        </template>
      </TabsContent>
    </Tabs>
  </div>
</template>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid oklch(0.5 0.15 var(--primary-hue));
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  border: 2px solid oklch(0.5 0.15 var(--primary-hue));
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* Larger touch area for range track */
input[type="range"] {
  min-height: 2rem;
}

.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: oklch(0.5 0.05 var(--primary-hue) / 0.3) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: oklch(0.5 0.05 var(--primary-hue) / 0.3);
  border-radius: 2px;
}
</style>
