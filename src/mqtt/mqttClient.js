import mqtt from 'mqtt';
import { MQTT_CONFIG } from '../config.js';

/**
 * Thin wrapper around mqtt.js so the rest of the app doesn't need to
 * know about connection lifecycle, reconnects, or topic bookkeeping.
 *
 * Usage:
 *   const client = createMqttClient();
 *   client.onStatusChange((status) => ...);
 *   client.subscribe(topic, (payload) => ...);
 *   client.publish(topic, jsonPayload);
 */
export function createMqttClient() {
  let client = null;
  const statusListeners = new Set();
  const topicListeners = new Map(); // topic -> Set(callback)

  let status = 'disconnected'; // disconnected | connecting | connected | error | reconnecting

  function setStatus(next) {
    status = next;
    statusListeners.forEach((cb) => cb(status));
  }

  function connect() {
    if (client) return;

    setStatus('connecting');

    const clientId = `${MQTT_CONFIG.clientIdPrefix}-${Math.random().toString(16).slice(2, 10)}`;

    client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      clientId,
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
      connectTimeout: MQTT_CONFIG.connectTimeout,
      clean: true,
    });

    client.on('connect', () => {
      console.info('[mqtt] connected', { brokerUrl: MQTT_CONFIG.brokerUrl });
      setStatus('connected');
      // re-subscribe to everything we care about (covers reconnects too)
      for (const topic of topicListeners.keys()) {
        client.subscribe(topic, { qos: 0 }, (err) => {
          if (err) console.error('[mqtt] subscribe failed', topic, err);
          else console.info('[mqtt] subscribed', topic);
        });
      }
    });

    client.on('reconnect', () => setStatus('reconnecting'));
    client.on('close', () => setStatus('disconnected'));
    client.on('offline', () => setStatus('disconnected'));
    client.on('error', (err) => {
      console.error('[mqtt] error', err);
      setStatus('error');
    });

    client.on('message', (topic, payload) => {
      const callbacks = topicListeners.get(topic);
      if (!callbacks) return;
      let data = payload.toString();
      try {
        data = JSON.parse(data);
      } catch {
        // not JSON — deliver as raw string, consumer decides what to do
      }
      callbacks.forEach((cb) => cb(data, topic));
    });
  }

  function subscribe(topic, callback) {
    if (!topicListeners.has(topic)) {
      topicListeners.set(topic, new Set());
      if (client && client.connected) {
        client.subscribe(topic, { qos: 0 }, (err) => {
          if (err) console.error('[mqtt] subscribe failed', topic, err);
          else console.info('[mqtt] subscribed', topic);
        });
      }
    }
    topicListeners.get(topic).add(callback);

    // return an unsubscribe function
    return () => {
      const set = topicListeners.get(topic);
      if (!set) return;
      set.delete(callback);
      if (set.size === 0) {
        topicListeners.delete(topic);
        if (client && client.connected) client.unsubscribe(topic);
      }
    };
  }

  function publish(topic, payload, opts = {}) {
    if (!client || !client.connected) {
      console.warn('[mqtt] publish skipped, not connected:', topic, payload);
      return;
    }
    const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    client.publish(topic, body, { qos: 0, ...opts });
  }

  function onStatusChange(callback) {
    statusListeners.add(callback);
    callback(status);
    return () => statusListeners.delete(callback);
  }

  function disconnect() {
    if (client) {
      client.end(true);
      client = null;
    }
    setStatus('disconnected');
  }

  return { connect, subscribe, publish, onStatusChange, disconnect, get status() { return status; } };
}

// Single shared instance for the whole app (one socket, many subscribers).
export const mqttClient = createMqttClient();
