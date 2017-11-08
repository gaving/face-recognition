## Face Search With Deep Detect

Search for faces matching a model.

Part of [Face Recognition with Deep Detect]( http://gavin.coffee/2017/11/04/face-recognition) series.

Preconfigured with `vgg_face` dataset.

Terminology:-

* 'Face Detection' - Detect faces in the image
* 'Face Recognition' - Take an input and recognise a person based on a trained model
* 'DeepDetect' - Object detection framework with RESTful API

## Available Models

* Clothing
* Gender
* Age
* Objects
* Emotion

# Installation

## Run a Elastic Search instance

```
docker run -p 9200:9200 -p 9300:9300 elasticsearch -Enetwork.bind_host=0.0.0.0 -Ehttp.cors.enabled=true -Ehttp.cors.allow-origin="*" 
````

## Run a Deep Detect instance

```
docker run -p 9999:8080 --name dd beniz/deepdetect_cpu
```

## Other Models

Copy over any models you want to use:-

***Note: Using docker volumes causes issues if training images.***

```
docker cp <model> dd:/opt/models/
```

## Create Google Net Service

```
curl -X PUT "http://localhost:9999/services/ggnet" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\"},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/ggnet/\"}}"
```

## Create Emotion Service

```
curl -X PUT "http://localhost:9999/services/emotion" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\"},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/emotion/\"}}"
```

## Create Residual Network Service

```
curl -X PUT "http://localhost:9999/services/resnet" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\",\"width\":224,\"height\":224},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/resnet_50/\"}}"
```

## Create Gender Service

```
curl -X PUT "http://localhost:9999/services/gender" -d '{"mllib":"caffe","description":"gender classification","type":"supervised","parameters":{"input":{"connector":"image","height":224,"width":224},"mllib":{"nclasses":2}},"model":{"repository":"/opt/models/gender"}}'
```

## Other Models

Copy over any models to docker container:

```
docker cp <model> dd:/opt/models
```

Issue correct PUT JSON to service end point to load correct model.

---

## Bulk Load Images

First we need to load the images into Elastic Search via Deep Detect.

Execute these in order:-

### Fetch

* `util/fetch.py` - Download ODS mugshots to disk

### Create Raw Field For Elastic Search

```
curl -X PUT "http://localhost:9200/images" -d '{ "mappings": { "img": { "properties": { "doc": { "properties": { "categories": { "properties": { "category": { "fields": { "keyword": { "ignore_above": 256, "type": "keyword" }, "raw": { "type":  "string", "index": "not_analyzed" } }, "type": "text" }, "score": { "type": "float" } } }, "sourceKey": { "fields": { "keyword": { "ignore_above": 256, "type": "keyword" } }, "type": "text" } } } } } } }'
```

### Load

* `util/load.js` - Load mugshots from disk into ElasticSearch via DD predict (base64 encodes each image)

### Serve 

* `util/server.py` - Serve the mugshot via HTTP from ODS (for links)

Mugshots can be deleted when indexed.

## Run Front-End

* `yarn`
* `yarn start`

## Notes

* `http DELETE :9200/images` - Delete Index
* `http GET :9200/images/_search?q=Usain` - Search Index

* Can't seem to get Resnet service working
* http://www.robots.ox.ac.uk/~vgg/software/vgg_face/

# Elasticsearch Queries

## Example fetch of category between score

```javascript
GET _search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "doc.categories.category": "Alexz Johnson"
          }
        }
      ],
      "must_not": {
        "range": {
          "doc.categories.score": {
            "gte": 0.2,
            "lte": 0.5
          }
        }
      }
    }
  }
}
```


# Resources

https://medium.com/@ageitgey/machine-learning-is-fun-part-4-modern-face-recognition-with-deep-learning-c3cffc121d78