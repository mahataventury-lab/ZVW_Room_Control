<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  roomId: { type: String, required: true },
  roomOptions: { type: Array, required: true },
  outsideTemp: { type: Number, default: null },
});

const emit = defineEmits(['toggle-theme', 'change-room']);

const now = ref(new Date());
const liveWeatherTemp = ref(null);
const weatherCity = ref('');
let timer = null;
let weatherTimer = null;
let weatherController = null;

async function loadLiveWeather() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    weatherController?.abort();
    weatherController = new AbortController();
    const { latitude, longitude } = coords;
    const signal = weatherController.signal;

    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: 'temperature_2m',
        timezone: 'auto',
      });
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
      if (!weatherResponse.ok) throw new Error(`Weather request failed: ${weatherResponse.status}`);
      const weather = await weatherResponse.json();
      liveWeatherTemp.value = Number(weather.current?.temperature_2m);

      const cityResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`,
        { signal },
      );
      if (!cityResponse.ok) throw new Error(`Location request failed: ${cityResponse.status}`);
      const location = await cityResponse.json();
      weatherCity.value = location.results?.[0]?.name || '';
    } catch (error) {
      if (error.name !== 'AbortError') console.warn('[weather] live weather unavailable', error);
    }
  }, () => {}, { enableHighAccuracy: false, maximumAge: 15 * 60 * 1000, timeout: 10000 });
}

onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000 * 30);
  loadLiveWeather();
  weatherTimer = setInterval(loadLiveWeather, 15 * 60 * 1000);
});
onUnmounted(() => {
  clearInterval(timer);
  clearInterval(weatherTimer);
  weatherController?.abort();
});

const formattedDate = computed(() => {
  const d = now.value;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} | ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
});

const outsideTempLabel = computed(() => {
  const temperature = liveWeatherTemp.value ?? props.outsideTemp;
  if (temperature == null) return '—';
  return `${weatherCity.value ? `${weatherCity.value} ` : ''}${Math.round(temperature)}°C`;
});
</script>

<template>
  <div class="header">
    <!-- 1. Ventury logo -->
    <div class="ventury-logo">
      <svg width="139" height="30" viewBox="0 0 138.983 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <path d="M7.59,27.19L5.56,30L0,30L0,4.88L2.89,8.87L2.89,27.19L7.59,27.19Z" fill="rgb(122,122,131)"/>
          <path d="M15.4,16.4L13.63,18.84L0,0L3.53,0L15.4,16.4Z" fill="rgb(122,122,131)"/>
          <path d="M18.93,11.52L17.16,13.96L7.06,0L10.59,0L18.93,11.52Z" fill="rgb(122,122,131)"/>
          <path d="M22.45,6.64L20.69,9.08L14.12,0L17.65,0L22.45,6.64Z" fill="rgb(122,122,131)"/>
          <path d="M27.26,0L25.98,1.76L24.22,4.2L21.18,0L27.26,0Z" fill="rgb(122,122,131)"/>
          <path d="M27.9,3.99L11.12,27.19L9.09,30L30.79,30L30.79,0L27.9,3.99ZM14.65,27.19L27.9,8.87L27.9,27.19L14.65,27.19Z" fill="rgb(122,122,131)"/>
          <path d="M59.75,7.45L54.03,22.49L51.5,22.49L45.74,7.45L48.8,7.45L52.8,18.23L52.86,18.23L56.74,7.45L59.75,7.45Z" fill="rgb(122,122,131)"/>
          <path d="M72.71,15.66C72.71,14.52,72.67,13.68,72.59,13.02C72.51,12.24,72.38,11.69,72.21,11.17C71.34,8.6,69.12,7.13,66.17,7.13C64.82,7.13,63.62,7.43,62.62,8.03C61.4,8.77,60.58,9.81,60.12,11.17C59.8,12.07,59.64,13.23,59.64,14.95L59.64,15.06C59.65,16.72,59.84,17.79,60.16,18.74C60.99,21.34,63.21,22.81,66.32,22.81C67.78,22.81,69.07,22.5,70.13,21.97C70.76,21.67,71.31,21.28,71.77,20.84L70.34,18.41C70.25,18.5,70,18.74,69.9,18.83C69.12,19.54,68.02,20.04,66.52,20.04C64.74,20.04,63.44,19.22,62.86,17.6C62.71,17.14,62.62,16.7,62.62,15.98L72.7,15.98L72.7,15.66ZM62.62,13.53C62.61,12.82,62.67,12.42,62.83,11.95C63.07,11.23,63.51,10.67,64.09,10.29C64.71,9.91,65.39,9.74,66.16,9.74C67.8,9.74,69.01,10.53,69.5,11.95C69.65,12.42,69.71,12.82,69.7,13.53L62.62,13.53Z" fill="rgb(122,122,131)"/>
          <path d="M88.02,12.8L88.02,22.49L85.29,22.49L85.29,13.43C85.29,10.99,84.16,9.57,81.82,9.57C79.71,9.57,78.25,11.03,78.25,13.27L78.25,22.49L75.53,22.49L75.53,7.45L78.25,7.45L78.25,9.16L78.28,9.16C79.03,7.99,80.52,7.1,82.63,7.1C86.01,7.1,88.02,9.35,88.02,12.79Z" fill="rgb(122,122,131)"/>
          <path d="M94.54,18.15C94.54,19.65,95.12,20.06,96.5,20.06L97.49,20.06L97.49,22.5L95.99,22.5C93,22.5,91.85,21.18,91.85,18.25L91.85,9.58L90.37,9.58L90.05,9.58L90.05,7.45L91.85,7.45L91.85,5.42L94.54,1.7L94.54,7.46L97.49,7.46L97.49,9.58L94.54,9.58L94.54,18.16Z" fill="rgb(122,122,131)"/>
          <path d="M112.74,7.45L112.74,22.49L109.99,22.49L109.99,20.73L109.97,20.73C109.15,22,107.72,22.83,105.69,22.83C102.26,22.83,100.27,20.55,100.27,17.08L100.27,7.45L103.02,7.45L103.02,16.44C103.02,18.93,104.16,20.36,106.47,20.36C108.59,20.36,110,18.89,110,16.6L110,7.45L112.74,7.45Z" fill="rgb(122,122,131)"/>
          <path d="M124.04,7.14L124.04,9.83C123.59,9.67,123.12,9.58,122.6,9.58C120.65,9.58,119.25,11.71,119.25,14.01L119.25,22.49L116.52,22.49L116.52,7.45L119.25,7.45L119.25,9.32L119.28,9.32C119.96,8.03,121.32,7.11,123.41,7.11C123.61,7.11,123.83,7.12,124.03,7.15Z" fill="rgb(122,122,131)"/>
          <path d="M138.98,7.48L137.04,12.61L133.25,22.49L132.82,23.62C131.47,27.15,130.28,28.09,127.97,28.09L125.15,28.09L125.23,27.98L126.88,25.71L126.93,25.64L127.01,25.53L127.61,25.53C128.86,25.54,129.54,25.01,130.21,23.29L130.64,22.13L125.04,7.46L128.09,7.46L132.07,18.24L132.13,18.24L135.99,7.46L136.16,7.46L138.98,7.48Z" fill="rgb(122,122,131)"/>
        </g>
      </svg>
    </div>

    <!-- 2. Room -->
    <label class="header-room">
      <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.5,10.77L10.5,0.98L20.5,10.77M4.65,6.72L4.65,17.3L16.32,17.3L16.32,6.72M13.83,8.32L7.16,8.32L7.16,14.86L13.83,14.86L13.83,8.32Z" fill="none" stroke="var(--color-text)" stroke-width="1.42" stroke-miterlimit="10"/>
      </svg>
      <select :value="roomId" aria-label="Raum auswählen" @change="emit('change-room', $event.target.value)">
        <option v-for="room in roomOptions" :key="room" :value="room">{{ room }}</option>
      </select>
    </label>

    <!-- 3. Weather -->
    <div class="header-weather">
      <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21,5.7C21,2.55,18.49,0,15.4,0C13.62,0,11.96,0.86,10.93,2.3C10.22,1.85,9.39,1.61,8.54,1.61C6.22,1.61,4.28,3.36,3.97,5.65C1.73,5.97,0,7.93,0,10.3C0,12.89,2.07,15,4.62,15L16.38,15C18.92,15,21,12.89,21,10.3C21,9.53,20.81,8.79,20.46,8.12C20.81,7.38,21,6.54,21,5.7ZM16.38,13.58L4.62,13.58C2.83,13.58,1.39,12.11,1.39,10.3C1.39,8.49,2.83,7.02,4.62,7.02L5.31,7.02L5.31,6.31C5.31,4.49,6.75,3.02,8.54,3.02C9.31,3.02,10.07,3.31,10.66,3.83C10.82,3.98,10.98,4.15,11.12,4.34L11.54,4.91L12.09,4.48C12.49,4.18,12.95,4.02,13.44,4.02C14.68,4.02,15.69,5.05,15.69,6.31L15.69,7.02L16.38,7.02C17.48,7.02,18.49,7.57,19.09,8.52C19.43,9.05,19.61,9.67,19.61,10.3C19.61,12.11,18.16,13.58,16.38,13.58Z" fill="var(--color-text)"/>
      </svg>
      {{ outsideTempLabel }}
    </div>

    <!-- 4. Date/time -->
    <div class="header-date">{{ formattedDate }}</div>

    <!-- 5. Contrast toggle -->
    <div class="contrast-btn" @click="emit('toggle-theme')">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="9.5" stroke="var(--color-text)" stroke-width="1.5"/>
        <path d="M11 1.5 A9.5 9.5 0 0 1 11 20.5 Z" fill="var(--color-text)"/>
      </svg>
    </div>
  </div>
</template>
