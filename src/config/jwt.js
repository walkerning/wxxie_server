if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test") {
  module.exports = {
    secret: new Buffer("YXZlcnlzZWNyZXRzZWNyZXQK", "base64"),
    issuer: "theVeryFoxfiNing",
    requestProperty: "auth"
  };
} else {
  module.exports = {
    secret: new Buffer(process.env.WXXIE_JWT_SECRET, "base64"),
    issuer: process.env.WXXIE_JWT_ISSUER,
    requestProperty: "auth"
  };
}
