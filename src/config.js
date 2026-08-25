/**
 * ZVW Room Control — runtime configuration
 * -----------------------------------------
 * Every value here can be overridden with an environment variable
 * (see .env.example) so you can repoint the app at your real broker
 * later without touching any code.
 */

// ── MQTT BROKER ──────────────────────────────────────────────────
// NOTE: browsers cannot open raw TCP `mqtt://` sockets. mqtt.js talks
// MQTT-over-WebSocket instead, so the public EMQX test broker is used
// via its websocket listener. When you get real broker details, put
// the ws(s):// URL in VITE_MQTT_BROKER_URL (see .env.example).
export const MQTT_CONFIG = {
  brokerUrl: import.meta.env.VITE_MQTT_BROKER_URL || 'wss://broker.emqx.io:8084/mqtt',
  topic: import.meta.env.VITE_MQTT_TOPIC || 'tania/fakeplc/data',
  username: import.meta.env.VITE_MQTT_USERNAME || undefined,
  password: import.meta.env.VITE_MQTT_PASSWORD || undefined,
  clientIdPrefix: import.meta.env.VITE_MQTT_CLIENT_PREFIX || 'zvw-room-control',
  reconnectPeriod: 3000,
  connectTimeout: 8000,
};

export const ROOM_OPTIONS = [
  'EG-06 Vortrag/Beratung', 'EG-14 Beratung', 'EG-08 Frühstück/Treffpunkt',
  'EG-11 Warten/Beraten', 'OG-106 Personenmanagement', 'OG-107 Beratung/Büro',
  'OG-117 Projektleiter 2', 'OG-118 Projektleiter 1', 'OG-108 Besprechungsraum',
  'OG-113 Projektleiter 4', 'OG-114 Projektleiter 3', 'OG-206 Personenmanagement',
  'OG-208 Beratung/Büro', 'OG-217 Projektleiter 2', 'OG-218 Projektleiter 1',
  'OG-209 Besprechungsraum', 'OG-213 Projektleiter 4', 'OG-214 Projektleiter 3',
  'OG-305 Geschäftsführer', 'OG-314 Büro', 'OG-315 Büro', 'OG-306 Büro',
  'OG-307 Büro', 'OG-311 Büro', 'OG-312 Büro', 'OG-313 Besprechungsraum',
];

// ── ROOM RESOLUTION ──────────────────────────────────────────────
// Each of the 30 tablets loads the exact same build. The only thing
// that differs per device is the room id, which we read from the URL,
// e.g. https://control.local/?room=OG-001
// Fall back to a default so the app still runs standalone in dev.
export function resolveRoomId() {
  const params = new URLSearchParams(window.location.search);
  const requestedRoom = params.get('room') || import.meta.env.VITE_DEFAULT_ROOM;
  if (!requestedRoom) return ROOM_OPTIONS[0];

  // Keep older URLs such as ?room=OG-106 working with the PLC's full roomId.
  return ROOM_OPTIONS.find((room) => room === requestedRoom || room.startsWith(`${requestedRoom} `)) || requestedRoom;
}

// Builds the actual MQTT topic string for a given room, substituting
// the {room} placeholder if present, otherwise using the topic as-is
// (current behaviour, since we only have one shared test topic).
export function resolveStateTopic(roomId) {
  const { topic } = MQTT_CONFIG;
  return topic.includes('{room}') ? topic.replace('{room}', roomId) : topic;
}

// Command topic used when publishing control changes (blind height,
// blind angle, target temperature) back to the broker. Adjust once
// real device command topics are known.
export function resolveCommandTopic(roomId) {
  const stateTopic = resolveStateTopic(roomId);
  return `${stateTopic}/cmd`;
}

// Public URL to encode in the QR code, so scanning it on a phone opens
// the exact same room's dashboard.
export function resolveShareUrl(roomId) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', roomId);
  return url.toString();
}
