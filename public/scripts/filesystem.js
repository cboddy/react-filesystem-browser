
var File = React.createClass({
        render: function() {
                var dateString =  new Date(this.props.time*1000).toGMTString()
                var className = this.props.isdir ? "label-info" : "";
                return (<tr onClick={this.props.onClick} className={className} ref={this.props.path} >
                        <td>{this.props.path}</td>
                        <td>{this.props.size}</td>
                        <td>{dateString}</td>
                        </tr>);
        }
});

File.timeSort = function(left, right){return left.time - right.time;} 
File.sizeSort = function(left, right){return left.size - right.size;} 
File.pathSort = function(left, right){return left.path.localeCompare(right.path);} 
File.invert = function(sort) {return -1* sort();}

function buildUrl(path) {
    return  "children?path="+path;
}

var FileList = React.createClass({
        getInitialState: function() {
                return {paths : ["/"],
                        files: []};
        },

    loadFilesFromServer: function(path) {
            $.ajax({
                    url: buildUrl(path),
            dataType: 'json',
            cache: false,
            success: function(data) {
                    var files = data.children;
                    var paths = this.state.paths; 
                    if (paths[paths.length-1] != path)
                        paths = paths.concat([path]) 
                    this.setState({files: files, paths: paths});
            }.bind(this),
            error: function(xhr, status, err) {
                    console.error(this.props.url, status, err.toString());
            }.bind(this)
            });
    },
    
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

    },
    componentDidMount: function() {
            this.loadFilesFromServer(this.currentPath());
            var backButton = document.getElementById("backButton")
            backButton.onclick = this.onBack;
    },

    timeSort: function() {
            this.setState({files: this.state.files.sort(File.timeSort)});
    },
    pathSort: function() {
            this.setState({files: this.state.files.sort(File.pathSort)});
    },
    sizeSort: function() {
            this.setState({files: this.state.files.sort(File.sizeSort)});
    },
    updatePath: function(path) {
        this.loadFilesFromServer(path);
    },
    render: function() {
            var files = this.state.files.map(function(f) {
                    var onClick = function(event){
                            this.updatePath(f.path);
                    }.bind(this)
                    return (<File onClick={onClick} path={f.path} isdir={f.isdir} size={f.size} time={f.time}/>)
            }.bind(this));
            
            return (<table className="table table-responsive table-hover">
                            <thead><tr>
                            <th onClick={this.pathSort}>Path</th>
                            <th onClick={this.sizeSort}>Size</th>
                            <th onClick={this.timeSort}>Last modified time</th>
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
