===== Filesystem Viewer App =====

Views 

-- grid view 
-- table view

component representing a path

on click:
    if file
        get content
    else
        update view with this directory content

fileComponent:
    isDir
    last-modified
    size
    path


TODO: 
    navbar:
        no collapse of nav buttons
        add onclick for path 

    have toggle for grid/list view in bar

    implmenet forwardbutton  behaviour

===== Server =====

Flask server showing stat info for path 

path:
    isDir
    last-modified-time
    size
    os.path.{getsize, isdir, getmtime}

API:
    getPath(path)
    getChildren(path)
    getContent(path)



