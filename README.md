# ZVW Room Control — Vue 3 + MQTT

A tablet-friendly room control dashboard: heating setpoint, blind height/angle,
live CO₂ reading with a smiley indicator, humidity, and a QR code so anyone
can open the same room's dashboard on their phone.

Ported from the original static HTML prototype into a Vue 3 + Vite project,
wired up to MQTT (via [mqtt.js](https://github.com/mqttjs/MQTT.js)) so values
update live from your broker instead of being simulated.

## Stack

- **Vue 3** (`<script setup>`, Composition API)
- **Vite** — dev server & build
- **Pinia** — holds room state (sensor readings + control targets)
- **mqtt.js** — MQTT-over-WebSocket client
- **qrcode.vue** — renders the "open on mobile" QR code

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

Open `http://localhost:5173/?room=OG-001` to simulate a specific tablet.

## Run with Docker

Build and start the production container from this directory:

```bash
docker build -t zvw-room-control .
docker run --rm -p 8080:80 zvw-room-control
```

Open `http://localhost:8080/?room=OG-001`. Vite configuration is embedded at
build time, so pass MQTT settings as build arguments when needed:

```bash
docker build -t zvw-room-control \
  --build-arg VITE_MQTT_BROKER_URL=wss://mqtt-broker.cloud.service-ventury.de:8084/mqtt \
  --build-arg VITE_MQTT_TOPIC=tania/fakeplc/data .
```

## MQTT configuration

Everything MQTT-related lives in `src/config.js` and can be overridden with
environment variables (copy `.env.example` to `.env`):

```js
export const MQTT_CONFIG = {
  brokerUrl: 'wss://broker.emqx.io:8084/mqtt',
  topic: 'tania/fakeplc/data',
  ...
};
```

This currently points at the public EMQX test broker/topic you gave me, so
you can see the app connect and reflect connection status immediately with
no setup. **Swap `VITE_MQTT_BROKER_URL` / `VITE_MQTT_TOPIC` in `.env` once you
have real broker details** — no code changes needed.

### Important: browsers need WebSocket, not raw TCP

`mqtt://broker.emqx.io:1883` is a raw TCP address — browsers cannot open TCP
sockets directly. mqtt.js instead speaks **MQTT-over-WebSocket**, so the app
uses `wss://broker.emqx.io:8084/mqtt` (EMQX's public websocket listener).
When you get your production broker, make sure it also exposes a websocket
listener (commonly ports **8083** for `ws://` or **8084** for `wss://`), or
put a small MQTT-over-WebSocket bridge in front of it.

### Expected payload shape

The app is deliberately forgiving about field names (see
`src/store/roomStore.js` → `_applyIncoming`), and currently understands any of:

```json
{
  "temperature": 21.4,
  "humidity": 41,
  "co2": 780,
  "outsideTemp": 18,
  "targetTemp": 19,
  "blindHeight": 60,
  "blindAngle": 15
}
```

Any subset of these fields is fine — only the fields present in a message get
updated. Extend the `pick(...)` calls in `_applyIncoming` once your real
device's JSON schema is finalized.

### Publishing control changes

When someone taps a +/- button (temperature, blind height, blind angle), the
app publishes a JSON message to `<topic>/cmd`, e.g.:

```json
{ "roomId": "OG-001", "ts": "2026-08-21T10:00:00.000Z", "targetTemp": 20 }
```

Adjust `resolveCommandTopic()` in `src/config.js` once you know the real
command topic your controllers listen on.

## Multi-room / 30 tablets

Every tablet loads the **exact same build** — the only thing that differs is
the room id, read from the URL query string:

```
https://your-domain/?room=OG-001
https://your-domain/?room=OG-002
...
```

Point each tablet's browser (kiosk mode) at its own URL. The header, the QR
code (which encodes the current page URL, including `?room=...`), and the
MQTT topic (once you switch to a `"{room}"`-templated topic, e.g.
`zvw/rooms/{room}/state`) all follow automatically from this single query
param — no separate builds or config files per device.

### Recommended tablet setup

- Use a kiosk-mode browser (fullscreen, no address bar) pointed at the
  tablet's room URL.
- The board auto-scales to fit any screen size/orientation
  (`fitBoard()` in `App.vue`), so no per-device CSS tuning is needed.
- A small connection badge in the bottom-right corner shows live MQTT status
  (Live / Connecting / Reconnecting / Offline) — useful for spotting a tablet
  that's lost network at a glance.

## Project structure

```
src/
├── main.js                  # app bootstrap (Vue + Pinia)
├── App.vue                  # board layout, scale-to-fit, theme toggle
├── config.js                # MQTT + room-id resolution (env-driven)
├── mqtt/
│   └── mqttClient.js        # thin mqtt.js wrapper (connect/subscribe/publish)
├── store/
│   └── roomStore.js         # Pinia store: sensor state + control actions
├── components/
│   ├── AppHeader.vue        # logo, room id, outside temp, clock, theme toggle
│   ├── TemperatureCard.vue  # heating setpoint +/-
│   ├── HumidityCard.vue     # read-only humidity display
│   ├── BlindsCard.vue       # window illustration + height/angle controls
│   ├── Co2Card.vue          # CO₂ ppm + 5-state smiley indicator
│   └── QrCard.vue           # QR code linking to this room's URL
└── assets/
    └── theme.css            # dark/light CSS variables, board layout (ported 1:1 from the prototype)
```

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # sanity-check the production build locally
```

Deploy the contents of `dist/` to any static host (nginx, S3, Netlify, etc.)
and point each tablet at `https://<host>/?room=<ROOM_ID>`.

## Next steps once you have real data

1. Set `VITE_MQTT_BROKER_URL` / `VITE_MQTT_TOPIC` (and username/password if
   needed) in `.env`.
2. If each room has its own topic, switch `VITE_MQTT_TOPIC` to a template
   containing `{room}`.
3. Adjust the field mapping in `roomStore.js` → `_applyIncoming` and the
   command payload shape in `_publishControl` to match your device's real
   JSON schema.
4. Confirm your broker exposes a websocket listener reachable from the
   tablets' network.
