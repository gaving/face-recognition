## Face Detect

curl -XPOST "http://localhost:9999/predict" -d '{"service":"imageserv","parameters":{"mllib":{"gpu":true},"input":{"width":224,"height":224},"output":{"best":3,"template":"{{#body}} {{#predictions}} { \"index\": {\"_index\": \"images\", \"_type\":\"img\" } }\n {\"doc\": { \"uri\":\"{{uri}}\",\"categories\": [ {{#classes}} { \"category\":\"{{cat}}\",\"score\":{{prob}} } {{^last}},{{/last}}{{/classes}} ] } }\n {{/predictions}} {{/body}} }","network":{"url":"http://localhost:9200/images/_bulk","http_method":"POST"}}},"data":["http://i.ytimg.com/vi/0vxOhd4qlnA/maxresdefault.jpg","http://ak-hdl.buzzfed.com/static/enhanced/webdr05/2013/9/17/5/enhanced-buzz-1492-1379411828-15.jpg"]}'


Can't get resnet one working
Only ggnet (google net)

* Download ODS mugshots (node script)
* Serialize to base64 and pump them into DD + ES (bulk api)
* Service to show the mugshot via HTTP (for links)


# Installation


docker run -p 9200:9200 -p 9300:9300 elasticsearch -Enetwork.bind_host=0.0.0.0 -Ehttp.cors.enabled=true -Ehttp.cors.allow-origin="*" 

docker run -p 9999:8080 --name dd beniz/deepdetect_cpu


http DELETE :9200/images
http GET :9200/images/_search\?q=sunglasses


curl -X PUT "http://localhost:9999/services/ggnet" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\"},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/ggnet/\"}}"


curl -X PUT "http://localhost:9999/services/resnet" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\",\"width\":224,\"height\":224},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/resnet_50/\"}}"


curl -X PUT "http://localhost:9999/services/gender" -d '{"mllib":"caffe","description":"gender classification","type":"supervised","parameters":{"input":{"connector":"image","height":224,"width":224},"mllib":{"nclasses":2}},"model":{"repository":"/opt/models/gender"}}'

https://stackoverflow.com/questions/26258292/querystring-search-on-array-elements-in-elastic-search

https://medium.com/@ageitgey/machine-learning-is-fun-part-4-modern-face-recognition-with-deep-learning-c3cffc121d78