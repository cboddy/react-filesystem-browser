import json
import os, os.path
from flask import Flask, Response, request, jsonify, send_file

app = Flask(__name__, static_url_path='', static_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))

def toPath(p):
    return {"path": p,
             "time": os.path.getmtime(p),
             "isdir": os.path.isdir(p),
             "size":os.path.getsize(p)}
  
@app.route("/stat")
def get_path():
    p = request.args.get("path")
    return jsonify(toPath(p))

@app.route("/content")
def get_content():
    p = request.args.get("path")
    name = os.path.basename(p)

    return send_file(p, 
            attachment_filename=name,
            as_attachment=True)
@app.route("/parent")
def get_parent():
    p = request.args.get("path")
    parent = os.path.dirname(p)
    return jsonify(toPath(parent))

@app.route("/children")
def get_children():
    p = request.args.get("path")
    children = map(lambda x : toPath(os.path.join(p, x)), os.listdir(p))
    return jsonify({"path": p,
                    "children": children})

@app.route("/upload", methods=['POST'])
def upload_file():
    path = request.args.get("path")
    name = request.args.get("name")
    uploaded = request.files["file"]
    uploadedPath = os.path.join(path, name)
    uploaded.save(uploadedPath)
    print("file uploaded to "+ uploadedPath)
    return jsonify({"status":"success"})

if __name__ == '__main__':
    app.debug = True
    app.run(port=int(os.environ.get("PORT",3000)))
