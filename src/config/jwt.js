// if (process.env.NODE_ENV == "dev" || process.env.NODE_ENV == "test") {
//   module.exports = {
//     secret: new Buffer("D4ohKJe8o0HOTpr8yNiBCXEEWLT86uTDz4Ftfb1rzpY", "base64"),
//     issuer: "theVeryFoxfiNing",
//     requestProperty: "auth",
//     expiresIn: 60 * 60 * 6

//   };
// } else {
module.exports = {
  secret: new Buffer(process.env.WXXIE_JWT_SECRET, "base64"),
  issuer: process.env.WXXIE_JWT_ISSUER,
  requestProperty: "auth",
  expiresIn: 60 * 60
};
//}
