from http.server import BaseHTTPRequestHandler, HTTPServer
import time
from urllib.parse import urlparse, parse_qs
import shutil
from socketserver import ThreadingMixIn
import click
import json

with open('config.json') as data_file:    
    config = json.load(data_file)

class ThreadingSimpleServer(ThreadingMixIn, HTTPServer):
    pass

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):

        parsed_path = urlparse(self.path)
        query = parse_qs(parsed_path.query)

        if not query:
            self.send_response(500)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            return

        image = query['image'][0]
        print(image)

        with open("{0}/{1}.jpg".format(config['LOAD_INPUT_DIRECTORY'], image), 'rb') as fh:
            self.send_response(200)
            self.send_header('Content-type', 'text/jpeg')
            self.end_headers()
            self.wfile.write(fh.read())

@click.command()
@click.option('--host', default=config['SERVE_HOST'], help='Host to serve from')
@click.option('--port', default=config['SERVE_PORT'], help='Port')
def main(host, port):
    myServer = ThreadingSimpleServer((host, port), MyServer)
    print(time.asctime(), "Server Starts - %s:%s" % (host, port))

    try:
        myServer.serve_forever()
    except KeyboardInterrupt:
        pass

    myServer.server_close()
    print(time.asctime(), "Server Stops - %s:%s" % (host, port))

if __name__ == "__main__":
    main()