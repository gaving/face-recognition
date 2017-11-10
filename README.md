# Face Recognition

(Part of the [Face Recognition with Deep
Detect](http://gavin.coffee/2017/11/04/face-recognition) series.)

An interface for finding images within a category matching a pre-configured
model.

Developed with pictures of faces in mind and preconfigured with the
`vgg_face` model (trained on [LFW](http://vis-www.cs.umass.edu/lfw/)), but
could be used for any model and associated categories.

![screen](site/1.png)

## Installation

See the below steps for getting up and running.

### Run a DD instance

Start a DD instance for predicting our images:-

```
docker run -p 8080:8080 --name dd beniz/deepdetect_cpu
```

### Run a ES instance

Start a ES instance which indexes our DD results:-

```
docker run -p 9200:9200 -p 9300:9300 elasticsearch
-Enetwork.bind_host=0.0.0.0 -Ehttp.cors.enabled=true
-Ehttp.cors.allow-origin="*"
```

### Create Classification Service

Follow the steps on [Face Recognition with Deep
Detect](http://gavin.coffee/2017/11/04/face-recognition/) up until the
"Providing Inputs" section.

This will create a face classification service for DD.

## Preparing Your Data

Next we need to download and load our images into ES via DD.

Execute these in order:-

### Configure

Copy `util/config.json.example` to `util/config.json` and configure the
example parameters, pointing to directories for the images etc.

### Load

`load.js` is the tool for loading the images into ES via DD (base64 encodes
each image for submission).

### Serve 

`serve-file.py` provides a web server for serving up the images for the
front-end from disk.

## Launch front-end

### Configure .env

* `REACT_APP_API_URL` - Path to ES API (http://localhost:9500 passed through to
http://localhost:9200/ by `proxy` in package.json for development).
* `REACT_APP_IMG_URL` - Path to serve service (http://localhost:9000)
* `PORT` - The port to serve the front-end on. (9500)

### Build + Run Front-End

* `yarn`
* `yarn start`

The front-end should now be running on your configured port.

Launch http://localhost:9500/ and try some searches!

See [further](FURTHER.md) for other random information.