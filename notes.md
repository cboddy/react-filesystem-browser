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

    make grid-veiw onclicks more specific

    make list-view row header onclicks  more specific
    
    have toggle for grid/list view in bar

    implmenet forwardbutton  behaviour

    server todo:
        login management 

        cookie management

        security 
        
        specifiy address/port/root-dir

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



