## iDebugConsole

A compact javascript console wrapper allowing for fine gained control over console output globally and 
within closures as required.  An optional output overlay window is provided as well.  The overlay is 
especially helpful on devices without a console window or when you do not require the full feature set 
of the native browser consoles.  Finally a handy decorator for profiling overall javascript code execution 
and individual components.

All that utility at just 0.309kb minified in a production environment and under 12kb minified 
in development.

#### Demo http://codepen.io/arctelix/pen/PNLZGO

Keep in mind the codepen demo will not show the correct line numbers, but your documents will

#### Requirements:

If you want to use the output window, the .js files from the flowing repos are required: 

- https://github.com/arctelix/drag-resize-snap
- https://github.com/arctelix/vanillaHelper


#### Installation:

Downland required files manually or with bower: 
    
    bower install idebug-console
    
Add the required files to your project's html
    
    <head>
        <link rel="stylesheet" type="text/css" href="static/css/iDebugConsole.css" />
    </head>
    <body>
        <script src="static/js/dragResizeSnap.js"></script>
        <script src="static/js/components/vanillaHelper.js"></script>
        <script src="static/js/iDebugConsole.js"></script>
    </body>
    
Alternatively load it from GitCdn:

    <head>
        <link rel="stylesheet" type="text/css" href="https://cdn.gitcdn.link/repo/arctelix/vanillaHelper/master/dist/iDebugConsole.css" />
    </head>
    <body>
        <script src="https://cdn.gitcdn.link/repo/arctelix/vanillaHelper/master/dist/vanillaHelper.js"></script>
        <script src="https://cdn.gitcdn.link/repo/arctelix/drag-resize-snap/master/dist/drs.js"></script>
        <script src="https://cdn.gitcdn.link/repo/arctelix/iDebugConsole/master/dist/iDebugConsole.js"></script>
    </body>
    
NOTE: You can substitute `master` for a commit hash or version tag in your gitcdn urls

    <script src="https://cdn.gitcdn.link/repo/arctelix/iDebugConsole/v0.1.1/dist/iDebugConsole.js"></script>
    
#### See the docs for details.
