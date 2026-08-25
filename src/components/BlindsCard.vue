<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  upperBlind: { type: Object, required: true },
  rightBlind: { type: Object, required: true },
});
const emit = defineEmits(['change-height', 'change-angle', 'select-blind']);

const selectedBlind = ref('upper');
const activeBlind = computed(() => selectedBlind.value === 'upper' ? props.upperBlind : props.rightBlind);

function selectBlind(blind) {
  selectedBlind.value = blind;
  emit('select-blind', blind);
}

</script>

<template>
  <div class="jalousien-card">
    <!-- LEFT: window illustration -->
    <div class="jalousien-left">
      <div class="card-title">
        <svg width="41" height="41" viewBox="0 0 41 41">
          <path d="M0 0 L0 41 L29.27 41 L29.27 0 Z
            M27.86 39.6 L1.41 39.6 L1.41 31.1 L2.97 31.1 L2.97 38.02 L26.3 38.02 L26.3 31.1 L27.86 31.1 Z
            M4.38 36.61 L4.38 31.1 L24.88 31.1 L24.88 36.61 Z
            M27.86 29.7 L1.41 29.7 L1.41 26.15 L27.86 26.15 Z
            M27.86 24.75 L1.41 24.75 L1.41 21.2 L27.86 21.2 Z
            M27.86 19.8 L1.41 19.8 L1.41 16.25 L27.86 16.25 Z
            M27.86 14.85 L1.41 14.85 L1.41 11.3 L27.86 11.3 Z
            M27.86 9.9 L1.41 9.9 L1.41 6.35 L27.86 6.35 Z
            M27.86 4.95 L1.41 4.95 L1.41 1.4 L27.86 1.4 Z
            M40 21.47 L41 22.46 L37 26.45 L32.99 22.46 L33.99 21.47 L36.29 23.75 L36.29 7.72 L33.99 10.01 L32.99 9.02 L37 5.03 L41 9.02 L40 10.01 L37.7 7.71 L37.7 23.76 Z"
          fill="var(--color-text)" stroke="none"/>
        </svg>
        Jalousien
      </div>

      <div class="window-wrap">
        <div class="blind-top" :class="{ selected: selectedBlind === 'upper' }" @click="selectBlind('upper')">
          <svg width="240" height="60" viewBox="0 0 240 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="240" height="60" fill="rgb(34,34,48)"/>
            <path d="M102,6L137,26" fill="none" stroke="var(--color-text)" stroke-width="3" stroke-opacity="0.9" stroke-linecap="round"/>
            <path d="M102,20L137,40" fill="none" stroke="var(--color-text)" stroke-width="3" stroke-opacity="0.9" stroke-linecap="round"/>
            <path d="M102,34L137,54" fill="none" stroke="var(--color-text)" stroke-width="3" stroke-opacity="0.9" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="window-main">
          <div class="slat-overlay"></div>
        </div>
        <div class="blind-side" :class="{ selected: selectedBlind === 'right' }" @click="selectBlind('right')">
          <svg width="60" height="220" viewBox="0 0 60 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="60" height="220" fill="rgb(211,211,214)"/>
            <path d="M12,86L47,106" fill="none" stroke="rgb(7,7,15)" stroke-width="3" stroke-linecap="round"/>
            <path d="M12,100L47,120" fill="none" stroke="rgb(7,7,15)" stroke-width="3" stroke-linecap="round"/>
            <path d="M12,114L47,134" fill="none" stroke="rgb(7,7,15)" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- RIGHT: controls -->
    <div class="jalousien-right">
      <div class="selected-blind-label">{{ selectedBlind === 'upper' ? 'Oben' : 'Rechts' }}</div>
      <div class="j-icon">
        <svg width="27" height="41" viewBox="0 0 27 41">
          <path d="M11.01 10.67 L10.31 9.45 L9.19 10.09 L9.19 6.81 L11.01 5.76 L10.31 4.55 L9.19 5.19 L9.19 0
            L1.83 0 L1.83 9.44 L0 10.49 L0.71 11.71 L1.83 11.06 L1.83 14.34 L0 15.39 L0.71 16.61 L1.83 15.96
            L1.83 19.24 L0 20.29 L0.71 21.51 L1.83 20.87 L1.83 24.14 L0 25.19 L0.71 26.41 L1.83 25.77
            L1.83 29.05 L0 30.1 L0.71 31.32 L1.83 30.67 L1.83 33.95 L0 35.0 L0.71 36.22 L1.83 35.57
            L1.83 41 L9.19 41 L9.19 31.32 L11.01 30.28 L10.31 29.06 L9.19 29.7 L9.19 26.42
            L11.01 25.37 L10.31 24.15 L9.19 24.8 L9.19 21.52 L11.01 20.47 L10.31 19.25 L9.19 19.9
            L9.19 16.62 L11.01 15.57 L10.31 14.35 L9.19 14.99 L9.19 11.72 L11.01 10.67
            M7.78 39.6 L3.24 39.6 L3.24 38.03 L7.78 38.03 Z
            M7.78 36.63 L3.24 36.63 L3.24 34.76 L7.78 32.14 Z
            M7.78 30.51 L3.24 33.14 L3.24 29.86 L7.78 27.23 Z
            M7.78 25.61 L3.24 28.24 L3.24 24.96 L7.78 22.33 Z
            M7.78 20.71 L3.24 23.33 L3.24 20.05 L7.78 17.43 Z
            M7.78 15.81 L3.24 18.43 L3.24 15.15 L7.78 12.53 Z
            M7.78 10.9 L3.24 13.53 L3.24 10.25 L7.78 7.63 Z
            M7.78 6.0 L3.24 8.63 L3.24 4.38 L7.78 4.38 Z
            M7.78 2.97 L3.24 2.97 L3.24 1.41 L7.78 1.41 Z
            M26.01 31.62 L27 32.61 L23.01 36.59 L19.01 32.61 L20.01 31.62
            L22.31 33.91 L22.31 6.85 L20.01 9.14 L19.01 8.15
            L23.01 4.16 L27 8.15 L26.01 9.14 L23.72 6.85 L23.72 33.91 Z"
          fill="var(--color-text)" stroke="none"/>
        </svg>
      </div>

      <div class="j-row">
        <button class="ctrl-btn" @click="emit('change-height', selectedBlind, -5)" aria-label="Behang absenken">
          <svg width="72" height="60" viewBox="0 0 72 60">
            <path d="M15.57,21.78 L36.78,43 L58,21.78" fill="none" stroke="var(--color-text)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="j-val">{{ activeBlind.height }} %</div>
        <button class="ctrl-btn" @click="emit('change-height', selectedBlind, 5)" aria-label="Behang anheben">
          <svg width="72" height="60" viewBox="0 0 72 60">
            <path d="M56.43,38.21 L35.21,17 L14,38.21" fill="none" stroke="var(--color-text)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <div class="j-icon">
        <svg width="38" height="41" viewBox="0 0 38 41">
          <path d="M11.03 10.67 L10.32 9.45 L9.2 10.09 L9.2 6.81 L11.03 5.76 L10.32 4.55 L9.2 5.19 L9.2 0
            L1.83 0 L1.83 9.44 L0 10.49 L0.71 11.71 L1.83 11.06 L1.83 14.34 L0 15.39 L0.71 16.61 L1.83 15.96
            L1.83 19.24 L0 20.29 L0.71 21.51 L1.83 20.87 L1.83 24.14 L0 25.19 L0.71 26.41 L1.83 25.77
            L1.83 29.05 L0 30.1 L0.71 31.31 L1.83 30.66 L1.83 33.95 L0 35.0 L0.71 36.21 L1.83 35.56
            L1.83 41 L9.2 41 L9.2 31.32 L11.03 30.27 L10.32 29.06 L9.2 29.7 L9.2 26.41
            L11.03 25.36 L10.32 24.15 L9.2 24.8 L9.2 21.52 L11.03 20.47 L10.32 19.25 L9.2 19.9
            L9.2 16.62 L11.03 15.57 L10.32 14.35 L9.2 14.99 L9.2 11.72 L11.03 10.67
            M7.79 39.59 L3.24 39.59 L3.24 38.03 L7.79 38.03 Z
            M7.79 36.62 L3.24 36.62 L3.24 34.75 L7.79 32.13 Z
            M7.79 30.51 L3.24 33.14 L3.24 29.85 L7.79 27.22 Z
            M7.79 25.61 L3.24 28.24 L3.24 24.96 L7.79 22.33 Z
            M7.79 20.71 L3.24 23.33 L3.24 20.05 L7.79 17.43 Z
            M7.79 15.81 L3.24 18.43 L3.24 15.15 L7.79 12.53 Z
            M7.79 10.9 L3.24 13.53 L3.24 10.25 L7.79 7.63 Z
            M7.79 6.0 L3.24 8.63 L3.24 4.38 L7.79 4.38 Z
            M7.79 2.97 L3.24 2.97 L3.24 1.41 L7.79 1.41 Z
            M38 20.35 L33.81 24.54 L29.62 20.35 L30.61 19.36 L33.1 21.85 L33.1 19.86
            C33.1 15.88 29.85 12.64 25.86 12.64 C21.87 12.64 18.62 15.88 18.62 19.86
            C18.62 23.84 21.87 27.08 25.86 27.08 L25.86 28.48
            C21.09 28.48 17.21 24.61 17.21 19.86 C17.21 15.1 21.09 11.23 25.86 11.23
            C30.63 11.23 34.51 15.1 34.51 19.86 L34.51 21.85 L37.01 19.36 Z"
          fill="var(--color-text)" stroke="none"/>
        </svg>
      </div>

      <div class="j-row">
        <button class="ctrl-btn" style="transform:scaleX(-1)" @click="emit('change-angle', selectedBlind, -5)" aria-label="Lamellen negativ neigen">
          <svg width="72" height="60" viewBox="0 0 72 60">
            <path d="M51,30.7 L44.95,36.77 L38.9,30.7 L40.33,29.28 L43.93,32.88 L43.93,30.0
              C43.93,24.24 39.24,19.55 33.48,19.55 C27.72,19.55 23.04,24.23 23.04,29.99
              C23.04,35.75 27.73,40.44 33.49,40.44 L33.49,42.48
              C26.6,42.48 21,36.87 21,29.99 C21,23.11 26.6,17.51 33.48,17.51
              C40.36,17.51 45.96,23.11 45.96,29.99 L45.96,32.87 L49.56,29.27 Z"
            fill="none" stroke="var(--color-text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="j-val">{{ activeBlind.angle }} °</div>
        <button class="ctrl-btn" @click="emit('change-angle', selectedBlind, 5)" aria-label="Lamellen positiv neigen">
          <svg width="72" height="60" viewBox="0 0 72 60">
            <path d="M51,30.7 L44.95,36.77 L38.9,30.7 L40.33,29.28 L43.93,32.88 L43.93,30.0
              C43.93,24.24 39.24,19.55 33.48,19.55 C27.72,19.55 23.04,24.23 23.04,29.99
              C23.04,35.75 27.73,40.44 33.49,40.44 L33.49,42.48
              C26.6,42.48 21,36.87 21,29.99 C21,23.11 26.6,17.51 33.48,17.51
              C40.36,17.51 45.96,23.11 45.96,29.99 L45.96,32.87 L49.56,29.27 Z"
            fill="none" stroke="var(--color-text)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slat-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0,0,0,0.5) 0px,
    rgba(0,0,0,0.5) 4px,
    transparent 4px,
    transparent 10px
  );
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.blind-top,
.blind-side {
  cursor: pointer;
}
.blind-top.selected,
.blind-side.selected {
  outline: 3px solid var(--color-text);
  outline-offset: -3px;
}
.blind-top.selected svg rect,
.blind-side.selected svg rect {
  fill: #fff;
}
.blind-top.selected svg path {
  stroke: #07070f;
}
.blind-side:not(.selected) svg rect {
  fill: rgb(34,34,48);
}
.blind-side:not(.selected) svg path {
  stroke: #fff;
}
.selected-blind-label {
  min-height: 22px;
  font-size: 18px;
  color: var(--color-text);
}
.window-main {
  position: relative;
}
</style>
