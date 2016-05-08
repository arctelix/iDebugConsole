# iDebugConsole

A compact javscript console wrapper with a debug switch and a compact output window that won't
slow you down.  Also includes a handy site profileing decorator.

The primary purpose is to provide a means for controlling console output globally and within
closures as required.  An optional output window is provided as well.  This is helpful for
devices without a console window or when you do not require the full feature set of the native
browser consoles.  Finally a handy profiler for profiling javascript code execution and individual
components.

All that utility at just 0.309kb minified in a production environment and under 12kb minified
in development.

#### Requirements:
If you want to use the output window the following files are required:

- https://github.com/arctelix/drag-resize-snap/blob/master/drs.js
- https://github.com/arctelix/vanillaHelper/blob/master/dist/vanillaHelper.js

#### License

iDebugConsole is distributed under the MIT license.

#### See the docs for more.
