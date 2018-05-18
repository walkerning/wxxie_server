// if (process.env.NODE_ENV == "development") {
//   module.exports = {
//     client: "mysql",
//     connection: {
//       host: "127.0.0.1",
//       user: "test_wxxie_user",
//       password: "12345678",
//       database: "dev_wxxie_database",
//       charset: "utf8"
//     }
//     // use default pool configuration for now...
//     // pool: {
//     // }
//   };
// } else if (process.env.NODE_ENV == "test") {
//     module.exports = {
//     client: "mysql",
//     connection: {
//       host: "127.0.0.1",
//       user: "test_wxxie_user",
//       password: "12345678",
//       database: "test_wxxie_database",
//       charset: "utf8"
//     }
//   };
// } else {
module.exports = {
  client: "mysql",
  connection: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: "utf8"
  }
};
