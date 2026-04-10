const logger = {
  info(data) {
    console.log(JSON.stringify({ level: 'info', ...data, timestamp: new Date().toISOString() }));
  },

  error(data) {
    console.log(JSON.stringify({ level: 'error', ...data, timestamp: new Date().toISOString() }));
  },

  event(eventName, orderId, extra = {}) {
    console.log(`[EVENT] ${eventName} - OrderID: ${orderId}`);
    console.log(JSON.stringify({ level: 'info', event: eventName, orderId, ...extra, timestamp: new Date().toISOString() }));
  },
};

export default logger;
