module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    // ### execute node scripts
    execute: {
      migration: {
        src: ["src/data/migration.js"]
      },
      remigration: {
        src: ["src/data/migration.js"],
        options: {
          args: ["--reinit"]
        }
      },
      initDb: {
        src: ["src/data/init/init*.js"]
      }
    },
    // ### run express server
    express: {
      dev: {
        options: {
          script: "src/devServer.js",
          node_env: "development"
        }
      },
      test: {
        options: {
          script: "src/devServer.js",
          node_env: "test"
        }
      },
      prod: {
        options: {
          script: "src/devServer.js",
          node_env: "production",
          background: true,
          serverreload: true
        }
      },
    },
    // ### watch file changes and run tasks
    watch: {
      express_dev: {
        files: [
          "src/*.js",
          "src/api/*.js",
          "src/models/*.js",
          "src/middlewares/*.js",
          "src/configs/*.js",
          "src/data/*.js"
        ],
        tasks: ["express:dev"],
        options: {
          spawn: false // Without this option specified express won't be reloaded
        }
      },
      express_test: {
        files: [
          "src/*.js",
          "src/api/*.js",
          "src/models/*.js",
          "src/middlewares/*.js",
          "src/configs/*.js",
          "src/data/*.js"
        ],
        tasks: ["express:test"],
        options: {
          spawn: false // Without this option specified express won't be reloaded
        }
      },
      express_prod: {
        files: [
          "src/*.js",
          "src/api/*.js",
          "src/models/*.js",
          "src/configs/*.js",
          "src/middlewares/*.js"
        ],
        tasks: ["express:prod"],
        options: {
          spawn: false // Without this option specified express won't be reloaded
        }
      }
    }
  });
  // Plugins
  // ### execute node scripts
  grunt.loadNpmTasks("grunt-execute");
  // ### run express server
  grunt.loadNpmTasks("grunt-express-server");
  // ### watch file changes and run tasks
  grunt.loadNpmTasks("grunt-contrib-watch");

  // Tasks
  grunt.registerTask("database", ["execute:migration", "execute:initDb"]);
  grunt.registerTask("remigration", ["execute:remigration"]);
  grunt.registerTask("initdb", ["execute:initDb"]);
  grunt.registerTask("dev", ["express:dev", "watch:express_dev"]);
  grunt.registerTask("test", ["express:test", "watch:express_test"]);
  grunt.registerTask("prod", ["express:prod", "watch:express_prod"]);
};
