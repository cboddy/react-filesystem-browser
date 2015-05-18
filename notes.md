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
    Make table pretty
        sort by cols, re-render
        dir on click
            reload with new path
        file on click
            download
        
        inverse sort on cols
        up button
        download file
        upload file

    nav-bar
        back button
        upload
        parent dir

    poll for updates


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



