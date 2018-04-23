var _ = require("lodash");
var pv = require('password-validator');
var passwordValidator = new pv();

passwordValidator
  .isMin(8)
  .isMax(30)
  .not().spaces();
  //.has().digits()
  //.has().letters()

var lowercase = 'abcdefghijklmnopqrstuvwxyz';
var uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var numbers = '0123456789';
var allLetters = lowercase + uppercase + numbers;

passwordGenerator = {
  generate: function generate(options) {
    // default length = 16
    options = _.merge({
      length: 16
    }, options);
    var len = allLetters.length;
    var pass = "";
    for (var i = 0; i < options.length; i++) {
      pass += allLetters[Math.floor(Math.random() * len)];
    }
    return pass;
  }
};

module.exports = {
  passwordValidator: passwordValidator,
  passwordGenerator: passwordGenerator
};
