const {
  presetSails,
  assert,
  specReporter,
  browserClient
} = require('preset-sails')
const { processCliArgs, configure, run } = require('@japa/runner')

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    plugins: [
      presetSails(),
      assert(),
      browserClient({
        contextOptions: {
          baseURL: 'http://localhost:3333'
        },
        runInSuites: ['e2e']
      })
    ],
    reporters: [specReporter()],
    importer: (filePath) => require(filePath),
    timeout: 50000,
    suites: [
      {
        name: 'e2e',
        files: ['tests/e2e/**/*.spec.js']
      },
      {
        name: 'unit',
        files: ['tests/unit/**/*.spec.js']
      }
    ]
  }
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
