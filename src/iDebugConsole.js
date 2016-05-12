/**
 * @namespace
 * @description This package provides debugging and profiling tools.  The primary purpose is to provide a means for
 * controlling console output globally and within closures as required.  An optional output window is provided as well.
 * This is helpful for devices without a console window or when you do not require the full feature set of the native
 * browser consoles.  Finally a handy profiler for profiling javascript code execution and individual components.
 * All that utility at just 0.309kb minified in a production environment and under 12kb minified in development.
 *
 * An instance of the Debugger called `iDebugger` and the global debug method called `debug` are available after loading
 * iDebugConsole.js.  Use the debug method exactly how you would use console except that debug() may be called directly
 * as a shortcut to `debug.log()`. Each Debugger instance provide independent control over the closure it is assigned to.
 *
 * @author Simplex Studio, LTD
 * @copyright Copyright (c) 2016 Simplex Studio, LTD
 * @license The MIT License (MIT)
 * Copyright (c) 2016 Simplex Studio, LTD
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var iDebugConsole = function() {

    /**
	 * @memberof iDebugConsole
     * @class Debugger is the class responsible for controlling weather a debug statement is ignored, output to the
     * browser console or iDebugConsole.  Debug output is disabled by default, enable output by setting window.iDebugMode
     * = true/false prior to loading iDebugConsole.js.  This is especially useful when used with a back end framework such
     * as django which supplies it's own debug flag.  To toggle the global debug flag use the global method of any
     * Debugger instance or Debugger.prototype.
     *
     * @example <caption>Enable debug output before loading.</caption>
     *  <script language="javascript">window.iDebugMode=true</script>
     *  <script src="js/iDebugConsole.js""></script>
     *
     * @example <caption>Enable debug output after loading.</caption>
     *  <script src="js/iDebugConsole.js""></script>
     *  <script language="javascript">
     *
     *      this.debug('This will not be output to the console')
     *
     *      // Turn on global debugging
     *      iDebugger.globalState(true)
     *
     *      // Global debugging my be controlled via the Debugger prototype as well
     *      Debugger.prototype.global(true)
     *
     *      this.debug('This will be output to the console')
     *      this.debug.warn('It supports all valid console methods')
     * </script>
     *
     * The iDebugConsole window is disabled by default, output will be directed only to the native console window.
     * Although the iDebugConsole window has a vary small feature set compared to the native console there are a few
     * distinct advantages:
     * - It's faster.
     * - Embedded in your website on load.
     * - Each debug statement contains a stack trace.
     * - It does not reduce your device window size.
     * - It can be initialized in open or closed mode.
     * - It scales it's self to the device screen size.
     * - It can be dragged, resized, docked, or full screen on demand.
     *
     * @example <caption>Enable iDebugConsole output window.</caption>
     *  <script language="javascript">
     *      // Enable the on screen output in closed mode (minimized).
     *      iDebugger.initView('closed')
     *      // Enable the on screen output window via the Debugger prototype
     *      Debugger.prototype.initView('open')
     *  </script>
     *
     * Note:: When using the iDebugConsole output window, the output will also appear in the native browser console window,
     * but the location data will show a Debugger location. Corrected location data will be injected into each debug statement.
     *
     * @example <caption>Use django to set the global debug state</caption>
     * 1) In your django settings file TEMPLATE_CONTEXT_PROCESSORS must contain the debug context processor:
     *   'django.core.context_processors.debug' (django < 1.8) or
     *   'django.template.context_processors.debug' (django >= 1.8)
     * 2) Make sure you have defined the setting INTERNAL_IPS = ('127.0.0.1',) add ip addresses as required.
     * 3) In your HTML template file use the {{debug}} variable supplied by django's debug context processor
     *    to set window.iDebugMode and load iDebugConsole.
     *    {% if debug %}
     *       <script language="javascript">window.iDebugMode=true</script>
     *    {% endif %}
     *    <script src="{% static "js/iDebugConsole.js" %}"></script>
     *
     * @example <caption>Minimize iDebugConsole's footprint in production:</caption>
     *    {% if debug %}
     *       <script language="javascript">window.iDebugMode=true</script>
     *       <script src="{% static "js/iDebugConsole.js" %}"></script>
     *    {% else %}
     *      <script src="{% static "js/iDebugDummy.js" %}"></script>
     *    {% endif %}
     *
     *    NOTE:: Alternatively just copy the contents of iDebugDummy.js and paste into the top of your javascript.
     *
     * @description
	 * Add this class to any closure to provide control over the console output of debug data within that closure.
	 * All objects specified will have a debug() method created automatically.
     *
     * @param {object} objects
     * Specify included objects as {objectName:object} pairs.
     *
     * @param {boolean} state [false]
     * Initial debug output state for all objects true=on false=off.
     *
     * @param {object} options
     * An object containing valid options.
     *
     * @param {bool} options.callback [true]
     * A callback function to be executed on all calls to debug.
     * Receives the debug level called and the location object.
     * function(level,loc)
     *
     * @param {bool} options.prefixConsole [true]
     * Prepend the prefix to console output.
     *
     * @param {bool} options.prefixOverlay [true]
     * Prepend the prefix to on screen overlay output.
     * > NOT IMPLEMENTED YET
     *
     * @param {bool} options.prefixObjectName [true]
     * Use the specified objectName in the prefix
     *
     * @param {bool} options.prefixFunctionName [true]
     * Use the calling function name in the prefix
     * (only available when using the view).
     *
     * @param {bool} options.prefixInstanceId ['name']
     * Use the object name in the prefix. Specify an object property as a
     * string to use a property other than "name".
     *
     * @param {bool} options.addInstanceProps [[]]
     * An array of object properties to be available in the output.
     * > ONLY OUTPUT IN CONSOLE FOR NOW
     *
     * @param {bool} options.locationProps [["loc.file", "loc.func", "loc.line", "loc.col"]]
     * Alter the location properties to output. See {@link LogLocation} for all avalable properties.
     * > NOT IMPLEMENTED YET
     *
     *
     * @example <caption>Instantiate a Debugger within a class for class level control.</caption>
     * function MyClass (){
     *     var ctrl = new Controller
     *     var model = new Model(ctrl)
     *     var view = new View(ctrl, model)
     *     this.iDebug = new iDebugConsole.Debugger({model:model, view:view, ctrl:ctrl}, true)
     *
     *     // use the debugger like this
     *     this.debug('This is the same as calling console.log()')
     * }
     *
     * @example <caption>Dynamically toggle debugging only for a specified closure.</caption>
     * var myClass = new MyClass()
     *
     * //turn off the MyClass debugger
     * myClass.iDebug.off()
     *
     * //turn off the MyClass.model debugger only
     * myClass.iDebug.off('model')
     */
    function Debugger(objects, state, options) {
        //TODO: auto recognise model, view, ctrl from self object
        /**
         * The objects to debug as {key:value} pairs.  The key should
         * be a string used to refer to the object
         * @type {Object}
         * @private
         */
        this._objects = objects;
        this._unique_options = options || {}
        // Unique and default options
        this.options = {}

        // init debugger
        this.setOptions.call(this, this._unique_options)
        this.init(state);
    }
    Debugger.prototype = function () {

        // Class variables & methods

        // Console supports string formatting
        var consoleSFSupport = !(/MSIE|Edge/i.test(navigator.userAgent))

        //Tracks all debugger objects for global control.
        var allDebuggers = []

        //Tracks the global debug state.
        var globalDebug = window.iDebugMode !== undefined ? window.iDebugMode : false

        //The console view.
        var view = false

        /**
         * Global options
         * @type {{}}
         * @memberof Debugger
         */
        var globalOptions = {
            callback:undefined,
            prefixConsole:true,
            prefixOverlay:false,
            prefixObjectName:false,
            prefixFunctionName:false,
            prefixInstanceId:false,
            addInstanceProps:[],
            locationProps:["loc.file", "loc.func", "loc.line", "loc.col"]
        }


        /**
         * Sets and gets the global debug state.
         * @param state {boolean} - Toggle the global debug state.
         * @memberof Debugger
         */
        var globalState = function (state) {
            if (state)
                globalDebug = state
            else
                return globalDebug
        }

        // Instance methods

        /**
         * Initialize debugger for all included objects.  Adds this._debug,
         * this.debug(), this.debug.log(), this.debug.info(), this.debug.warn(),
         * and this.debug.error() to each included object with it's own context.
         * @param state {boolean} - Initial debug state for all objects.
         * @param update {boolean} - Only update output
         * @memberof Debugger
         * @private
         */
        function init(state, update) {

            if (state === undefined) console.error('You have not supplied a debug state for', this._objects)
            //allDebuggers = []
            // Instance option overrides

            setState.call(this, state);

            for (var key in this._objects) {
                var obj = this._objects[key]
                obj._debugObjectName = key
                obj.iDebugger = this
                // only push instance on first init
                if (!update)
                    allDebuggers.push(obj)
                obj.debug = debug.call(obj, undefined, this.options);
                for (var level in console)
                    if (typeof console[level] == 'function')
                        obj.debug[level] = debug.call(obj, level, this.options);
            }
        }

        /**
         * Sets instance options or global options using globalOptions as the default values
         * @param newOptions {object} New option values
         * @param optionsToSet {object} [this.options] Alternately provide globalOptions object
         */
        function setOptions(newOptions, optionsToSet){
            optionsToSet = optionsToSet || this.options
            newOptions = newOptions || {}

            //console.log("setting options for",this._objects,  optionsToSet, globalOptions)

            // Allow options.instanceId = true to use 'id' as property
            newOptions.prefixInstanceId = newOptions.prefixInstanceId === true ?
                'id' : newOptions.prefixInstanceId

            for (var o in globalOptions) {
                var newVal = newOptions[o]
                optionsToSet[o] = newVal !== undefined ? newVal : globalOptions[o]
            }
        }

        /**
         * Sets Global options (for all instances) using globalOptions as the default values
         * @param newOptions {object} New option values
         */
        function setGlobalOptions(newOptions){
            setOptions(newOptions, globalOptions)
            // re-init all debuggers to pickup changes in global options
            for (var i in allDebuggers)
                setOptions.call(allDebuggers[i].iDebugger)
                init.call(allDebuggers[i].iDebugger, allDebuggers[i].iDebugger.state(), "update")
        }


        /**
         * Initialize the console view.
         * @param state
         * @param options
         * @memberof Debugger
         */
        function initView(state, options){
            view = new DebuggerView(this, state, options)
            // Reinitialize all debuggers to direct to view output
            for (var i in allDebuggers)
                init.call(allDebuggers[i].iDebugger, allDebuggers[i].iDebugger.state(), "update")
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
        function off(key) {
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
        function on(key) {
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
         * @private
         */
        function setState(state, key) {
            if (key)
                this._objects[key]._debug = state;
            else {
                for (var k in this._objects) {
                    if (typeof state !== 'boolean')
                        state = state[k]
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
         * @private
         */
        function debug(level, options) {
            // this is the object calling debug
            level = level || "log"
            if (!globalDebug || !this._debug)
                return function () {};

            // When a callback is specified we must use output
            if (view || options.callback){
                options.toScreen = view
                return DebuggerView.prototype.output.bind(this, level, options)
            }

            if (!options.prefixConsole)
                return console[level].bind(window.console)

            var prefix = getPrefixArgs(arguments, this)
            return console[level].bind.apply(window.console[level], [window.console].concat(prefix.prefixArray, prefix.msgArray))
        }


        /**
         * Returns the debug state of all included objects as an object.
         * @example {"view":"off", "model":"on", "ctrl":"on"}
         * @returns {Object.<key,state>}
         * @memberof Debugger
         * @private
         */
        function state() {
            var result = {}
            for (var k in this._objects) {
                result[k] = this._objects[k]._debug ? 'on' : 'off';
            }
            return result
        }

        /**
         * Returns an array where the first index will be the prefix string.  The second index
         * will be and object containing any options.addInstanceProps. The third index will
         * be and array of the original args concatenated with the prefix and addInstanceProps
         * object.
         * @param args {arguments} Must include level & options arguments
         * @param caller {object} The calling object
         * @param loc {LogLocation}
         * @returns {object} {prefixArray:[], propObject:{} || null, msgArray:[]}
         * @private
         */
        function getPrefixArgs(args, caller, loc){
            loc = loc || {func:''}

            args = Array.prototype.slice.call(args, 0)
            var level = args.shift()
            var options = args.shift()

            var instanceObj = getPropsFromArrayOfStrings(options.addInstanceProps, caller)

            // Create prefix
            var prefixA = ['']
            var prefix = ''
            if (options.prefixObjectName)
                prefix += caller._debugObjectName
            if (options.prefixInstanceId) {
                if (options.prefixObjectName) prefix += ': '
                prefix += caller[options.prefixInstanceId] || 'no-id'
            }
            if (options.prefixFunctionName) {
                if (options.prefixObjectName || options.prefixInstanceId) prefix += ' @ '
                prefix += loc.func
            }

            if(prefix) prefix = prefix + ' -> '

            // Add prefix to args with css when available
            if (typeof args[0] == 'string')
                if(consoleSFSupport) prefixA = ['%c'+prefix + '%c'+args.shift(), "font-style:italic;", "font-style:initial;"]
                else prefixA = [prefix + args.shift()]
            else
                if(consoleSFSupport) prefixA = ['%c'+prefix , "font-style:italic;"]
                else prefixA = [prefix]

            return {prefixArray:prefixA, prefixObj:instanceObj?instanceObj:null, msgArray:args}
        }

        function getPropsFromArrayOfStrings(propsArray, object){
            var out = propsArray.length ? {}:null
            for (var i in propsArray) {
                var prop = propsArray[i]
                if (typeof prop !== 'string')
                    throw ('iDebugError: " The location property ( ' + prop + ' ) must be specified as a string.')
                out[prop] =  object[prop]
            }
            return out
        }

        /**
         * Set global options.
         * @method Debugger.setOptions
         */

        return {
            init: init,
            state: state,
            off: off,
            on: on,
            globalState: globalState,
            initView: initView,
            getPrefixArgs:getPrefixArgs,
            setOptions:setOptions,
            setGlobalOptions:setGlobalOptions
        }
    }();


    /**
	 * @memberof iDebugConsole
     * @class The on screen output window component of iDebugConsole.
     * @param state {string|options}        Accepts a string equivalent to a valid option.state or an options object.
     * @param options {object}              The following options are available:
     * @param options.state {string}        Initial state of the iDebugConsole ("open" or "closed")
     * @param options.test {string|re}      Test for a specific userAgent before init. There is a string shortcut
     *                                      to test for iOS devices "ios".
     * @constructor
     */
    var DebuggerView = function (model , state, options) {
        this.model = model
        this.init(state, options)
    }
    DebuggerView.prototype = function () {

        // Start Output Window code

        // Output window class properties

        // Output window initial settings
        var initOpenW = '70%'
        var initOpenH = '50%'
        var closedSize = '36px'

        var scrollMode = false         // init with scroll mode off
        var onScreen = null          // the view is initialized
        var autoScroll = true          // automatically scroll when line added
        var scrollHt = undefined     // scroll mode height
        var scrollWd = undefined     // scroll mode width
        var passiveHt = undefined     // passive mode height
        var passiveWd = undefined     // passive mode widtht

        var d = document
        var b = document.documentElement || document.body
        var eCont = null          // The onscreen debugger container
        var eOpCont = null          // controlls scroll position of output
        var eOutput = null          // holds the output lines
        var eOptions = null          // holds the options buttons
        var drs = null          // enables drag, resize, snap ability

        // Output window buttons
        var bClose, bClear, bScroll, bScrollUp, bScrollDn, bAutoScroll, bDrag,
            bHelp, bSize, bTogLoc

        var iOpen = "&#10016"
        var iClear = "&#8802"
        var iScroll = "&#8645;"
        var iDrag = "&#10019;"
        var iAutoScroll = "&#8794;"
        var iSize = "&#8622;"
        var iHelp = "&#9764;"
        var iScrlUp = "&#9650;"
        var iScrlDn = "&#9660;"
        var iTogLoc = "&#x00040;"
        var iLoc = "&#x00040;"
        var iStack = "&#8801;"


        // Output window class methods

        var createView = function () {
            // elements
            eCont = createEle("div#debug-cont", document.body)
            eCont.style.width = initOpenW
            eCont.style.minWidth = closedSize
            eCont.style.height = initOpenH
            close() // sets the initial state open / close
            eOpCont = createEle("div.op-cont", eCont)
            eOutput = createEle("ol.output", eOpCont)
            eOptions = createEle("div.options", eCont)
            // buttons
            bClose = createEle("div.btn.btn-close", eOptions, iOpen)
            bClear = createEle("div.btn.btn-clear", eOptions, iClear)
            bClear.style.fontSize = "1.2em"
            bClear.style.marginTop = "-4px"
            bScroll = createEle("div.btn.btn-scroll", eOptions, iScroll)
            bDrag = createEle("div.btn.btn-drag", eOptions, iDrag)
            bDrag.style.cursor = "move"
            bScrollUp = createEle("div.btn.btn-scroll-up", eOptions, iScrlUp)
            bScrollUp.style.display = "none"
            bScrollDn = createEle("div.btn.btn-scroll-dn", eOptions, iScrlDn)
            bScrollDn.style.display = "none"
            bAutoScroll = createEle("div.btn.btn-autoscroll", eOptions, iAutoScroll)
            bAutoScroll.style.display = "none"
            bSize = createEle("div.btn.btn-size", eOptions, iSize)
            bSize.style.fontSize = "1.2em"
            bTogLoc = createEle("div.btn.btn-tog-loc", eOptions, iTogLoc)
            bTogLoc.style.fontSize = ".8em"
            //bTogLoc.style.verticalAlign = "middle"
            bHelp = createEle("div.btn.btn-help", eOptions, iHelp)
        }

        var clearView = function (html) {
            eOutput.innerHTML = html || ''
        }

        var open = function (size) {
            size = size || initOpenW
            eCont.style.width = size
            eCont.style.minWidth = ''
            eCont.style.maxWidth = ''
            eCont.style.whiteSpace = ""
        }

        var close = function () {
            eCont.style.width = closedSize
            eCont.style.minWidth = closedSize
            eCont.style.maxWidth = closedSize
            eCont.style.whiteSpace = "nowrap"
        }

        var toggleScrollMode = function (state, resize) {
            scrollMode = state || !scrollMode
            resize = resize === undefined ? true : resize
            if (scrollMode) {
                addClass(eCont, 'scroll')
                if (!resize) return
                passiveHt = eCont.style.height
                passiveWd = eCont.style.width
                if (scrollHt)
                    eCont.style.height = scrollHt
                if (scrollWd)
                    eCont.style.width = scrollWd
                if (autoScroll)
                    eOpCont.scrollTop = eOpCont.scrollHeight
            }
            else {
                removeClass(eCont, 'scroll')
                if (!resize) return
                scrollHt = eCont.style.height
                scrollWd = eCont.style.width
                if (passiveHt)
                    eCont.style.height = passiveHt
                if (passiveWd)
                    eCont.style.width = passiveWd
            }

            // show / hide scroll group buttons
            var scrollGroup = [
                eOptions.getElementsByClassName("btn-autoscroll")[0],
                eOptions.getElementsByClassName("btn-scroll-up")[0],
                eOptions.getElementsByClassName("btn-scroll-dn")[0],
            ]

            if (scrollMode) {
                for (var b in scrollGroup)
                    scrollGroup[b].style.display = "inline-block"
            }
            else {
                for (var b in scrollGroup)
                    scrollGroup[b].style.display = "none"
            }
        }


        /**
         * Initializes the iDebugConsole, responsible for processing the state and options.
         * @private
         */
        var init = function (state, options) {
            var globalDebug = Debugger.prototype.globalState()
            // prevent view from init twice
            if (onScreen || !globalDebug)  return

            options = options || {}
            if (typeof state == 'object')
                options = state
            else
                options.state = state

            if (options.test == 'ios')
                options.test = /iPhone|iPod|iPad/i

            if (options.test)
                if (!options.test.test(navigator.userAgent))
                    return

            createView()

            noDTZoom(eCont) // prevent double tap zoom on ios

            // button events
            eOptions.addEventListener("click", function (e) {
                e.preventDefault()

                // disable buttons in help mode
                if (!hasClass(e.target, 'btn-help') && hasClass(bHelp, 'active'))
                    return
                // close
                if (hasClass(e.target, 'btn-close')) {
                    scrollMode = hasClass(eCont, 'scroll')
                    var width = eCont.getBoundingClientRect().width
                    if (width <= parseInt(closedSize + 5))
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
                    eOpCont.scrollTop = eOpCont.scrollTop - eOpCont.offsetHeight
                }
                // scroll-dn
                else if (hasClass(e.target, 'btn-scroll-dn')) {
                    eOpCont.scrollTop = eOpCont.scrollTop + eOpCont.offsetHeight
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

                    rt = isNaN(rt) ? 0 : rt

                    if (rt === ww || rt > ww / 2) {
                        debugCont.style.right = 0
                    } else if (rt === 0 || rt < ww / 2) {
                        debugCont.style.right = ww + "px"
                    }

                }
                // help
                else if (hasClass(e.target, 'btn-help')) {

                    var state = toggleClass(bHelp, 'active')
                    if (state) {
                        drs.snapFullScreen()
                        toggleScrollMode(true, false)
                        bHelp.innerHTML += '<span style="font-size:10px;">Exit Help</span>'
                    } else {
                        drs.restorePreSnap()
                        toggleScrollMode(false, false)
                        var exit = bHelp.getElementsByTagName('span')[0];
                        bHelp.removeChild(exit);
                    }

                    clearView(
                        '<li><b>OUTPUT LINE BUTTONS:</b></li>' +
                        '<ul>' + 'Each output line has the following buttons:' +
                        '<li>' + iStack + ' <b>Stack:</b> Shows the full stack trace.</li>' +
                        '<li>' + iLoc + ' <b>Location:</b> Show the location (file:line:col).</li>' +
                        '</ul>' +
                        '<li><b>WINDOW SIZE AND POSITION:</b></li>' +
                        '<ul>' +
                        '<li>' + iOpen + ' <b>Close/Open:</b> Toggle window open and closed.</li>' +
                        '<li>' + iDrag + '<b> Move:</b> Press and drag to move window. The shaded ' +
                        'line number area will also allow move.</li>' +
                        '<li>' + iSize + ' Toggle Bounds: Make bounds fixed or a percentage of the browser window ' +
                        '(size changes as window size changes).</li>' +
                        '<li><b>Resize:</b> Press and drag any edge to resize window, corder will ' +
                        'double resize.</li>' +
                        '<li><b>Snap:</b> Drag just past a screen edge to snap.</li>' +
                        '<li><b>FullScreen:</b> Drag 100px or more past an edge to go full screen.</li>' +
                        '<li><b>Unsnap:</b> Drag in any direction away from edge for unsnap and resize to pre-snap dimentions ' +
                        'or Click the drag button for unsnap and retain snapped size.' +
                        '<li><b>Center:</b> Tripple tap anywhere to center on the screen.</li>' +
                        '</ul>' +
                        '<li><b>WINDOW SCROLL / WINDOW GHOST:</b></li>' +
                        '<ul>' +
                        '<li>' + iScroll + ' <b>Toggle Ghost/Scroll:</b> Ghost mode will pass all mouse and ' +
                        'touch events to obscured items.  Scroll mode allows for scrolling up and ' +
                        'down, but will block touch and mouse events from obscured items.<br>' +
                        'Note: Scroll mode and ghost mode will remember thier respective sizes!</li>' +
                        '<li>' + iScrlUp + ' <b>Scroll Up:</b> One full page (only in scroll mode).</li>' +
                        '<li>' + iScrlDn + ' <b>Scroll Down:</b> One full page (only in scroll mode).</li>' +
                        '<li>' + iAutoScroll + ' <b>Auto Scroll:</b> Scroll to the last line as they come.</li>' +
                        '</ul>' +
                        '<li><b>OTHER BUTTONS:</b></li>' +
                        '<ul>' +
                        '<li>' + iClear + ' <b>Clear:</b> Clears the contents of the ouput window.</li>' +
                        '<li>' + iTogLoc + ' Toggle location: Toggle location for all lines.' +
                        ' changes as window size changes).</li>' +
                        '<li>' + iHelp + ' <b>Help:</b> You are here.</li>' +
                        '</ul>' +
                        '<li><b>CSS:</b></li>' +
                        '<ul>' +
                        '<li>Style colors and whatnot with css.' +
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
            eOutput.addEventListener("click", function (e) {
                var li = getParent(e.target.parentElement, 'li')
                if (li) {
                    // show location
                    if (hasClass(e.target, "btn-location")) {
                        toggleClass(li.getElementsByClassName("loc"), "hide")
                    }
                    // show stack
                    if (hasClass(e.target, "btn-stack")) {
                        if (!scrollMode) toggleScrollMode()
                        toggleClass(li.getElementsByClassName("stack"), "hide")
                    }
                    // show message object
                    if (hasClass(e.target, "msg-object-btn")) {
                        var obj = document.getElementById(e.target.target)
                        toggleClass(obj,'hide')
                    }
                }
            })

            // catch real errors and print to screen
            window.onerror = function (message, url, line, col, e) {
                var loc = new LogLocation({url: url, line: line, col: col, error:e})
                printToScreen('error', loc, [message], true)
                return false;
            }.bind(this);

            makeTouchScroll(eOpCont)

            // enable drag resize zoom
            drs = core.util.DRS.makeDRS(eCont, [bDrag, {left: 0, bottom: 28, top: 0, width: 28}])
            drs.togglePercent(true) // start in percent mode

            // Call the apropriate state method
            if (options.state) this[options.state].call(this)

            // finally set view status
            onScreen = true
        }

        // adds touch scrolling to a scrollable element
        function makeTouchScroll(ele) {

            var prevY, difY, scrollFrame

            ele.addEventListener("touchstart", function (e) {
                if (scrollFrame) window.cancelAnimationFrame(scrollFrame)
                var touch = e.touches[0]
                prevY = touch.clientY
                difY = null // stop scrolling
            })

            ele.addEventListener("touchmove", function (e) {
                e.preventDefault()
                e.stopPropagation()
                var touch = e.changedTouches[0]
                difY = touch.clientY - prevY
                ele.scrollTop = ele.scrollTop + difY * -1
                prevY = touch.clientY
            })

            document.addEventListener("touchend", function (e) {
                prevY = null
                if (difY)
                    scrollFrame = requestAnimationFrame(dynamicScroll);
            })

            function dynamicScroll() {
                if ((difY > 1 || difY < -1)) {
                    ele.scrollTop = ele.scrollTop + difY * -1
                    difY = difY * .92
                    scrollFrame = requestAnimationFrame(dynamicScroll);
                } else {
                    ele.scrollTop = ele.scrollTop + difY * -1
                }
            }
        }

        // end on screen output window code

        /**
         * Writes debug message to debug window and console when using screen output.
         * This function must be called using bind(caller, level)
         * @param level  {string} - Console level
         * @param options  {Debugger.options} - Options object
         * @param options.toScreen - undefined or true prints to debugger overlay
         * @returns {string}
         * @private
         */
        function output(level, options) {
            // this = the object calling debug
            var outputArgs = Array.prototype.slice.call(arguments, 0)
            outputArgs.shift() // remove level
            outputArgs.shift() // remove options

            var loc = new LogLocation()

            // add prefix
            var prefix
            if (options.prefixConsole || options.prefixOverlay)
                prefix = Debugger.prototype.getPrefixArgs(arguments, this, loc)

            // print to screen
            if (options.toScreen !== false) {
                if (options.prefixOverlay)
                    printToScreen(level, loc, prefix)
                else
                    printToScreen(level, loc, outputArgs)
            }

            // start write to console

            // Select args for console and add location string
            var consoleArgs = []
            if (options.prefixConsole)
                if(prefix.prefixObj)
                    consoleArgs = consoleArgs.concat(prefix.prefixArray, prefix.prefixObj, prefix.msgArray)
                else
                    consoleArgs = consoleArgs.concat(prefix.prefixArray, prefix.msgArray)
            else
                consoleArgs = outputArgs

            consoleArgs = consoleArgs.concat([loc.str])
            try {
                if (console[level])
                    console[level].apply(window.console, consoleArgs)
                else
                    output.call(this, 'warn', options, 'The native console does not support "' + level + '"' + '!')
            } catch (e) {
                // console does not exist, nothing needs to be done
            }

            if (options.callback){
                options.callback.call(this, level, loc)
            }
        }

        /**
         * Appends debug statement to screen overlay as HTML
         * @private
         * @param level {string} The console level
         * @param loc {LogLocation}
         * @param msgArgs {Array|object} Array of message args or prefix object.
         * @param [noescape=false] {bool} Do not html escape the output args.
         */
        function printToScreen(level, loc, inputArgs, noescape){
            var prefix, message, parts,
                stack = '',
                objects = [],
                prefixObj = inputArgs.prefixObj

            if (inputArgs.prefixArray){
                inputArgs.prefixArray.push(prefixObj)
                parts = formatArgs(inputArgs.prefixArray, noescape)
                prefix = parts[0]
                objects = parts[1]
                inputArgs = inputArgs.msgArray
            }

            parts = formatArgs(inputArgs , noescape)
            message = parts[0]
            objects = objects.concat(parts[1])

            // prepare stack
            for (var s in loc.stack)
                stack += "--> " + loc.stack[s] + "<br>"

            // create li element and message
            var e = createEle("li."+ level, eOutput)
            e.className = level
            var eMsg = createEle("div.message", e)
            // add ICONS
            var eLevel = createEle("i.level", eMsg)
            eLevel.innerHTML = level + " "
            var eStackB = createEle("i.btn-stack", eMsg, iStack + " ")
            eStackB.style.fontSize = "1.1em"
            //eSB.style.verticalAlign= "middle"
            var eLocB = createEle("i.btn-location", eMsg, iLoc)
            eLocB.style.fontSize = ".8em"
            eLocB.style.verticalAlign = "middle"
            // Hidden location
            var eLoc = createEle("span.loc.hide", eMsg)
            eLoc.innerHTML = loc.longStr + " "
            createEle("span", eMsg, ': ')
            // add message & prefix
            if(prefix) {
                createEle("span.msg-prefix", eMsg, prefix)
            }
            var eText = createEle("span.msg-text", eMsg)
            eText.innerHTML =  message
            // Add objects
            for (var i in objects)
                e.appendChild(objects[i])
            var eStack = createEle("div.stack.hide", e, stack)

            // auto scroll to bottom
            if (autoScroll)
                eOpCont.scrollTop = eOpCont.scrollHeight
        }

        function objectToList(obj, id){
            var ele = createEle("ul#"+id+'.hide')
            for (var p in obj || []) {
                var value = obj[p]
                var valueName = (typeof value === 'function' ? 'function()' :
                    value == null ? null : value.toString())
                var li = createEle("li", ele, p + ' : ' + valueName)
                if (typeof value !== "object" || value == null) continue
                var objId = id + '_' + p
                li.id = objId
                li.innerHTML = p + ' : '
                var a = createEle("a.msg-object-btn", li)
                a.innerHTML = value.toString()
                a.onclick = function (obj, id, e) {
                    e.stopPropagation()
                    id=id+'_obj'
                    var list_ele=document.getElementById(id)
                    if (!list_ele)
                        list_ele = objectToList(obj, id)
                        e.target.parentElement.appendChild(list_ele)
                    toggleClass(list_ele, 'hide')
                }.bind(this, value, objId)
            }
            return ele
        }

        function formatArgs(outputArgs, noescape) {
            // prepare message
            outputArgs = compileStrFormats(outputArgs, noescape)
            var message = '', objects = []
            for (var i in outputArgs) {
                var arg = outputArgs[i]
                if (!arg) continue // usefull ?
                if (typeof arg === 'string')
                    message += (noescape? arg : escapeHtml(arg)) + ' '
                else if (arg instanceof HTMLSafeString)
                    message += arg.safe + ' '
                else {
                    var id = 'msg-object-'+Date.now()
                    var ele = objectToList(arg, id)
                    message += '<br><a target="%s" class="msg-object-btn">%s</a><br>'.format(id, arg)
                    objects.push(ele)
                }
            }
            return [message, objects]
        }

        function compileStrFormats(outputArgs, noescape){
            // Make a copy since were going to mutate them
            outputArgs = outputArgs.slice(0)
            var str = outputArgs[0]
            if(typeof str !== 'string') return outputArgs

            // Remove confirmed formatted string or return args
            var markers = /%s|%c/g
            var foundMarkers = str.match(markers)
            if(foundMarkers) outputArgs.shift()
            else return outputArgs

            // Remove all outputArgs assigned to markers
            var fArgs = []
            for (var i in foundMarkers)
                fArgs.push(outputArgs.shift())

            // Apply formatting
            var marker, segHtml, seg, arg
            var segments = str.split(markers)
            var firstSeg = segments.shift()
            var htmlSegs = [noescape ? firstSeg : escapeHtml(firstSeg)]
            var isCss = false
            for (var i in segments) {
                i = parseInt(i)
                marker = foundMarkers[i]
                seg = segments[i]
                arg = fArgs[i]
                segHtml = noescape ? seg : escapeHtml(seg)
                if (marker == '%s') {
                    segments[i] = arg + seg
                    htmlSegs[i+1] = (noescape ? arg : escapeHtml(arg)) + segHtml
                }
                else if (marker == '%c') {
                    if(isCss) htmlSegs[i+1] = '</span>'
                    else htmlSegs[i+1] = ''
                    htmlSegs[i+1] += '<span style="' + arg + '">' + segHtml
                    segments[i] = seg
                    isCss = true
                }
            }
            if (isCss) htmlSegs[i+1] += '</span>'
            outputArgs.unshift(new HTMLSafeString(htmlSegs.join(''), firstSeg+segments.join('')))
            return outputArgs
        }

        sFormat = compileStrFormats

        function HTMLSafeString(safe, unsafe){
            this.safe = safe
            this.unsafe = unsafe
        }
        HTMLSafeString.prototype.__proto__ = String.prototype
        HTMLSafeString.prototype.toString = function(){return this.safe}
        HTMLSafeString.prototype.valueOf = function(){return this.safe}

        return {
            init: init,
            open: open,
            close: close,
            output: output,
        }
    }()

    /**
	 * @memberof iDebugConsole
     * @class Obtains the original location for a debug statement when intercepted for screen output.
     * @param options {object}
     * @param options.url {string}      - Use when the debug url known.
     * @param options.line {string}     - Use when the debug line is known.
     * @param options.offset {integer}  - offset the baseIndex (determines where to slice a constructed stack)
     * @param options.caller {object}  - The calling object
     * @constructor
     * @private
     */
    var LogLocation = function (options) {
        options = options !== undefined ? options : {}
        this.options = options
        this.stack = []
        this.url = options.url
        this.path = ''
        this.file = ''
        this.line = options.line
        this.col = options.col
        this.str = ''
        this.longStr = ''
        this.caller = options.caller
        this.func = ''
        this.error = options.error

        if(!this.error)
            try {
                var e = new Error()
                throw e
            } catch (error) {
                this.error =  error
            }

        this.init(this.error, options.offset)
    }
    LogLocation.prototype = function () {
        var baseIndex = 3

        function init(e, offset) {
            this.stack = getStack(e, offset)
            var url = this.url || e.url || this.stack[0] || "?"
            var urlLoc = locFromUrl(url)
            this.url = urlLoc.url
            this.func = this.caller && this.caller.name ?  this.caller.name : urlLoc.func || "anonymous"
            this.file = urlLoc.file || "?"
            this.line = this.line || urlLoc.line || e.line || e.lineNumber || "?"
            this.col = this.col || urlLoc.col || e.column || "?"
            var str = [this.file, this.line, this.col].join(':')
            this.str = "(" + str + ")"
            this.longStr = "(" + this.func + '@' +  str + ")"
        }

        function toString() {
            return this.str
        }

        function getStack(e, offset) {
            var index = baseIndex + (offset || 0)
            var stackS = e.stack || ""
            var stackA = stackS.split('\n') || []
            // remove internal
            stackA = stackA.slice(index)
            // create stackA if not available
            if (!(stackA.length && stackA[0])) {
                var currentFunction = arguments.callee;
                while (currentFunction) {
                    var fn = currentFunction.toString();
                    var fname = currentFunction.name || fn.match(/function\s(\w+?)\s*\(/) || ["", "anonymous"];
                    stackA.push(fname[1]);
                    currentFunction = currentFunction.callee;
                }
                // remove internal
                stackA = stackA.slice(index - 2)
            }
            return stackA
        }

        function locFromUrl(rawUrl) {
            // safari rawUrl "funcName@proto://domain:port/path/to/file.ext:line:col"
            // chrome rawUrl "    at Object.funcName (proto://domain:port/path/to/file.ext:line:col)"
            var cleanUrl = rawUrl.trim().replace(/[@()]/g, '')
            var proto = cleanUrl.match(/http:|https:|ftp:|file:/) || '';
            var urlSplit = cleanUrl.split(proto[0]) || ''
            var func = urlSplit[0].replace(/at |Object\.|<anonymous>/g, '')
            var url = [proto,urlSplit[1]].join('')
            var locA, urlA, location
            if (url) {
                urlA = url.split('/') || ''
                location = urlA.length ? urlA.pop() : ''
                locA = location.split(':')
            // For direct console input
            }else{
                locA = func.split(':')
                locA[0] = 'console'
                func = func.replace(/:\d:\d+/g, '')
            }
            return {
                raw: rawUrl,
                line: locA[1],
                col: locA[2],
                file: locA[0],
                func: func,
                url: url
            }
        }

        return {init: init, toString: toString}
    }()

    /**
     * Constructs a Profiler instance.
     * @class Use as a decorator to profile a function or as a stopwatch to time any portion of code.
     * @constructor
     * @param objectToTime {object}                     - First param is the object to time.
     * @param name {string|options}                     - Second param takes options.name as a string
     *                                                  or an options object.
     * @param options {object}                          - Instantiation options
     * @param options.name {bool} [objectToTime.name]   - A custom name for profiler output.
     * @param options.performance {bool} [true]         - Source of time, true:window.performance
     *                                                  or false:Date().getTime()
     * @param options.group {string} ["profileSite"]    - Group name, All instances in a group are
     *                                                  toggled active/inactive together
     * @param options.active {object} [true]            - Active / inactive state, overrides group state for one instance
     *
     *
     * @example <caption>Profile a function:</caption>
     * // You can instantiate the Profiler anyplace within the function's scope.
     * // The syntax must be in the form: functionName = new Profiler(functionName);
     * functionA = new Profiler(functionA);
     * function functionA(){
     *     //All this code will be profiled
     * }
     * // Note: functionA.profile will contain the Profiler instance.
     *
     * example <caption>Profile a function expression:</caption>
     * // Profiler must instantiated be after the function expression.
     * var MyCalss = functionA(){
     *     // The class constructor will be profiled
     * }
     * MyClass = new Profiler(MyClass);
     * MyClass.prototype.myMethod = function(){}
     *
     * @example <caption>Toggle all profilers on or off:</caption>
     * // A the top of your file set the global group to true (on) or false (off)
     * // Setting global = off will disable all custom groups as well.
     * Profiler.groups.global = false
     *
     * @example <caption>How to use custom groups:</caption>
     * // Create a profiler with a custom group
     * functionB = new Profiler(functionB, {group:"profileGroup1"});
     * // You can dynamically change groups at runtime
     * functionB.profile.group("profileGroup2");
     * // You can toggle custom groups the same way we did for "global"
     * Profiler.groups.profileGroup1 = false
     *
     * @example <caption>Create an inactive function Profiler:</caption>
     * var functionC_profile = new Profiler(functionC, {group:"profileGroup1", active:false});
     * // You can dynamically activate at runtime
     * functionB.profile.active(false);
     *
     * @example <caption>Use Profiler as stop watch:</caption>
     * var siteTimer = new Profiler('site wide load timer');
     * siteTimer.start('int first component');
     * // do timed stuff here..
     * siteTimer.start('int second component');
     * // Stop is called automatically when starting a new timed segment
     * siteTimer.stop();
     * // Stopping the timer allows you to do un-timed stuff here..
     * siteTimer.start('int third component');
     * // do more timed stuff here..
     * siteTimer.stop();
     * // Now print the results of the three timed segments
     * siteTimer.printResults();
	 * @memberof iDebugConsole
     */
    var Profiler = function (objectToTime, name, options) {

        // Allow options as second arg
        if (typeof name == 'object')
            options = name
        else if (!options)
            options = {name:name};

        // Allow name as first arg (timer mode)
        if(typeof objectToTime == 'string') {
            options.name = objectToTime
            objectToTime = undefined
        }

        // Option to disable console.table output
        options.table = options.table == undefined ? true : options.table

        // Properties
        this.startTime = 0;
        this.stopTime = 0;
        this.running = false; //clock is running
        this.currentName = options.name
        this.prevName = options.name
        this.initName = options.name
        this._group = 'global'
        this.group(options.group)
        this._active = true
        this.active(options.active);
        this.results = [];
        this.performance = options.performance === false ? false : !!window.performance;
        this.useTable = console.table && options.table && !/MSIE|Edge/i.test(navigator.userAgent)

        return this._initPrototype(objectToTime);

    };
    Profiler.groups = {global:true}
    Profiler.prototype = function () {
        console.info(navigator.userAgent)

        function _initPrototype(objectToTime) {

            var returnObject = this

            if (!this.currentName)
                if(objectToTime)
                    this.currentName = objectToTime.name || objectToTime.prototype.name || objectToTime.toString().slice(0,40).split('{')[0]
                else
                    this.currentName = 'Unnamed timer'

            if(this.currentName.indexOf('function')==0)
                this.currentName = 'unnamed '+ this.currentName

            if (objectToTime)
                if (active.call(this))
                    returnObject = decorate.call(this, objectToTime);
                else
                    returnObject = objectToTime;

            this.prevName = this.currentName
            this.initName = this.currentName

            return returnObject
        }

        //noinspection JSUnusedLocalSymbols
        function toString() {
            return "Timer " + this.currentName;
        }

        function group(overide) {

            if (overide !== undefined) {
                Profiler.groups[overide] = Profiler.groups[overide]==undefined ? true : Profiler.groups[overide]
                if (typeof overide != "string") throw 'Profiler.group must be a global variable as a string.';
                if (Profiler.groups[overide] === undefined)throw 'Profiler.group: Missing a predefined global variable ' +
                'with a boolean value for group "' + overide + '".';
                this._group = overide;
            }
            return this._group
        }

        function active(overide) {
            if (overide !== undefined) {
                if (typeof overide != "boolean") throw "Profiler.active must be a boolean value.";
                this._active = overide;
            }
            return this._active && Profiler.groups[this._group];
        }

        function decorate(objectToTime) {
            var _this = this
            var profileWrapper = function () {
                start.call(_this);
                var retVal = objectToTime.apply(this, arguments);
                //console.log('exicuting wrapper for ('+_this.currentName + ') this: ', this, ' retVal: '+retVal)
                stop.call(_this, 'results');
                return retVal
            };
            profileWrapper.constructor = objectToTime
            profileWrapper.prototype = objectToTime.prototype
            profileWrapper.profiler = this
            return profileWrapper
        }

        function currentTime() {

            return this.performance ? window.performance.now() : new Date().getTime();
        }

        function start(name) {
            if (!active.call(this)) return
            if(this.running) stop.call(this)
            this.currentName = name || this.currentName;
            this.startTime = currentTime();
            this.running = true;
        }

        var stop = function (print) {
            this.stopTime = currentTime();
            this.running = false;
            if (active.call(this)) {
                this.results.push({
                    name:this.currentName,
                    time:this.stopTime - this.startTime});
                if(print == 'elapsed') this.printElapsed();
                else if(print) this.printResults();
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
            console.log(this.currentName + ' [Elapsed Time] = ', '[ms:' + getElapsedMilliseconds.call(this) + '] [s: ' + getElapsedSeconds.call(this) + ']');
        };

        var printResults = function (name) {

            this.currentName = name || this.currentName;
            var secTotal = 0;
            var msTotal = 0;
            var count = 0;
            var msDp = 2
            var secDp = 6
            var rows = {}
            var row, sec, msec

            // add results to rows
            for (var i in this.results) {
                count++;
                var result = this.results[i]
                var time = result.time
                var name = result.name

                // Don't use generic names as name
                if(name && name.indexOf('function')==0) name = ''
                else if(name && name.indexOf('Unnamed timer')==0) name = ''
                else if(name == this.prevName) name = ''
                if(name) name = ' '+name

                secTotal += time / 1000;
                msTotal += time;
                msec = time.toFixed(msDp)
                sec = (time / 1000).toFixed(secDp)
                row = {
                    ms:msec,s: sec
                }
                rows[i+name] = row;
                this.prevName = name
            }

            // Add total and average to rows
            var msAverg = (msTotal / count).toFixed(msDp);
            var secAverg = (secTotal / count).toFixed(secDp);
            msTotal = msTotal.toFixed(msDp)
            secTotal = secTotal.toFixed(secDp)
            rows['total'] = {ms:msTotal , s: secTotal};
            rows['avrg'] = {ms:msAverg , s: secAverg};

            // Use console.table
            if (this.useTable) {
                console.info('PROFILER RESULTS FOR: ' + this.initName +' ');
                console.table(rows)
            }
            // Use console.log
            else {
                //get longest index
                var longIndex = 0
                for (var i in rows) {
                    if (!rows.hasOwnProperty(i))continue
                    if (i.length > longIndex)
                        longIndex = i.length
                }
                // generate output for each row
                var output = ''
                var breakLen = 60
                var breakLine = Array(breakLen).join('_')
                output += breakLine + '\r'
                output += '| Profiler: ' + this.initName + '\r'
                output += Array(breakLen).join('-')+ '\r'
                for (var i in rows) {
                    if (!rows.hasOwnProperty(i)) continue
                    row = rows[i]
                    var spacer = longIndex-i.length
                    if (spacer) spacer = Array(spacer).join(' ')
                    else spacer = ''
                    output += '| ['+i+']'+spacer+'  \t= [ms:' + row.ms + ']  \t[s:' + row.s + '] \r';
                }
                output += breakLine;
                console.log(output)
            }
        };



        return {
            _initPrototype: _initPrototype,
            start: start,
            stop: stop,
            group: group,
            active: active,
            printElapsed: printElapsed,
            printResults: printResults
        };
    }();

    return {Debugger:Debugger, Profiler:Profiler}
}()

// create a debugger for the root scope
console.log("-- init window.iDebugger")
window.iDebugger = new iDebugConsole.Debugger({window: this}, true)
debug('iDebugger ready: You can now use `debug` just like you would use `console`.')



