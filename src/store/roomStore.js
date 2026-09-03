import { defineStore } from 'pinia';
import { mqttClient } from '../mqtt/mqttClient.js';
import { resolveRoomId, resolveStateTopic, resolveCommandTopic } from '../config.js';

const TEMP_MIN = 5;
const TEMP_MAX = 35;
const HEIGHT_MIN = 0;
const HEIGHT_MAX = 100;
const ANGLE_MIN = -90;
const ANGLE_MAX = 90;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function co2SmileyIndex(ppm) {
  if (ppm < 500) return 0;
  if (ppm < 650) return 1;
  if (ppm < 800) return 2;
  if (ppm < 950) return 3;
  return 4;
}

function roomCacheKey(roomId) {
  return `zvw-room-data:${roomId}`;
}

export const useRoomStore = defineStore('room', {
  state: () => ({
    roomId: resolveRoomId(),

    // connection
    mqttStatus: 'disconnected',

    // sensor readings (server-driven, read-only from UI's point of view)
    currentTemp: null, // measured room temperature, e.g. 17.5
    humidity: null, // relative humidity %
    co2: null, // ppm
    outsideTemp: null, // shown in header

    // control state (user-driven, published over MQTT)
    targetTemp: 19,
    upperBlind: { height: 0, angle: 0 },
    rightBlind: { height: 0, angle: 0 },

    lastMessageAt: null,
    _unsubscribe: null,
    _unsubscribeCommand: null,
  }),

  getters: {
    co2SmileyIndex: (state) => (state.co2 == null ? null : co2SmileyIndex(state.co2)),
    stateTopic: (state) => resolveStateTopic(state.roomId),
    commandTopic: (state) => resolveCommandTopic(state.roomId),
    isConnected: (state) => state.mqttStatus === 'connected',
  },

  actions: {
    /** Wire up MQTT: connect once, subscribe to this room's state and command topics. */
    init() {
      this._restoreCachedRoomData();
      mqttClient.onStatusChange((status) => {
        this.mqttStatus = status;
      });

      mqttClient.connect();

      this._unsubscribe = mqttClient.subscribe(this.stateTopic, (payload) => {
        this._applyIncoming(payload);
      });

      // Also subscribe to command topic to see other devices' commands
      this._unsubscribeCommand = mqttClient.subscribe(this.commandTopic, (payload) => {
        this._applyCommand(payload);
      });
    },

    teardown() {
      if (this._unsubscribe) this._unsubscribe();
      if (this._unsubscribeCommand) this._unsubscribeCommand();
    },

    changeRoom(roomId) {
      if (!roomId || roomId === this.roomId) return;
      if (this._unsubscribe) this._unsubscribe();
      if (this._unsubscribeCommand) this._unsubscribeCommand();

      this.roomId = roomId;
      this.currentTemp = null;
      this.humidity = null;
      this.co2 = null;
      this.outsideTemp = null;
      this.targetTemp = 19;
      this.upperBlind = { height: 0, angle: 0 };
      this.rightBlind = { height: 0, angle: 0 };
      this.lastMessageAt = null;
      this._restoreCachedRoomData();

      const url = new URL(window.location.href);
      url.searchParams.set('room', roomId);
      window.history.replaceState({}, '', url);

      this._unsubscribe = mqttClient.subscribe(this.stateTopic, (payload) => {
        this._applyIncoming(payload);
      });

      this._unsubscribeCommand = mqttClient.subscribe(this.commandTopic, (payload) => {
        this._applyCommand(payload);
      });
    },

    /**
     * Merge an incoming MQTT payload into local state. Designed to be
     * forgiving about field names since the real payload shape isn't
     * finalised yet — extend this mapping once the real schema exists.
     */
    _applyIncoming(payload) {
      if (!payload || typeof payload !== 'object') return;

      // The PLC publishes every room in one array on the shared topic.
      if (Array.isArray(payload)) {
        const roomPayload = payload.find((room) => room?.roomId === this.roomId);
        if (!roomPayload) return;
        payload = roomPayload;
      } else if (payload.roomId && payload.roomId !== this.roomId) {
        // The PLC may also publish one room object at a time on the same topic.
        return;
      }
      this.lastMessageAt = Date.now();

      const pick = (...keys) => {
        for (const k of keys) {
          if (payload[k] !== undefined && payload[k] !== null) return payload[k];
        }
        return undefined;
      };

      const temp = pick('temperature', 'temp', 'roomTemp', 'current_temperature');
      if (temp !== undefined) this.currentTemp = Number(temp);

      const hum = pick('humidity', 'humidity_pct', 'relativeHumidity');
      if (hum !== undefined) this.humidity = Number(hum);

      const co2 = pick('co2', 'co2_ppm', 'CO2');
      if (co2 !== undefined) this.co2 = Number(co2);

      const outTemp = pick('outsideTemp', 'outside_temperature', 'weatherTemp');
      if (outTemp !== undefined) this.outsideTemp = Number(outTemp);

      const targetTemp = pick('targetTemp', 'target_temperature', 'setpoint');
      if (targetTemp !== undefined) this.targetTemp = Number(targetTemp);

      const applyBlind = (target, data) => {
        if (!data || typeof data !== 'object') return;
        const height = data.height ?? data.blindHeight ?? data.blind_height;
        const angle = data.angle ?? data.blindAngle ?? data.blind_angle ?? data.rotate;
        if (height !== undefined && height !== null) target.height = Number(height);
        if (angle !== undefined && angle !== null) target.angle = Number(angle);
      };

      applyBlind(this.upperBlind, payload.upperBlind || payload.upper_blind);
      applyBlind(this.rightBlind, payload.rightBlind || payload.right_blind);

      const legacyHeight = pick('blindHeight', 'blind_height', 'shadePosition');
      const legacyAngle = pick('blindAngle', 'blind_angle', 'slatAngle', 'rotate');
      const blindName = String(payload.blind ?? payload.blindId ?? '').toLowerCase();
      const legacyTarget = ['right', 'side'].includes(blindName)
        ? this.rightBlind
        : ['upper', 'top'].includes(blindName)
          ? this.upperBlind
          : null;
      if (legacyTarget) {
        if (legacyHeight !== undefined) legacyTarget.height = Number(legacyHeight);
        if (legacyAngle !== undefined) legacyTarget.angle = Number(legacyAngle);
      }

      const upperHeight = pick('upperBlindHeight', 'upper_blind_height');
      const upperAngle = pick('upperBlindAngle', 'upper_blind_angle');
      const rightHeight = pick('rightBlindHeight', 'right_blind_height');
      const rightAngle = pick('rightBlindAngle', 'right_blind_angle', 'rightBlindRotate');
      if (upperHeight !== undefined) this.upperBlind.height = Number(upperHeight);
      if (upperAngle !== undefined) this.upperBlind.angle = Number(upperAngle);
      if (rightHeight !== undefined) this.rightBlind.height = Number(rightHeight);
      if (rightAngle !== undefined) this.rightBlind.angle = Number(rightAngle);

      this._cacheCurrentRoomData();
    },

    _restoreCachedRoomData() {
      try {
        const cached = JSON.parse(localStorage.getItem(roomCacheKey(this.roomId)) || 'null');
        if (cached) this._applyIncoming(cached);
      } catch (error) {
        console.warn('[mqtt] cached room data unavailable', error);
      }
    },

    _cacheCurrentRoomData() {
      try {
        localStorage.setItem(roomCacheKey(this.roomId), JSON.stringify({
          roomId: this.roomId,
          temperature: this.currentTemp,
          humidity: this.humidity,
          co2: this.co2,
          outsideTemp: this.outsideTemp,
          targetTemp: this.targetTemp,
          upperBlind: this.upperBlind,
          rightBlind: this.rightBlind,
        }));
      } catch (error) {
        console.warn('[mqtt] room data cache unavailable', error);
      }
    },

    /**
     * Apply incoming command from another device (via command topic).
     * Ensures multiple devices can see each other's control changes.
     */
    _applyCommand(payload) {
      if (!payload || typeof payload !== 'object') return;

      // Only apply commands for this room
      if (payload.roomId && payload.roomId !== this.roomId) return;

      // Apply temperature change if present
      if (payload.targetTemp !== undefined && payload.targetTemp !== null) {
        this.targetTemp = clamp(Number(payload.targetTemp), TEMP_MIN, TEMP_MAX);
      }

      // Apply blind changes if present
      const blindName = String(payload.blind ?? '').toLowerCase();
      if (blindName === 'upper' || blindName === 'top') {
        if (payload.blindHeight !== undefined && payload.blindHeight !== null) {
          this.upperBlind.height = clamp(Number(payload.blindHeight), HEIGHT_MIN, HEIGHT_MAX);
        }
        if (payload.blindAngle !== undefined && payload.blindAngle !== null) {
          this.upperBlind.angle = clamp(Number(payload.blindAngle), ANGLE_MIN, ANGLE_MAX);
        }
      } else if (blindName === 'right' || blindName === 'side') {
        if (payload.blindHeight !== undefined && payload.blindHeight !== null) {
          this.rightBlind.height = clamp(Number(payload.blindHeight), HEIGHT_MIN, HEIGHT_MAX);
        }
        if (payload.blindAngle !== undefined && payload.blindAngle !== null) {
          this.rightBlind.angle = clamp(Number(payload.blindAngle), ANGLE_MIN, ANGLE_MAX);
        }
      }

      this._cacheCurrentRoomData();
    },

    _publishControl(patch) {
      mqttClient.publish(this.commandTopic, {
        roomId: this.roomId,
        ts: new Date().toISOString(),
        ...patch,
      });
    },

    changeTargetTemp(delta) {
      this.targetTemp = clamp(this.targetTemp + delta, TEMP_MIN, TEMP_MAX);
      this._publishControl({ targetTemp: this.targetTemp });
    },

    changeBlindHeight(blind, delta) {
      const state = blind === 'right' ? this.rightBlind : this.upperBlind;
      state.height = clamp(state.height + delta, HEIGHT_MIN, HEIGHT_MAX);
      this._publishControl({ blind, blindHeight: state.height, blindAngle: state.angle });
    },

    changeBlindAngle(blind, delta) {
      const state = blind === 'right' ? this.rightBlind : this.upperBlind;
      state.angle = clamp(state.angle + delta, ANGLE_MIN, ANGLE_MAX);
      this._publishControl({ blind, blindHeight: state.height, blindAngle: state.angle });
    },
  },
});
