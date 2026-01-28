<template>
  <div class="mascot-container">
    <svg
      class="mascot-svg"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Body/Head -->
      <path
        class="body-bg"
        d="M20,120 C20,80 30,50 60,50 C90,50 100,80 100,120"
        fill="#eef2f5"
        stroke="#333"
        stroke-width="0"
      />

      <!-- Ears -->
      <path class="ear left" d="M25,60 C15,45 15,30 30,25 C40,25 45,45 40,55" fill="#333" />
      <path class="ear right" d="M95,60 C105,45 105,30 90,25 C80,25 75,45 80,55" fill="#333" />

      <!-- Head Shape -->
      <circle cx="60" cy="70" fill="#333" r="45" />

      <!-- Face Mask (White Area) -->
      <ellipse
        cx="60"
        cy="75"
        fill="#fff"
        rx="35"
        ry="30"
      />

      <!-- Muzzle -->
      <ellipse
        cx="60"
        cy="85"
        fill="#eee"
        rx="15"
        ry="12"
      />
      <path d="M56,82 L64,82 L60,87 Z" fill="#333" /> <!-- Nose -->

      <!-- Mouth Expressions -->
      <g class="mouth">
        <!-- Neutral -->
        <path
          v-if="mood === 'neutral' || mood === 'surprised'"
          d="M60,87 L60,92"
          stroke="#333"
          stroke-linecap="round"
          stroke-width="2"
        />
        <!-- Sad (Error) -->
        <path
          v-if="mood === 'sad'"
          d="M55,92 Q60,87 65,92"
          fill="none"
          stroke="#333"
          stroke-linecap="round"
          stroke-width="2"
        />
        <!-- Happy (Success) -->
        <path
          v-if="mood === 'happy'"
          d="M55,89 Q60,95 65,89"
          fill="none"
          stroke="#333"
          stroke-linecap="round"
          stroke-width="2"
        />
        <!-- Excited (Typing) - Open smile -->
        <path
          v-if="mood === 'excited'"
          d="M55,89 Q60,98 65,89 Z"
          fill="#333"
          stroke="none"
        >
          <!-- Natural breathing/smiling motion (Path Morph) -->
          <animate
            attributeName="d"
            calcMode="spline"
            dur="1.5s"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            repeatCount="indefinite"
            values="M55,89 Q60,96 65,89 Z; M54,88.5 Q60,100 66,88.5 Z; M55,89 Q60,96 65,89 Z"
          />
        </path>

        <!-- Anxious/Tense (Loading) - Wobbly line -->
        <path
          v-if="mood === 'anxious'"
          d="M55,90 Q57,88 60,90 Q62,92 65,90"
          fill="none"
          stroke="#333"
          stroke-linecap="round"
          stroke-width="2"
        >
          <!-- Wobbly animation -->
          <animate
            attributeName="d"
            dur="0.3s"
            repeatCount="indefinite"
            values="M55,90 Q57,88 60,90 Q62,92 65,90; M55,90 Q57,92 60,90 Q62,88 65,90; M55,90 Q57,88 60,90 Q62,92 65,90"
          />
        </path>
      </g>

      <!-- Eyes Container -->
      <g class="eyes">
        <!-- Left Eye Base -->
        <circle cx="48" cy="68" fill="#333" r="8" />
        <!-- Right Eye Base -->
        <circle cx="72" cy="68" fill="#333" r="8" />

        <!-- Eyelids / Brows -->
        <!-- Sad Eyelids -->
        <g v-if="mood === 'sad'">
          <path d="M40,64 Q48,70 56,64" fill="#333" stroke="#333" stroke-width="2" />
          <path d="M64,64 Q72,70 80,64" fill="#333" stroke="#333" stroke-width="2" />
        </g>
        <!-- Happy Eyelids (Squint) -->
        <g v-if="mood === 'happy'">
          <path d="M40,72 Q48,64 56,72" fill="none" stroke="#fff" stroke-width="2" />
          <path d="M64,72 Q72,64 80,72" fill="none" stroke="#fff" stroke-width="2" />
        </g>
        <!-- Anxious Brows -->
        <g v-if="mood === 'anxious'">
          <path d="M42,60 Q48,64 54,60" fill="none" stroke="#333" stroke-width="2" />
          <path d="M66,60 Q72,64 78,60" fill="none" stroke="#333" stroke-width="2" />
        </g>

        <!-- Pupils (Only show if not happy/squinting too much, or keep them for movement) -->
        <template v-if="mood !== 'happy'">
          <circle
            class="pupil"
            cx="48"
            cy="68"
            fill="#fff"
            r="3"
            :transform="eyeLookTransform"
          />
          <circle
            class="pupil"
            cx="72"
            cy="68"
            fill="#fff"
            r="3"
            :transform="eyeLookTransform"
          />
        </template>
      </g>

      <!-- Sweat Drop (Anxious) -->
      <path
        v-if="mood === 'anxious'"
        d="M85,55 Q88,50 85,45 Q82,50 85,55"
        fill="#89CFF0"
        opacity="0.8"
      >
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.8;0.3;0.8" />
        <animateTransform
          attributeName="transform"
          dur="2s"
          repeatCount="indefinite"
          type="translate"
          values="0,0; 0,5; 0,0"
        />
      </path>

      <!-- Hands (Initially hidden/lowered) -->
      <g class="hands" :class="{ hiding: isHiding }">
        <!-- Left Hand -->
        <circle
          class="hand left-hand"
          cx="40"
          cy="130"
          fill="#333"
          r="14"
        />
        <!-- Right Hand -->
        <circle
          class="hand right-hand"
          cx="80"
          cy="130"
          fill="#333"
          r="14"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    /** 0 to 1 mapping of horizontal position relative to the input */
    lookX: number
    /** 0 to 1 mapping of vertical position (approx) */
    lookY: number
    /** Whether to cover eyes */
    isHiding: boolean
    /** Emotional state */
    mood?: 'neutral' | 'happy' | 'sad' | 'surprised' | 'excited' | 'anxious'
  }>()

  const eyeLookTransform = computed(() => {
    // Map 0..1 to -3..3 screen units translation
    const x = (props.lookX - 0.5) * 6
    const y = (props.lookY - 0.5) * 6
    return `translate(${x}, ${y})`
  })
</script>

<style scoped>
.mascot-container {
  width: 160px;
  height: 160px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  /* Make sure bottom aligns nicely with the card top */
  margin-bottom: -30px;
  z-index: 20;
}

.mascot-svg {
  width: 100%;
  height: 100%;
}

.pupil {
  /* Removed transition for instant responsiveness */
}

.hand {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* Hiding State Animations */
.hands.hiding .left-hand {
  transform: translate(8px, -65px); /* Move up to cover left eye */
}

.hands.hiding .right-hand {
  transform: translate(-8px, -65px); /* Move up to cover right eye */
}
</style>
