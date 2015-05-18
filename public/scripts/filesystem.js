
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

function buildGetChildrenUrl(path) {
        return  "children?path="+path;
}

function buildGetContentUrl(path) {
        return "content?path="+path;
}

var FileList = React.createClass({
        getInitialState: function() {
                return {paths : ["/"],
                        files: [],
                        sort: File.pathSort};
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
                                    sort: this.state.sort});
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

    updateSort: function(sort) {
            var files  = this.state.files
                    var lastSort = this.state.sort;
                    if  (lastSort == sort)  
                            files = files.reverse();
                    else 
                            files = files.sort(sort);
                    
            this.setState({files: files, sort: sort,  paths: this.state.paths});
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
    render: function() {
            var files = this.state.files.map(function(f) {
                    var onClick = f.isdir ? function(event){
                            this.updatePath(f.path);
                    }.bind(this) :
                            function(event) {
                                    this.getContent(f.path);
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
