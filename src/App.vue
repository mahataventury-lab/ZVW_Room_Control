<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoomStore } from './store/roomStore.js';
import { ROOM_OPTIONS, resolveShareUrl } from './config.js';

import AppHeader from './components/AppHeader.vue';
import TemperatureCard from './components/TemperatureCard.vue';
import HumidityCard from './components/HumidityCard.vue';
import BlindsCard from './components/BlindsCard.vue';
import Co2Card from './components/Co2Card.vue';
import QrCard from './components/QrCard.vue';

const room = useRoomStore();
const { roomId, currentTemp, targetTemp, humidity, co2, upperBlind, rightBlind, outsideTemp, mqttStatus, isConnected } =
  storeToRefs(room);

const shareUrl = computed(() => resolveShareUrl(roomId.value));

// ── THEME ──────────────────────────────────────────────────────
const isLight = ref(false);
function toggleTheme() {
  isLight.value = !isLight.value;
}

// ── SCALE-TO-FIT ────────────────────────────────────────────────
const BOARD_W = 800;
const BOARD_H = 1340;
const scale = ref(1);
function fitBoard() {
  const scaleX = window.innerWidth / BOARD_W;
  const scaleY = window.innerHeight / BOARD_H;
  scale.value = Math.min(scaleX, scaleY);
}

onMounted(() => {
  room.init();
  fitBoard();
  window.addEventListener('resize', fitBoard);
});
onUnmounted(() => {
  room.teardown();
  window.removeEventListener('resize', fitBoard);
});

const connLabel = computed(() => ({
  connected: 'Live',
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  disconnected: 'Offline',
  error: 'Connection error',
}[mqttStatus.value] || mqttStatus.value));
</script>

<template>
  <div class="scale-wrapper" :style="{ '--scale': scale }" :class="{ light: isLight }">
    <div class="board" :class="{ light: isLight }">
      <AppHeader
        :room-id="roomId"
        :room-options="ROOM_OPTIONS"
        :outside-temp="outsideTemp"
        @change-room="room.changeRoom"
        @toggle-theme="toggleTheme"
      />

      <div class="sections">
        <div class="row-top">
          <TemperatureCard
            :current-temp="currentTemp"
            :target-temp="targetTemp"
            @change="(d) => room.changeTargetTemp(d)"
          />
          <HumidityCard :humidity="humidity" />
        </div>

        <BlindsCard
          :upper-blind="upperBlind"
          :right-blind="rightBlind"
          @change-height="(blind, d) => room.changeBlindHeight(blind, d)"
          @change-angle="(blind, d) => room.changeBlindAngle(blind, d)"
        />

        <div class="row-bottom">
          <Co2Card :co2="co2" />
          <QrCard :share-url="shareUrl" />
        </div>
      </div>

      <div class="conn-badge">
        <span class="conn-dot" :class="mqttStatus"></span>
        {{ connLabel }}
      </div>
    </div>
  </div>
</template>
