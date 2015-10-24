console.log('-> testing4 iDebugConsole.js loading')
/**
 * Constructs Debugger instance
 * @class Add to any class constructor to provide easy control over console output of debug data.
 * All objects specified will have a debug() method created automagically.  this.debug() will call
 * debugger.out() in the context of the calling object.
 * @param   {object}    objects         - Specify included objects as {key:object} pairs.
 * @param   {boolean}   [state=false]   - Initial debug output state for all objects true=on false=off.
 * @example <caption>Instantiate new debugger in a class constructor.</caption>
 * function MyClass (){
 *     var ctrl = new Controller
 *     var model = new Model(ctrl)
 *     var view = new View(ctrl, model)
 *     this.debugger = new Debugger({model:model, view:view, ctrl:ctrl}, true)
 * }
 * var myClass = new MyClass()
 * @constructor
 */
function Debugger(objects, state, options) {
    //TODO: auto recognise model, view, ctrl from self object
    //TODO: Make the view stuff a separate class so it's optional
    /**
     * The objects to debug as {key:value} pairs.  The key should
     * be a string used to refer to the object
     * @type {Object}
     * @private
     */
    this._objects   = objects;
    // init debugger
    this.init(state);
}
Debugger.prototype = function (){

    // start on screen output window code
    var initOpenW   = '70%'
    var initOpenH   = '50%'
    var closedSize  = '36px'

    // model class properties
    var scrollMode  = false         // init with scroll mode off
    var logToScreen = true          // wrate log data to screen
    var autoScroll  = true          // automatically scroll when line added
    var scrollHt    = undefined     // scroll mode height
    var scrollWd    = undefined     // scroll mode width
    var passiveHt   = undefined     // passive mode height
    var passiveWd   = undefined     // passive mode widtht

    // view class properties
    var d           = document
    var b           = document.documentElement || document.body
    var eCont       = null          // controlls height & width
    var eOpCont     = null          // controlls scroll position of output
    var eOutput     = null          // holds the output lines
    var eOptions    = null          // holds the options buttons
    var drs         = null          // enables drag, resize, snap ability

    // buttons
    var bClose, bClear, bScroll, bScrollUp, bScrollDn, bAutoScroll, bDrag,
        bHelp, bSize, bTogLoc

    var iOpen       = "&#10016"
    var iClear      = "&#8802"
    var iScroll     = "&#8645;"
    var iDrag       = "&#10019;"
    var iAutoScroll = "&#8794;"
    var iSize       = "&#8622;"
    var iHelp       = "&#9764;"
    var iScrlUp     = "&#9650;"
    var iScrlDn     = "&#9660;"
    var iTogLoc     = "&#x00040;"
    var iLoc        = "&#x00040;"
    var iStack      = "&#8801;"


    // class methods

    var createView = function(){
        // elements
        eCont = createEle("div", document.body, "#debug-cont")
            eCont.style.width = initOpenW
            eCont.style.minWidth = closedSize
            eCont.style.height = initOpenH
            close() // sets the initial state open / close
        eOpCont = createEle("div", eCont, ".op-cont")
        eOutput = createEle("ol", eOpCont, ".output")
        eOptions = createEle("div", eCont, ".options")
        // buttons
        bClose = createEle("div", eOptions, ".btn .btn-close "+iOpen)
        bClear = createEle("div", eOptions, ".btn .btn-clear "+iClear)
            bClear.style.fontSize = "1.2em"
            bClear.style.marginTop = "-4px"
        bScroll = createEle("div", eOptions, ".btn .btn-scroll "+iScroll)
        bDrag = createEle("div", eOptions, ".btn .btn-drag "+iDrag)
            bDrag.style.cursor = "move"
        bScrollUp = createEle("div", eOptions, ".btn .btn-scroll-up "+iScrlUp)
            bScrollUp.style.display = "none"
        bScrollDn = createEle("div", eOptions, ".btn .btn-scroll-dn "+iScrlDn)
            bScrollDn.style.display = "none"
        bAutoScroll = createEle("div", eOptions, ".btn .btn-autoscroll "+iAutoScroll)
            bAutoScroll.style.display = "none"
        bSize = createEle("div", eOptions, ".btn .btn-size "+iSize)
            bSize.style.fontSize = "1.2em"
        bTogLoc = createEle("div", eOptions, ".btn .btn-tog-loc "+iTogLoc)
            bTogLoc.style.fontSize = ".8em"
            //bTogLoc.style.verticalAlign = "middle"
        bHelp = createEle("div", eOptions, ".btn .btn-help "+iHelp)
    }

    var clearView = function (html){
        eOutput.innerHTML = html || ''
    }

    var open = function (size){
        eCont.style.width = size
        eCont.style.minWidth = ''
        eCont.style.maxWidth = ''
        eCont.style.whiteSpace = ""
    }

    var close = function (){
        eCont.style.width = closedSize
        eCont.style.minWidth = closedSize
        eCont.style.maxWidth = closedSize
        eCont.style.whiteSpace = "nowrap"
    }

    var toggleScrollMode = function (state, resize){
        scrollMode = state || !scrollMode
        resize = resize === undefined ? true:resize
        if (scrollMode){
            addClass(eCont, 'scroll')
            if (!resize) return
            passiveHt = eCont.style.height
            passiveWd = eCont.style.width
            if(scrollHt)
                eCont.style.height = scrollHt
            if(scrollWd)
                eCont.style.width = scrollWd
            if (autoScroll)
                eOpCont.scrollTop = eOpCont.scrollHeight
        }
        else {
            removeClass(eCont, 'scroll')
            if (!resize) return
            scrollHt = eCont.style.height
            scrollWd = eCont.style.width
            if(passiveHt)
                eCont.style.height = passiveHt
            if(passiveWd)
                eCont.style.width = passiveWd
        }

        // show / hide scroll group buttons
        var scrollGroup = [
            eOptions.getElementsByClassName("btn-autoscroll")[0],
            eOptions.getElementsByClassName("btn-scroll-up")[0],
            eOptions.getElementsByClassName("btn-scroll-dn")[0],
        ]

        if (scrollMode) {
            for(var b in scrollGroup)
                scrollGroup[b].style.display = "inline-block"
        }
        else {
            for(var b in scrollGroup)
                scrollGroup[b].style.display = "none"
        }
    }

    /**
     * Create the view an attach event handlers.
     */
    var initView = function (){

        // always log to screen for ios devices
        if( /iPhone|iPod|iPad/i.test(navigator.userAgent) ) {
            logToScreen = true
        }

        // prevent view if logToScreen is false
        if (!logToScreen)  return

        createView()

        noDTZoom(eCont) // prevent double tap zoom on ios

        // option button events
        eOptions.addEventListener("click", function (e) {
            console.log(e)
            e.preventDefault()

            // disable buttons in help mode
            if (!isClicked(e, 'btn-help') && hasClass(bHelp, 'active'))
                return
            // close
            if (hasClass(e.target, 'btn-close')) {
                scrollMode = hasClass(eCont, 'scroll')
                var width = eCont.getBoundingClientRect().width
                if (width <= parseInt(closedSize+5))
                    open(scrollMode ? scrollWd || initOpenW : passiveWd || initOpenW)
                else
                    close()
            }
            // toggle scroll mode
            else if (hasClass(e.target, 'btn-scroll')) {
                toggleScrollMode()
            }
            // scroll up
            else if (hasClass(e.target, 'btn-scroll-up')) {
                eOpCont.scrollTop = eOpCont.scrollTop-eOpCont.offsetHeight
            }
            // scroll-dn
            else if (hasClass(e.target, 'btn-scroll-dn')) {
                eOpCont.scrollTop = eOpCont.scrollTop+eOpCont.offsetHeight
            }
            // autoscroll
            else if (hasClass(e.target, 'btn-autoscroll')) {
                autoScroll = !toggleClass(e.target, 'off')
                if (autoScroll)
                    eOpCont.scrollTop = eOpCont.scrollHeight
            }
            // clear
            else if (hasClass(e.target, 'btn-clear')) {
                clearView('The log has been cleared!')
            }
            // dock
            else if (hasClass(e.target, 'btn-dock-lr')) {
                var debugCont = getParent(e.target.parentElement, 'debug-cont')
                var ww = window.innerWidth - debugCont.offsetWidth
                var rt = parseInt(debugCont.style.right)

                rt =  isNaN(rt) ?  0 : rt

                if (rt === ww || rt > ww/2 ) {
                    debugCont.style.right = 0
                } else if (rt === 0 || rt < ww/2 ){
                    debugCont.style.right = ww + "px"
                }

            }
            // help
            else if (isClicked(e, 'btn-help')) {
                var state = toggleClass(bHelp, 'active')
                if (state) {
                    drs.snapFullScreen()
                    toggleScrollMode(true, false)
                    bHelp.innerHTML += '<span style="font-size:10px;">Exit Help</span>'
                }else{
                    drs.restorePreSnap()
                    toggleScrollMode(false, false)
                    var exit = bHelp.getElementsByTagName('span')[0];
                    bHelp.removeChild(exit);
                }

                clearView(
                    '<li><b>OUTPUT LINE BUTTONS:</b></li>'+
                        '<ul>'+'Each output line has the following buttons:'+
                            '<li>'+iStack+' <b>Stack:</b> Shows the full stack trace.</li>' +
                            '<li>'+iLoc+' <b>Location:</b> Show the location (file:line:col).</li>' +
                        '</ul>'+
                    '<li><b>WINDOW SIZE AND POSITION:</b></li>'+
                    '<ul>'+
                        '<li>'+iOpen+' <b>Close/Open:</b> Toggle window open and closed.</li>' +
                        '<li>'+iDrag+'<b> Move:</b> Press and drag to move window. The shaded ' +
                            'line number area will also allow move.</li>' +
                        '<li>'+iSize+' Toggle Bounds: Make bounds fixed or a percentage of the browser window ' +
                            '(size changes as window size changes).</li>' +
                        '<li><b>Resize:</b> Press and drag any edge to resize window, corder will ' +
                            'double resize.</li>' +
                        '<li><b>Snap:</b> Drag just past a screen edge to snap.</li>' +
                        '<li><b>FullScreen:</b> Drag 100px or more past an edge to go full screen.</li>'+
                        '<li><b>Unsnap:</b> Drag in any direction away from edge for unsnap and resize to pre-snap dimentions '+
                            'or Click the drag button for unsnap and retain snapped size.' +
                        '<li><b>Center:</b> Tripple tap anywhere to center on the screen.</li>'+
                    '</ul>'+
                    '<li><b>WINDOW SCROLL / WINDOW GHOST:</b></li>'+
                    '<ul>'+
                        '<li>'+iScroll+' <b>Toggle Ghost/Scroll:</b> Ghost mode will pass all mouse and ' +
                            'touch events to obscured items.  Scroll mode allows for scrolling up and ' +
                            'down, but will block touch and mouse events from obscured items.<br>' +
                            'Note: Scroll mode and ghost mode will remember thier respective sizes!</li>' +
                        '<li>'+iScrlUp+' <b>Scroll Up:</b> One full page (only in scroll mode).</li>' +
                        '<li>'+iScrlDn+' <b>Scroll Down:</b> One full page (only in scroll mode).</li>' +
                        '<li>'+iAutoScroll+' <b>Auto Scroll:</b> Scroll to the last line as they come.</li>' +
                    '</ul>'+
                    '<li><b>OTHER BUTTONS:</b></li>'+
                        '<ul>'+
                        '<li>'+iClear+' <b>Clear:</b> Clears the contents of the ouput window.</li>' +
                        '<li>'+iTogLoc+' Toggle location: Toggle location for all lines.' +
                            ' changes as window size changes).</li>' +
                        '<li>'+iHelp+' <b>Help:</b> You are here.</li>'+
                    '</ul>'+
                    '<li><b>CSS:</b></li>'+
                    '<ul>'+
                        '<li>Style colors and whatnot with css.'+
                    '</ul>'
                )

            }
            // clear
            else if (hasClass(e.target, 'btn-size')) {
                var state = toggleClass(e.target, 'off')
                drs.togglePercent(!state)
            }
            else if (hasClass(e.target, 'btn-tog-loc')) {
                var locs = d.getElementsByClassName('loc')
                toggleClass(locs, 'hide')
            }
        })

        // line item events
        eOutput.addEventListener("click", function(e) {
            var li = getParent(e.target.parentElement, 'li')
            if (li) {
                // show location
                if (hasClass(e.target, "btn-location")) {
                    toggleClass(li.getElementsByClassName("loc"), "hide")
                }
                // show stack
                if (hasClass(e.target, "btn-stack")) {
                    if(!scrollMode) toggleScrollMode()
                    toggleClass(li.getElementsByClassName("stack"), "hide")
                }
            }
        })

        makeTouchScroll(eOpCont)

        // enable drag resize zoom
        drs = core.util.DRS.makeDRS(eCont, [bDrag, {left:0, bottom:28, top:0, width:28}])
        drs.togglePercent(true) // start in percent mode


    }()

    // adds touch scrolling to a scrollable element
    function makeTouchScroll(ele){

        var prevY, difY, scrollFrame

        ele.addEventListener("touchstart", function(e) {
            if(scrollFrame) window.cancelAnimationFrame(scrollFrame)
            var touch = e.touches[0]
            prevY = touch.clientY
            difY = null // stop scrolling
            console.log(e.target)
        })

        ele.addEventListener("touchmove", function(e) {
            e.preventDefault()
            e.stopPropagation()
            var touch = e.changedTouches[0]
            difY = touch.clientY - prevY
            ele.scrollTop = ele.scrollTop + difY * -1
            prevY = touch.clientY
        })

        document.addEventListener("touchend", function(e) {
            prevY = null
            if (difY)
                scrollFrame = requestAnimationFrame(dynamicScroll);
        })

        function dynamicScroll() {
            if ((difY > 1 || difY < -1)) {
                ele.scrollTop = ele.scrollTop + difY * -1
                difY = difY * .92
                scrollFrame = requestAnimationFrame(dynamicScroll);
            }else{
                ele.scrollTop = ele.scrollTop + difY * -1
            }
        }
    }
    // end on screen output window code

    // start debugger code for console only

    /**
     * Initialize debugger for all included objects.  Adds this._debug,
     * this.debug(), this.debug.log(), this.debug.info(), this.debug.warn(),
     * and this.debug.error() to each included object with it's own context.
     * @param {boolean} state - Initial debug state for all objects.
     * @memberof Debugger
     */
    function init (state){
        if(!state && state!==false) console.log('You have not supplied a debug state for', this._objects)
        setState.call(this, state);
        for (var key in this._objects){
            this._objects[key].debug = debug.call(this._objects[key]);
            this._objects[key].debug.info = debug.call(this._objects[key], "info");
            this._objects[key].debug.warn = debug.call(this._objects[key], "warn");
            this._objects[key].debug.error = debug.call(this._objects[key], "error");
            this._objects[key].debug.log = debug.call(this._objects[key], "log");
        }

        // catch real erros and print to screen
        window.onerror = function(message, url, line) {
            var loc = new LogLocation({url:url, line:line})
            printToScreen.call(this, ['error', message], loc, true)
            return false;
        }.bind(this);
    }

    /**
     * Turns off debugging for specified object or all abjects if no object key is specified.
     * @param {string} [key] - Name given to object in objects perameter {@link Debugger~objects}.
     * @returns {Debugger.state}
     * @example <caption>Turn off debug output</caption>
     * // Sets all included objects this._debug = false
     * myClass.debugger.off();
     * // Sets myClass.model._debug = false
     * myClass.debugger.off("model");
     * @memberof Debugger
     */
    function off(key){
        return setState.call(this, false, key);
    }

    /**
     * Turns on debugging for specified object or all abjects if no object key is specified.
     * @param {string} [key] - Name given to object in objects perameter {@link Debugger~objects}.
     * @returns {Debugger.state}
     * @example <caption>Turn on debug output</caption>
     * // Sets all included objects this._debug = true
     * myClass.debugger.on();
     * // Sets myClass.model._debug = true
     * myClass.debugger.on("model");
     * @memberof Debugger
     */
    function on(key){
        return setState.call(this, true, key);
    }

    /**
     * Sets the debug state for the specified object or all abjects if no object key is
     * specified.  Each objects state is stored in it's own property (this._debug = state).
     * This property will be created automatically.
     * @param {boolean} state - Determines if debug output is on(true) or off(false).
     * @param {string} [key] - Name given to object in objects perameter {@link Debugger~objects}.
     * @returns {Debugger.state}
     * @memberof Debugger
     */
    function setState (state, key){
        if (key) this._objects[key]._debug = state;
        else {
            for (var k in this._objects){
                // create private var for each object
                this._objects[k]._debug = state;
            }
        }
        return this.state();
    }

    /**
     * Calls console at the specified level if debug is on.  Avalable for each object
     * supplied to {@link Debuggger.init} as this.debug().  You may also call as this.debug.log(),
     * this.debug.info(), this.debug.warn(), this.debug.error().
     * @param {string} [level="log"] - Determines console output level
     * @returns {function}
     * @memberof Debugger
     */
    function debug(level){
        level = level || "log"
        if (this._debug && logToScreen)
            return log.bind(this, level)
        else if (this._debug)
            return console[level].bind(window.console)
        else
            return function(){};
    }

    function log(level){
        //TODO: make screen optional
        var loc     = new LogLocation()
        var args    = Array.prototype.slice.call(arguments, 0)
        var message = printToScreen(args, loc)

        // this will write to console
        try{
            // determine console width in charicters and add spaces to justify right
            // TODO: optimize for ie, firefox, opra
            var spaceStr = ""
            var extraWidth = 170       //scroll bar and anything else ie: browser line numbers
            var consoleCharWidth = 7   // the width of console charicters in pixels
            var consoleW = (window.outerWidth - window.innerWidth - extraWidth)
            consoleW = consoleW > 10 ? consoleW : window.innerWidth
            var filler = (consoleW / consoleCharWidth) - (message.length + loc.loc.length)
            while(spaceStr.length < filler) {
                spaceStr += " "
            }
            // apply to console
            console[level].apply(window.console, args.concat([spaceStr+loc.loc]))
        }catch (e){
            logToScreen = true
            log('error', '"'+level+'"'+ ' is not a supported console function.')
        }
    }

    /**
     * Writes debug message to screen
     * @param args  {arguments} - The arguments from previous function
     * @param loc  {Location} - Determines console output level
     * @returns {string}
     */
    function printToScreen(args, loc, noescape){
        // create message for output
        var message = ''
        var level = args.shift()
        var stack = ''
        // prepare message
        for (var i in args)
            message += args[i] + " "
        if (!noescape)
            message = escapeHtml(message)
        // prepare stack
        for (var s in loc.stack)
            stack += "--> "+loc.stack[s]+"<br>"

        // create li element and append
        var e = createEle("li", eOutput, "."+level)
            e.className = level
        var eM = createEle("div", e, ".message")
        var eLevel = createEle("i", eM, ".level")
            eLevel.innerHTML = level+" "
        var eSB = createEle("i", eM, ".btn-stack "+iStack+" ")
            eSB.style.fontSize = "1.1em"
            //eSB.style.verticalAlign= "middle"
        var eLB = createEle("i", eM, ".btn-location "+iLoc)
            eLB.style.fontSize = ".8em"
            eLB.style.verticalAlign= "middle"
        var eLoc = createEle("span", eM, ".loc .hide")
            eLoc.innerHTML = loc+" "
        var eText = createEle("span", eM, ": "+message)
        var eStack = createEle("div", e, ".stack .hide")
            eStack.innerHTML = stack

        // auto scroll to bottom
        if (autoScroll)
            eOpCont.scrollTop = eOpCont.scrollHeight

        return message
    }

    /**
     * Returns the debug state of all included objects as an object.
     * @example {"view":"off", "model":"on", "ctrl":"on"}
     * @returns {Object.<key,state>}
     * @memberof Debugger
     */
    function state(){
        var result = {}
        for (var k in this._objects){
            result[k] = this._objects[k]._debug ? 'on':'off';
        }
        return result
    }
    return{init:init,state:state,off:off,on:on, logToScreen:logToScreen }
}();
/**
 * Obtains the location for a log items when intercepting for screen output.
 * @param options
 * @constructor
 */
var LogLocation = function(options){
    options = options !== undefined ? options : {}
    this.stack  = []
    this.url    = options.url
    this.loc    = ''
    this.path   = ''
    this.file   = ''
    this.line   = options.line
    this.col    = ''
    this.str    = ''

    try{
        var e = new Error()
        throw e
    } catch (error){
        e = error
    }

    this.init(e, options.offset)
}
LogLocation.prototype = function(){

    function init(e, offset){
        this.stack  = getStack(e, offset)
        this.url    = this.url || e.url || this.stack[0] || "?"
        var loc     = locFromUrl(this.url)
        this.path   = loc.path
        this.file   = loc.file || "?"
        this.line   = this.line || loc.line || e.line || e.lineNumber || "?"
        this.col    = loc.col || e.column || ""
        var str    = [this.file, this.line, this.col].join(':')
        this.str    = this.loc = "("+str+")"
    }

    function toString(){
        return this.str
    }

    function getStack(e, offset){
        var index = 3 + (offset || 0)
        var stackS  = e.stack || ""
        var stackA  = stackS.split('\n') || []
        // remove internal
        stackA = stackA.slice(index)
        // create stackA if not available
        if (!(stackA.length && stackA[0])){
            var currentFunction = arguments.callee;
            while (currentFunction){
                var fn = currentFunction.toString();
                var fname = fn.match(/function\s(\w+?)\s*\(/) || ["", "anonymous"];
                stackA.push(fname[1]);
                currentFunction = currentFunction.callee;
            }
            // remove internal
            stackA = stackA.slice(index-2)
        }
        return stackA
    }

    function locFromUrl(url){
        var parts   = url.split('/') || []

        var loc     = parts.pop().replace(')', '')
                                 .replace('(', '')
        var path    = parts.join("/")
        var locL    = loc.split(':') || []
        return {line:locL[1],
                col:locL[2],
                file:locL[0],
                path:path}
    }

    return {init:init, toString:toString}
}()
//Profiler group toggles
var profileSite = false;

/**
 * Constructs a Profiler instance
 * @class Use as decorator to time a function or as a stopwatch to time any portion of code.
 * @constructor
 * @param   {object}    [objectToTime]                  - The object to time
 * @param   {object}    [options]                       - Instantiation options
 * @param   {boolien}   [options.performance=true]      - Source of time, true:window.performance
 *                                                        or false:Date().getTime()
 * @param   {string}    [options.group="profileSite"]   - Group name, All instances in a group are
 *                                                        toggled active/inactive together
 * @param   {object}    [options.active=false]          - Active / inactive state, overrides group state for one instance
 * @example <caption>Create function Profiler with default values.</caption>
 * // Create default group variable (must be set prior to instantiation of Profiler)
 * var profileSite = true
 * // Decorate functionA and assign to variable
 * var functionA_profile = new Profiler(functionA);
 * @example <caption>Create function Profiler with custom group.</caption>
 * // Create custom group variable (must be set prior to instantiation of Profiler)
 * var profileGroup1 = true
 * var functionB_profile = new Profiler(functionB, {group:"profileGroup1"});
 * // or as method (useful during runtime)
 * unctionB_profile.group("profileGroup1");
 * @example <caption>Create an inactive function Profiler.</caption>
 * var functionC_profile = new Profiler(functionC, {group:"profileGroup1", active:false});
 * // or as method (useful during runtime)
 * functionB_profile.active(false);
 * @example <caption>Use as stop watch.</caption>
 * var myStopWatch = new Profiler();
 * myStopWatch.start();
 * //do other stuff..
 * myStopWatch.stop();
 * myStopWatch.printElapsed();
 */
var Profiler = function (objectToTime, options) {

    this.startTime = 0;
    this.stopTime = 0;
    this.running = false;           //clock is running
    this.performance = true;        //source of current time true:window.performance / false:Date().getTime()
	this.currentName = 'Elapsed';
	this._group = 'profileSite';
	this._active = true;
    this.results = [];
    this.init = 0;

    if (!options) options = {};
    if (options.performance !== undefined) this.performance = options.performance === false ? false : !!window.performance;
	if (options.group !== undefined) this.group(options.group);
	if (options.active !== undefined) this.active(options.active);

    this._initPrototype(objectToTime, options);

};
Profiler.prototype = function () {

	function _initPrototype(objectToTime, options){
		this.group(this._group)
        if (isActive.call(this)){
            //apply this namespace to prototype
            if (objectToTime) this.currentName = objectToTime.name;
            this.init++;
            if (objectToTime) this.decorate(objectToTime, options.context);
            console.log('**initilized profiler for**'+this.currentName+this.init);
        }

	}
    //noinspection JSUnusedLocalSymbols
    function toString() {
        return "Timer " + this.currentName;
    }
    function isActive(){
        return this._active && window[this._group]
    }
	function group (overide){

		if (overide !== undefined){
            if (typeof overide != "string") throw 'Profiler.group must be a global variable as a string.';
            if (window[overide]===undefined)throw 'Profiler.group: Missing a predefined global variable ' +
                'with a boolean value for group "'+overide+'".';
			this._group = overide;
		}
		else return this._group;
	}
	function active (overide){

		if (overide !== undefined){
			if (typeof overide != "boolean") throw "Profiler.active must be a boolean value.";
            //console.log('active overide =', overide );
			this._active = overide;
            return this._active
        }else{
            return isActive.call(this);
        }

	}
    function decorate (objectToTime, context){
        if(isActive.call(this)){
			context = context || window;
			var wraped = function () {
                //console.log('new '+this.currentName+' function called');
                this.start();
                objectToTime.apply(context, arguments);
                this.stop();
            };

            context[objectToTime.name] = wraped.bind(this);
            //context[objectToTime.name].apply(_obj)
			//console.log('==created timed func:'+context[objectToTime.name]);

		}
    }
	function currentTime() {

		return this.performance ? window.performance.now() : new Date().getTime();
	}
	function start (name) {

		this.currentName = name || this.currentName;
		this.startTime = currentTime();
		this.running = true;
	}
	var stop = function () {

		this.stopTime = currentTime();
		this.running = false;
        if (isActive.call(this)){
            this.results.push(this.stopTime - this.startTime);
            this.printResults(this.currentName);
        }
	};

	var getElapsedMilliseconds = function () {

		if (this.running) {
			this.stopTime = currentTime();
		}

		return this.stopTime - this.startTime;
	};

	var getElapsedSeconds = function () {

		return getElapsedMilliseconds.call(this) / 1000;
	};

	var printElapsed = function (name) {

		this.currentName = name || this.currentName;
        console.log(this.currentName+' [Elapsed Time] = ', '[ms:'+getElapsedMilliseconds.call(this)+'] [s: '+getElapsedSeconds.call(this)+']');
    };
    var printResults = function (name) {

		this.currentName = name || this.currentName;
        var secTotal = 0;
        var msTotal = 0;
        var count = 0;
        var msR = 2
        var secR = 6
        console.log('------------------------------------------');
        console.log('| Profiler: '+this.currentName);
        for (i in this.results){
          count++;
          secTotal += this.results[i]/1000;
          msTotal += this.results[i];
          var msec = this.results[i].toFixed(msR)
          var sec = (this.results[i]/1000).toFixed(secR)
          console.log('| ['+i+']      = ','[ms: ' + msec + '] [s: ' + sec + ']');
        }
        var msAverg = (msTotal/count).toFixed(msR);
        var secAverg = (secTotal/count).toFixed(secR);
        msTotal = msTotal.toFixed(msR)
        secTotal = secTotal.toFixed(secR)
        console.log('| [*total] = ','[ms: ' +msTotal+ '] [s: ' + secTotal + ']');
        console.log('| [*averg] = ','[ms: ' +msAverg+ '] [s: ' + secAverg + ']');
        console.log('------------------------------------------');
	};

	return{
		_initPrototype:_initPrototype,
		start:start,
		stop:stop,
		group:group,
		active:active,
        decorate:decorate,
        printElapsed:printElapsed,
        printResults:printResults
	};
}();
console.log('-> iDebugConsole.js ready')
