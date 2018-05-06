if (process.env.NODE_ENV == "development") {
  module.exports = {
    connection: {
      user: "guest",
      pass: "guest",
      host: "localhost",
      port: 5672,
      vhost: "%2f",
      heartbeat: 30
    },
    exchanges: [
      {
        name: "ex.wxxie.dev.1",
        type: "direct",
        autoDelete: false,
        durable: true
      }],
    queues: [
      {
        name: "q.wxxie.dev.1",
        durable: true,
        subscribe: false, // do not subscribe on this queue as it"s for workers to consume
        limit: 100, // max number of unacked messages allowd for consumer
        queueLimit: 1000 // max number of ready messages a queue can hold
      }
    ],
    bindings: [
      {
        exchange: "ex.wxxie.dev.1",
        target: "q.wxxie.dev.1",
        keys: [ "" ]
      }
    ]
  }
} else if (process.env.NODE_ENV == "test") {
  module.exports = {
    connection: {
      user: "guest",
      pass: "guest",
      host: "localhost",
      port: 5672,
      vhost: "%2f",
      heartbeat: 30
    },
    exchanges: [
      {
        name: "ex.wxxie.debug.1",
        type: "direct",
        autoDelete: false,
        durable: true
      }],
    queues: [
      {
        name: "q.wxxie.debug.1",
        durable: true,
        subscribe: false, // do not subscribe on this queue as it"s for workers to consume
        limit: 100, // max number of unacked messages allowd for consumer
        queueLimit: 1000 // max number of ready messages a queue can hold
      }
    ],
    bindings: [
      {
        exchange: "ex.wxxie.debug.1",
        target: "q.wxxie.debug.1",
        keys: [ "" ]
      }
    ]
  }
} else {
  module.exports = {
    connection: {
      user: process.env.WXXIE_MQ_USER,
      pass: process.env.WXXIE_MQ_PASSWORD,
      host: "localhost",
      port: 5672,
      vhost: "%2f", // ?
      heartbeat: 30
    },
    exchanges: [
      {
        name: "ex.wxxie.deploy.1",
        type: "direct",
        autoDelete: false
      }],
    queues: [
      {
        name: "q.wxxie.deploy.1",
        durable: true,
        subscribe: false, // do not subscribe on this queue as it"s for workers to consume
        limit: 100, // max number of unacked messages allowd for consumer
        queueLimit: 1000 // max number of ready messages a queue can hold
      }
    ],
    bindings: [
      {
        exchange: "ex.wxxie.deploy.1",
        target: "q.wxxie.deploy.1",
        keys: [ "" ]
      }
    ]
  }
}
