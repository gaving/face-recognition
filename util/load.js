const glob = require("glob");
const request = require("request");
const base64 = require("file-base64");
const path = require("path");
const chalk = require("chalk");
const util = require("util");
const Confirm = require("prompt-confirm");

request.debug = false; // Enable this for DD request debugging

(async () => {
  const prompt = new Confirm(
    "This will re-create your index. Do you wish to continue?"
  );
  const answer = await prompt.run();
  if (!answer) {
    return;
  }

  const {
    LOAD_DD_API,
    LOAD_ES_API,
    LOAD_INPUT_DIRECTORY
  } = require("./config.json");

  console.log(chalk.blue("Deleting Index"));
  request.del(LOAD_ES_API, {}, (error, response, body) => {
    if (error) {
      console.log(error);
    }
  });

  console.log(chalk.blue("Creating ES mapping.."));
  request.put(
    {
      url: LOAD_ES_API,
      json: {
        mappings: {
          img: {
            properties: {
              doc: {
                properties: {
                  categories: {
                    properties: {
                      category: {
                        fields: {
                          keyword: { ignore_above: 256, type: "keyword" },
                          raw: { type: "string", index: "not_analyzed" }
                        },
                        type: "text"
                      },
                      score: { type: "float" }
                    }
                  },
                  sourceKey: {
                    fields: { keyword: { ignore_above: 256, type: "keyword" } },
                    type: "text"
                  }
                }
              }
            }
          }
        }
      }
    },
    (error, response, body) => {
      if (error) {
        console.log(error);
      }
    }
  );

  console.log(chalk.green("Importing images.."));
  glob(`${LOAD_INPUT_DIRECTORY}/**/*.jpg`, (er, files) => {
    files.forEach(file => {
      const fileName = path.basename(file, path.extname(file));
      base64.encode(file, (err, data) => {
        request.post(
          {
            url: `${LOAD_DD_API}/_bulk`,
            json: {
              service: "face",
              parameters: {
                mllib: {
                  gpu: true
                },
                input: {
                  width: 224,
                  height: 224
                },
                output: {
                  best: 10,
                  template:
                    '{{#body}} {{#predictions}} { "index": {"_index": "images", "_type":"img" } }\n {"doc": { "sourceKey":"' +
                    fileName +
                    '","categories": [ {{#classes}} { "category":"{{cat}}","score":{{prob}} } {{^last}},{{/last}}{{/classes}} ] } }\n {{/predictions}} {{/body}} }',
                  network: {
                    url: `${LOAD_ES_API}/_bulk`,
                    http_method: "POST"
                  }
                }
              },
              data: [data]
            }
          },
          (error, response, body) => {
            if (error) {
              console.log("statusCode:", response && response.statusCode);
              console.log(error);
            }
            if (body && "items" in body) {
              console.log(chalk.blue("Submitted"));
              console.log(chalk.green(util.inspect(body.items, false, null)));
            }
          }
        );
      });
    });
  });
})();
