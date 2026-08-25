<script setup>
const props = defineProps({
  currentTemp: { type: Number, default: null },
  targetTemp: { type: Number, required: true },
});
const emit = defineEmits(['change']);

function fmt(v) {
  if (v == null) return '—';
  return String(v).replace('.', ',');
}
</script>

<template>
  <div class="card">
    <div class="card-title">
      <svg width="24.784" height="40.45" viewBox="0 0 24.784 40.45" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.78,4.18L24.78,5.6L16.34,5.6L16.34,4.18L24.78,4.18ZM16.34,9.59L16.34,11L24.78,11L24.78,9.59L16.34,9.59ZM16.34,14.99L16.34,16.41L24.78,16.41L24.78,14.99L16.34,14.99ZM16.34,20.39L16.34,21.81L24.78,21.81L24.78,20.39L16.34,20.39ZM16.34,25.79L16.34,27.21L24.78,27.21L24.78,25.79L16.34,25.79ZM14.24,33.71C14.24,35.57,13.45,37.25,12.15,38.47C10.36,40.06,8.05,40.55,6.27,40.41C3.06,40.06,0.43,37.58,0.05,34.54C-0.25,32.08,0.83,29.84,2.67,28.45L2.67,4.21C2.67,1.88,4.67,0,7.11,0C9.56,0,11.57,1.88,11.57,4.21L11.57,28.45C13.19,29.68,14.24,31.58,14.24,33.71ZM12.74,33.71C12.74,32.08,11.97,30.57,10.63,29.56L10.07,29.13L10.07,4.21C10.07,2.67,8.74,1.42,7.11,1.42C5.49,1.42,4.17,2.67,4.17,4.21L4.17,29.13L3.6,29.56C2.08,30.71,1.31,32.51,1.54,34.37C1.84,36.78,3.91,38.72,6.44,39C9.5,39.35,12.19,36.94,12.74,33.71ZM9.58,30.8L8.39,29.9L8.39,15.56L5.83,15.56L5.83,29.9L4.63,30.8C3.19,31.9,3.04,33.99,4.29,35.28C5.53,36.55,7.65,36.63,8.96,35.46C10.34,34.24,10.51,32.11,9.58,30.8Z" fill="var(--color-text)"/>
      </svg>
      Temperatur
    </div>
    <div class="card-value">{{ fmt(currentTemp) }} °C</div>
    <div class="temp-controls">
      <button class="ctrl-btn" @click="emit('change', -1)" aria-label="Temperatur senken">
        <svg width="72" height="60" viewBox="0 0 72 60">
            <path d="M15.57,21.78 L36.78,43 L58,21.78" fill="none" stroke="var(--color-text)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="ctrl-val">{{ targetTemp }} °C</div>
      <button class="ctrl-btn" @click="emit('change', 1)" aria-label="Temperatur erhöhen">
        <svg width="72" height="60" viewBox="0 0 72 60">
            <path d="M56.43,38.21 L35.21,17 L14,38.21" fill="none" stroke="var(--color-text)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>
