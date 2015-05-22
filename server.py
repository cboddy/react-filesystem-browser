import os, os.path, json, shutil, functools, argparse, traceback
from flask import Flask, Response, request, jsonify, send_file,  session
from werkzeug import secure_filename 
from werkzeug.exceptions import abort

app = Flask(__name__, static_url_path='', static_folder='public')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))

def toLocalPath(path):
    fsPath  =  os.path.realpath(os.path.join(app.root, path))
    if os.path.commonprefix([app.root, fsPath]) != app.root:
        raise Exception("Unsafe path "+ fsPath+" is not a  sub-path  of root "+ app.root)
    return fsPath

def with_login(f):
    @functools.wraps(f)
    def wrapper(*args, **kwds):
        if not "username" in session:
            return json.dumps({"status": "error", "message": "Please log in."})
        request.username = session["username"]
        return f(*args, **kwds)
    return wrapper

def with_path(f):
    @functools.wraps(f)
    def wrapper(*args, **kwds):
        try :
            p = toLocalPath(request.args.get("path"))
            print(request.args.get("path"), p)
            request.norm_path = p 
        except: 
            print(traceback.format_exc())
        return f(*args, **kwds)
    return wrapper

def toPath(p):
    return {"path": os.path.relpath(p, app.root),
            "name": os.path.basename(p),
            "time": os.path.getmtime(p),
            "isdir": os.path.isdir(p),
            "size":os.path.getsize(p)}
  
@app.route("/login", methods=['POST'])
def login():
    params = request.get_json(force=True)
    username = params["username"]
    password = params["password"]
    if password != app.password:
        abort(404)
    session["username"] = username
    return jsonify({"status":"success"})

@app.route("/content")
@with_path
@with_login
def get_content():
    p = request.norm_path
    name = os.path.basename(p)
    
    return send_file(p, 
            attachment_filename=name,
            as_attachment=True)

@app.route("/parent")
@with_path
@with_login
def get_parent():
    p = request.norm_path 
    if p == app.root:
        parent = p
    else:
        parent = os.path.dirname(p)

    return jsonify(toPath(parent))

@app.route("/remove")
@with_path
@with_login
def remove():
    p = request.norm_path 
    if os.path.isdir(p):
        shutil.rmtree(p)
    else:
        os.remove(p)
    return jsonify({"status":"success"})

@app.route("/rename")
@with_path
@with_login
def rename():
    p = request.norm_path
    
    name = request.args.get("name")
    parent = os.path.dirname(p)
    updated = os.path.join(parent, name)
    os.rename(p, updated)
    return jsonify({"status":"success"})

@app.route("/children")
@with_login
@with_path
def get_children():
    p = request.norm_path
    children = map(lambda x : toPath(os.path.join(p, x)), os.listdir(p))
    return jsonify({"path": p,
                    "children": children})

@app.route("/upload", methods=['POST'])
@with_path
@with_login
def upload_file():
    path = request.norm_path
    name = request.args.get("name")
    uploaded = request.files["file"]
    uploadedPath = os.path.join(path, name)
    uploaded.save(uploadedPath)
    return jsonify({"status":"success"})

@app.route("/mkdir")
@with_path
@with_login
def mkdir():
    path = request.norm_path
    name = request.args.get("name")
    os.mkdir(os.path.join(path, name))
    return jsonify({"status":"success"})

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Remote filesystem server.')
    parser.add_argument('-root', type=str, required=True , help='root directory of filesystem accessible.')
    parser.add_argument('-host', type=str, default="0.0.0.0", help='server host to listen on.')
    parser.add_argument('-port', type=int, default=3000, help='server port to listen on.')
    parser.add_argument('-password', type=str, default="PeergosRules!", help='client authentication password.')
    parser.add_argument('-debug', type=bool, default=True, help='debug mode enabled.')
    args = parser.parse_args()
    app.root = os.path.realpath(args.root)
    print("Filesystem root "+ app.root)
    app.debug = args.debug 
    app.password = args.password
    app.secret_key = os.urandom(24)
    app.run(host= args.host ,port=args.port)
