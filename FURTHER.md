## Further

# Elasticsearch Queries

## Example fetch of category between a certain score

Launch sense:-

```
docker run -d -p 5601:5601 s12v/sense
```

Visit `http://localhost:5601/app/sense`:-

```json
GET _search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "doc.categories.category": "Emma Bunton"
          }
        },
        {
          "range": {
            "doc.categories.score": {
              "gte": 0.6,
              "lte": 1
            }
          }
        }
      ]
    }
  }
}
```

## Create Mapping

Shouldn't be required as handled by `load.js` above, but this can be used to create a non-indexed field for the category pane.

```json
PUT /images
{
  "mappings": {
    "img": {
      "properties": {
        "doc": {
          "properties": {
            "categories": {
              "properties": {
                "category": {
                  "fields": {
                    "keyword": {
                      "ignore_above": 256,
                      "type": "keyword"
                    },
                    "raw": {
                      "type": "string",
                      "index": "not_analyzed"
                    }
                  },
                  "type": "text"
                },
                "score": {
                  "type": "float"
                }
              }
            },
            "sourceKey": {
              "fields": {
                "keyword": {
                  "ignore_above": 256,
                  "type": "keyword"
                }
              },
              "type": "text"
            }
          }
        }
      }
    }
  }
}
```

## Available Models

There are various other models that can be used with Deep Detect:-

* Clothing
* Gender
* Age
* Face
* Objects
* Emotion

Copy over any models you want to use:-

***Note: Using docker volumes causes issues if training images.***

```
docker cp <model> dd:/opt/models/
```

### Create Google Net Service

```
curl -X PUT "http://localhost:9999/services/ggnet" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\"},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/ggnet/\"}}"
```

### Create Emotion Service

```
curl -X PUT "http://localhost:9999/services/emotion" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\"},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/emotion/\"}}"
```

### Create Residual Network Service

(Couldn't seem to get this one working)

```
curl -X PUT "http://localhost:9999/services/resnet" -d "{\"mllib\":\"caffe\",\"description\":\"image classification service\",\"type\":\"supervised\",\"parameters\":{\"input\":{\"connector\":\"image\",\"width\":224,\"height\":224},\"mllib\":{\"nclasses\":1000}},\"model\":{\"repository\":\"/opt/models/resnet_50/\"}}"
```

### Create Gender Service

```
curl -X PUT "http://localhost:9999/services/gender" -d '{"mllib":"caffe","description":"gender classification","type":"supervised","parameters":{"input":{"connector":"image","height":224,"width":224},"mllib":{"nclasses":2}},"model":{"repository":"/opt/models/gender"}}'
```