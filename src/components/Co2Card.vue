<script setup>
import { computed } from 'vue';

const props = defineProps({
  co2: { type: Number, default: null },
});

// 0 :)   < 500 ppm
// 1 :|)  500–650 ppm
// 2 :|   650–800 ppm
// 3 :|(  800–950 ppm
// 4 :(   ≥ 950 ppm
function smileyIndex(ppm) {
  if (ppm < 500) return 0;
  if (ppm < 650) return 1;
  if (ppm < 800) return 2;
  if (ppm < 950) return 3;
  return 4;
}

const activeIndex = computed(() => (props.co2 == null ? null : smileyIndex(props.co2)));
const smileys = [
  { path: 'M13,27 Q24,39 35,27' }, // 0 big smile
  { path: 'M14,29 Q24,36 34,29' }, // 1 slight smile
  { path: 'M15,31 L33,31' }, // 2 neutral
  { path: 'M14,34 Q24,27 34,34' }, // 3 slight frown
  { path: 'M13,36 Q24,25 35,36' }, // 4 frown
];
</script>

<template>
  <div class="card">
    <div class="card-title">
      <svg width="41.53" height="33.616" viewBox="0 0 41.53 33.616" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32.82,33.61L8.82,33.61C4.02,33.61,0.11,29.73,0.11,24.96C0.11,20.2,3.65,16.69,8.14,16.34C8.49,11.89,12.25,8.36,16.82,8.36C19.36,8.36,21.71,9.43,23.36,11.31C24.41,10.68,25.59,10.35,26.82,10.35C30.29,10.35,33.15,12.98,33.49,16.34C37.98,16.69,41.52,20.42,41.52,24.96C41.52,29.73,37.61,33.62,32.81,33.62ZM8.82,17.71C4.8,17.71,1.53,20.96,1.53,24.95C1.53,28.95,4.8,32.2,8.82,32.2L32.82,32.2C36.84,32.2,40.11,28.95,40.11,24.95C40.11,20.96,36.84,17.71,32.82,17.71L32.11,17.71L32.11,17.01C32.11,14.11,29.74,11.75,26.82,11.75C25.67,11.75,24.57,12.12,23.65,12.81L23.08,13.24L22.65,12.68C21.26,10.83,19.13,9.76,16.82,9.76C12.8,9.76,9.53,13.01,9.53,17.01L9.53,17.71L8.82,17.71Z" fill="var(--color-text)"/>
        <path d="M23.94,28.17C22.61,28.17,21.52,27.1,21.52,25.77C21.52,24.44,22.6,23.36,23.94,23.36C25.28,23.36,26.36,24.44,26.36,25.77C26.36,27.1,25.28,28.17,23.94,28.17ZM23.94,24.77C23.39,24.77,22.94,25.22,22.94,25.77C22.94,26.31,23.39,26.76,23.94,26.76C24.49,26.76,24.94,26.31,24.94,25.77C24.94,25.22,24.49,24.77,23.94,24.77ZM16.49,27.96L15.49,26.97L25.15,17.37L26.15,18.37L16.49,27.96ZM17.7,21.96C16.37,21.96,15.28,20.89,15.28,19.56C15.28,18.23,16.36,17.16,17.7,17.16C19.04,17.16,20.12,18.23,20.12,19.56C20.12,20.89,19.04,21.96,17.7,21.96ZM17.7,18.58C17.15,18.58,16.7,19.02,16.7,19.57C16.7,20.12,17.15,20.56,17.7,20.56C18.25,20.56,18.7,20.12,18.7,19.57C18.7,19.02,18.25,18.58,17.7,18.58Z" fill="var(--color-text)"/>
      </svg>
      CO₂-Gehalt
    </div>
    <div class="card-value">{{ co2 == null ? '—' : co2 }} ppm</div>
    <div class="co2-smileys">
      <svg
        v-for="(s, i) in smileys"
        :key="i"
        class="smiley-icon"
        :class="{ active: activeIndex === i }"
        width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="23" fill="var(--smiley-fill)"/>
        <circle cx="17" cy="19" r="3" fill="var(--smiley-ink)"/>
        <circle cx="31" cy="19" r="3" fill="var(--smiley-ink)"/>
        <path :d="s.path" stroke="var(--smiley-ink)" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      </svg>
    </div>
  </div>
</template>
