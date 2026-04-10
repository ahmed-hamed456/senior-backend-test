import { EventEmitter } from 'events';

const emitter = new EventEmitter();

// Raise the limit to avoid Node's default MaxListeners warning
emitter.setMaxListeners(20);

const eventBus = {
  /**
   * Subscribe a handler to a named event.
   * @param {string}   event
   * @param {Function} handler - receives the event payload object
   */
  subscribe(event, handler) {
    emitter.on(event, handler);
  },

  /**
   * Publish an event with a payload to all subscribers.
   * @param {string} event
   * @param {object} payload
   */
  publish(event, payload) {
    emitter.emit(event, payload);
  },
};

export default eventBus;
