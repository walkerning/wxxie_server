// if (process.env.NODE_ENV == "development") {
//   module.exports = {
//     connection: {
//       user: "guest",
//       pass: "guest",
//       host: "127.0.0.1",
//       port: 5672,
//       vhost: "dev",
//       heartbeat: 30
//     },
//     exchanges: [
//       {
//         name: "ex.wxxie.1",
//         type: "direct",
//         autoDelete: false,
//         durable: true
//       }],
//     queues: [
//       {
//         name: "q.wxxie.1",
//         durable: true,
//         subscribe: false, // do not subscribe on this queue as it"s for workers to consume
//         limit: 100, // max number of unacked messages allowd for consumer
//         queueLimit: 1000 // max number of ready messages a queue can hold
//       }
//     ],
//     bindings: [
//       {
//         exchange: "ex.wxxie.1",
//         target: "q.wxxie.1",
//         keys: [ "" ]
//       }
//     ]
//   }
// } else if (process.env.NODE_ENV == "test") {
//   module.exports = {
//     connection: {
//       user: "guest",
//       pass: "guest",
//       host: "127.0.0.1",
//       port: 5672,
//       vhost: "test",
//       heartbeat: 30
//     },
//     exchanges: [
//       {
//         name: "ex.wxxie.1",
//         type: "direct",
//         autoDelete: false,
//         durable: true
//       }],
//     queues: [
//       {
//         name: "q.wxxie.1",
//         durable: true,
//         subscribe: false, // do not subscribe on this queue as it"s for workers to consume
//         limit: 100, // max number of unacked messages allowd for consumer
//         queueLimit: 1000 // max number of ready messages a queue can hold
//       }
//     ],
//     bindings: [
//       {
//         exchange: "ex.wxxie.1",
//         target: "q.wxxie.1",
//         keys: [ "" ]
//       }
//     ]
//   }
// } else {
module.exports = {
  connection: {
    user: process.env.RABBITMQ_DEFAULT_USER,
    pass: process.env.RABBITMQ_DEFAULT_PASS,
    host: process.env.RABBITMQ_HOST || "127.0.0.1",
    port: 5672,
    vhost: process.env.RABBITMQ_DEFAULT_VHOST,
    heartbeat: 30
  },
  exchanges: [
    {
      name: "ex.wxxie.1",
      type: "direct",
      autoDelete: false,
      durable: true
    }],
  queues: [
    {
      name: "q.wxxie.1",
      durable: true,
      subscribe: false, // do not subscribe on this queue as it"s for workers to consume
      limit: 100, // max number of unacked messages allowd for consumer
      queueLimit: 1000 // max number of ready messages a queue can hold
    }
  ],
  bindings: [
    {
      exchange: "ex.wxxie.1",
      target: "q.wxxie.1",
      keys: [ "" ]
    }
  ]
}

