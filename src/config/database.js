if (process.env.NODE_ENV == "development") {
  module.exports = {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: "test_wxxie_user",
      password: "12345678",
      database: "test_wxxie_database",
      charset: "utf8"
    }
  };
} else {
  module.exports = {
    client: "mysql",
    connection: {
      host: "127.0.0.1",
      user: process.env.WXXIE_USER_NAME,
      password: process.env.WXXIE_PASSWORD,
      database: process.env.WXXIE_DATABASE,
      charset: "utf8"
    }
  };
}
