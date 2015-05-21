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

    add path to navbar
    
    file entrys go to names

    Make table pretty
        up button
        download file
        upload file
        
        remember context on back
        
        navbar with glypth icons
            back, forward, rename, delete
        
        glyphs on table header 
        
        pretty print file size
        
        glyphs on rows for folders / files
    nav-bar
        back button
        upload
        parent dir

    poll for updates

    add context menus:
        folder / file:
            rename
            delete

    navbar:
        no collapse of nav buttons

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



