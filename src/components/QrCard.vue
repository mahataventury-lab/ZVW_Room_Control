<script setup>
import QrcodeVue from 'qrcode.vue';

defineProps({
  shareUrl: { type: String, required: true },
});
</script>

<template>
  <div class="qr-card">
    <qrcode-vue :value="shareUrl" :size="140" level="M" render-as="svg" foreground="#000000" background="#ffffff" />
    <div class="qr-caption">SCAN TO OPEN ON MOBILE</div>
  </div>
</template>
