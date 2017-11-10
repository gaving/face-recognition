const glob = require("glob");
const request = require("request-promise");
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

  try {
    console.log(chalk.blue("Deleting Index.."));
    await request.del(LOAD_ES_API);
  } catch (error) {
    console.log(error);
  }

  console.log(chalk.blue("Creating ES mapping.."));
  await request.put({
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
  });

  console.log(chalk.green("Importing images.."));
  glob(`${LOAD_INPUT_DIRECTORY}/**/*.jpg`, async (er, files) => {
    for (let file of files) {
      const fileName = path.basename(file, path.extname(file));
      base64.encode(file, async (err, data) => {
        console.log(chalk.red(`${fileName}`));
        const response = await request.post({
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
        });
        console.log(chalk.blue("Submitted"));
        console.log(chalk.green(util.inspect(response.items, false, null)));
      });
    }
  });
})();
