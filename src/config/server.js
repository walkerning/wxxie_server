// Server configration for development
if (process.env.NODE_ENV == "development") {
  module.exports = {
    host: "0.0.0.0",
    port: 3002
  };
} else if (process.env.NODE_ENV == "test") {
  module.exports = {
    host: "0.0.0.0",
    port: 3000
  };
} else {
  module.exports = {
    host: "0.0.0.0",
    port: 3000
  };
}
