const glob = require("glob");
const request = require("request");
const base64 = require("file-base64");
const path = require("path");
request.debug = false;

const DD_API = "http://localhost:9999/predict";
const ES_API = "http://localhost:9200/images/_bulk";
const INPUT_DIRECTORY = "img/output";

glob(`${INPUT_DIRECTORY}/**/*.jpg`, (er, files) => {
  files.forEach(file => {
    const fileName = path.basename(file, path.extname(file));
    base64.encode(file, (err, data) => {
      request.post(
        {
          url: DD_API,
          json: {
            service: "ggnet",
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
                  url: ES_API,
                  http_method: "POST"
                }
              }
            },
            data: [data]
          }
        },
        (error, response, body) => {
          if (error) {
            console.log(error);
          }
          console.log("statusCode:", response && response.statusCode);
          if (body && "items" in body) {
            console.log(body.items);
          }
        }
      );
    });
  });
});
