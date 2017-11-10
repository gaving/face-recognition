## Face Search With Deep Detect

An interface for finding images matching a pre-configured model.

Part of [Face Recognition with Deep Detect](http://gavin.coffee/2017/11/04/face-recognition) series.

This works best with pictures of faces and preconfigured with the `vgg_face` model trained on LFW, but could be used for any model and associated categories.

# Installation

See the below steps for getting up and running.

## Run a Deep Detect instance

Start a Deep Detect instance for predicting our images:-

```
docker run -p 8080:8080 --name dd beniz/deepdetect_cpu
```

## Run a Elastic Search instance

Start an Elastic Search instance which indexes our DD results:-

```
docker run -p 9200:9200 -p 9300:9300 elasticsearch -Enetwork.bind_host=0.0.0.0 -Ehttp.cors.enabled=true -Ehttp.cors.allow-origin="*" 
````

## Create Classification Service

Follow the steps on [Face Recognition with Deep Detect](http://gavin.coffee/2017/11/04/face-recognition/)  up until the "Create Classification Service" section.

This will create a face classification service for DD.

## Preparing Your Data

Next we need to download and load our images into Elastic Search via Deep Detect.

Execute these in order depending on your use case:-

### Configure

Copy `util/config.json.example` to `util/config.json` and configure the example parameters.

### Fetch (Optional)

This step is optional depending on how your images are sourced. In this instance the images are pulled from an Oracle database.

* `util/fetch.py` - Download mugshots to disk

If you already have a folder of images, skip to the next section.

### Load

`load.js` is the tool for loading the images into ES via DD.

* `util/load.js` - Load images from disk into ElasticSearch via DD predict calls (base64 encodes each image for submission).

### Serve 

`serve.py` provides a web server for serving up the images for the front-end.

***TODO: Write a simpler for serving from disk***

* `util/serve.py` - Serve the mugshot via HTTP from ODS (for links)

## Configure .env

* `REACT_APP_API_URL` - Path to ES API (http://localhost:9500 passed through to http://localhost:9200/ by `proxy` in package.json for development).
* `REACT_APP_IMG_URL` - Path to serve service (http://localhost:9000)
* `PORT` - The port to serve the front-end on. (9500)

## Build + Run Front-End

* `yarn`
* `yarn start`

The front-end should now be running on your configured port.

Launch http://localhost:9500/ and try some searches!

See [Further](FURTHER.md) for other random information.

# Resources

https://medium.com/@ageitgey/machine-learning-is-fun-part-4-modern-face-recognition-with-deep-learning-c3cffc121d78