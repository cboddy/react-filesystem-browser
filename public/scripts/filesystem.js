
var File = React.createClass({
        glyphClass: function() {
            var className = "glyphicon "; 
            className += this.props.isdir ? "glyphicon-folder-open" : "glyphicon-file";
            return className;
        },
        
        renderGrid: function() {
            var glyphClass = this.glyphClass();
            return (<div onClick={this.props.onClick} ref={this.props.path} className="col-xs-6 col-md-3">
                            <a>
                                <span style={{fontSize:"3.5em"}} className={glyphClass}/>
                            </a>
                            <div className="caption">
                                <h4>{this.props.name}</h4>
                            </div>
                        </div>)

        },
       
        onRemove: function(evt) {
                var type = this.props.isdir ? "folder" : "file";
                var remove = confirm("Remove "+type +" '"+ this.props.path +"' ?");
                if (remove) {
                   evt.props = this.props;
                   evt.action = "remove";
                }
        },
       
        onRename: function(evt) {
                var type = this.props.isdir ? "folder" : "file";
                var updatedName = prompt("Enter new name for "+type +" "+this.props.name);
                if (updatedName != null) {
                   evt.props = this.props;
                   evt.action = "rename";
                   evt.updatedName = updatedName;
                }
        },

        renderList: function() {
                var dateString =  new Date(this.props.time*1000).toGMTString()
                var glyphClass = this.glyphClass();
                var spanStyle = {fontSize:"1.5em"}; 
                return (<tr id={this.props.path} ref={this.props.path}>
                            <td>
                                <a onClick={this.props.onClick}><span style={{fontSize:"1.5em", paddingRight:"10px"}} className={glyphClass}/>{this.props.name}</a>
                                </td>
                            <td>{File.sizeString(this.props.size)}</td>
                            <td>{dateString}</td>
                        
                            <td><a onClick={this.onRename}><span style={spanStyle} className="glyphicon glyphicon-font"/></a></td>
                            <td><a onClick={this.onRemove}><span style={spanStyle} className="glyphicon glyphicon-remove"/></a></td>
                        </tr>);
        },
        
        render: function() {
                return this.props.gridView ? this.renderGrid() : this.renderList();
        }
});

File.timeSort = function(left, right){return left.time - right.time;} 

File.sizeSort = function(left, right){return left.size - right.size;} 

File.pathSort = function(left, right){return left.path.localeCompare(right.path);} 

File.sizes = [{count : 1, unit:"bytes"}, {count : 1024, unit: "kB"}, {count: 1048576 , unit : "MB"}, {count: 1073741824, unit:"GB" } ]

File.sizeString =  function(sizeBytes){
        var iUnit=0;
        var count=0;
        for (iUnit=0; iUnit < File.sizes.length;iUnit++) {
                count = sizeBytes / File.sizes[iUnit].count;
                if (count < 1024)
                        break;
        }
        return "" + (count|0) +" "+ File.sizes[iUnit].unit;   
}

function buildGetChildrenUrl(path) {
        return  "children?path="+path;
}

function buildGetParentUrl(path) {
        return  "parent?path="+path;
}

function buildRenameUrl(path, name) {
        return  "rename?path="+path+"&name="+name;
}

function buildRemoveUrl(path) {
        return  "remove?path="+path;
}
function buildGetContentUrl(path) {
        return "content?path="+path;
}

function buildUploadUrl(path, name) {
        return "upload?path="+path+"&name="+name;
}

function getParent(path, onSuccess) {
            $.ajax({
                    url: buildGetParentUrl(path),
            dataType: 'json',
            cache: false,
            success: onSuccess,
            error: function(xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
            }.bind(this)
            });
}

function updateNavbarPath(path) {
    var elem  = document.getElementById("pathSpan");
    elem.innerHTML = '<span class="glyphicon glyphicon-chevron-right"/>' +path;
}

var FileList = React.createClass({
        getInitialState: function() {
                return {paths : ["/"],
                        files: [],
                        sort: File.pathSort,
                        gridView: true};
        },

    loadFilesFromServer: function(path) {
            $.ajax({
                    url: buildGetChildrenUrl(path),
            dataType: 'json',
            cache: false,
            success: function(data) {
                    var files = data.children.sort(this.state.sort);
                    var paths = this.state.paths; 
                    if (paths[paths.length-1] != path)
                    paths = paths.concat([path]) 
                    this.setState(
                            {files: files, 
                                    paths: paths,
                            sort: this.state.sort,
                            gridView: this.state.gridView});
                    updateNavbarPath(this.currentPath());
            }.bind(this),
            error: function(xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
            }.bind(this)
            });
    },

    reloadFilesFromServer: function() {this.loadFilesFromServer(this.currentPath())},

    currentPath : function() {
            return this.state.paths[this.state.paths.length-1]
    },

    onBack : function() {
            if (this.state.paths.length <2) {
                    alert("Cannot go back from "+ this.currentPath());
                    return;
            }
            this.state.paths = this.state.paths.slice(0,-1);
            this.loadFilesFromServer(this.currentPath());
    },

    onUpload: function() {
            $('#uploadInput').click();
    },

    onParent: function() {
            var onSuccess = function(data) {
                var parentPath = data.path;
                this.updatePath(parentPath);
            }.bind(this);
            getParent(this.currentPath(), onSuccess);
    },
    
    alternateView: function() {
            var updatedView = !  this.state.gridView;
            
            this.setState({files: this.state.files, 
                    sort: this.state.sort,  
                    paths: this.state.paths, 
                    gridView: updatedView});
    },


    uploadFile: function() {
            return function (evt) {
                    var path = this.currentPath();
                    var readFile = evt.target.files[0];
                    var name = readFile.name;
                    console.log(readFile);

                    var formData = new FormData();
                    formData.append("file", readFile, name);

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', buildUploadUrl(path, name) , true);
                    xhr.onreadystatechange=function()
                    {
                            if (xhr.readyState != 4)
                                    return;

                            if (xhr.status == 200){ 
                                    alert("Successfully uploaded file "+ name +" to "+ path); 
                                    this.loadFilesFromServer(path);
                            }
                            else
                                    console.log(request.status);
                    };
                    xhr.send(formData);
            }.bind(this)
    },

    componentDidMount: function() {
            var path = this.currentPath();
            this.loadFilesFromServer(path);
            var backButton = document.getElementById("backButton");
                    backButton.onclick = this.onBack;
            var uploadButton = document.getElementById("uploadButton");
                    uploadButton.onclick = this.onUpload;
            var parentButton = document.getElementById("parentButton");
                    parentButton.onclick = this.onParent;
            var uploadInput = document.getElementById("uploadInput"); 
                    uploadInput.addEventListener("change", this.uploadFile(), false);
            var alternateViewButton = document.getElementById("alternateViewButton"); 
            alternateViewButton.onclick = this.alternateView; 
    },

    updateSort: function(sort) {
            var files  = this.state.files
                    var lastSort = this.state.sort;
            if  (lastSort == sort)  
                    files = files.reverse();
            else 
                    files = files.sort(sort);

            this.setState({files: files, sort: sort,  paths: this.state.paths, gridView: this.state.gridView});
    },

    timeSort: function() {
            this.updateSort(File.timeSort);
    },
    pathSort: function() {
            this.updateSort(File.pathSort);
    },
    sizeSort: function() {
            this.updateSort(File.sizeSort);
    },
    updatePath: function(path) {
            this.loadFilesFromServer(path);
    },
    getContent: function(path) {
            var url = buildGetContentUrl(path);
            location.href=url;
    },
   
    remove: function(path) {
            $.ajax({
                    url: buildRemoveUrl(path),
            dataType: 'json',
            cache: false,
            success: this.reloadFilesFromServer,
            error: function(xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
            }.bind(this)
            });
    },

    rename: function(path, updatedName) {
            $.ajax({
                    url: buildRenameUrl(path,  updatedName),//TODO
            dataType: 'json',
            cache: false,
            success: this.reloadFilesFromServer,
            error: function(xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
            }.bind(this)
            });

    },

    onListClick: function(evt) {
            //console.log("click in table for " + JSON.stringify(evt.props));
            if (evt.action == "remove") 
                this.remove(evt.props.path);
            else if (evt.action == "rename")
                this.rename(evt.props.path, evt.updatedName);
            else
                console.log("Warning, unknown action "+ evt.action);
    },
    render: function() {
            var files = this.state.files.map(function(f) {
                    var onClick = f.isdir ? function(event){
                            this.updatePath(f.path);
                    }.bind(this) :
                            function(event) {
                                    this.getContent(f.path);
                            }.bind(this)
                            return (<File gridView={this.state.gridView} onClick={onClick} path={f.path} name={f.name} isdir={f.isdir} size={f.size} time={f.time}/>)
            }.bind(this));

            var gridGlyph = "glyphicon glyphicon-th-large";
            var listGlyph = "glyphicon glyphicon-list";
            var element = document.getElementById("altViewSpan");
            var className = this.state.gridView ? listGlyph : gridGlyph;
            element.className = className;
            
            if (this.state.gridView) 
                return (<div>{files}</div>)

            var sortGlyph = "glyphicon glyphicon-sort";
            
            return (<table onClick={this.onListClick}  className="table table-responsive table-striped table-hover">
                            <thead><tr>
                            <th onClick={this.pathSort}><button className="btn btn-default"><span className={sortGlyph}/>Path</button></th>
                            <th onClick={this.sizeSort}><button className="btn btn-default"><span className={sortGlyph}/>Size</button></th>
                            <th onClick={this.timeSort}><button className="btn btn-default"><span className={sortGlyph}/>Last modified time</button></th>
                            <th/><th/>
                            </tr></thead>
                            <tbody>
                            {files}
                            </tbody>
                            </table>)
    }
});

React.render(
                <FileList/>,
                document.getElementById('content')
            );
