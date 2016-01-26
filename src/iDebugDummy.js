/**
 * Created by Simplex Studio, LTD on 1/17/16.
 */

//dummy classes for when Debugger is not available
var iDebugConsole = iDebugConsole || function() {

    var Debugger = function (objs) {
        for (var i in objs) {
            objs[i].debug = function (){}
            for (var f in console)
                if (typeof console[f] == 'function')
                    objs[i].debug[f] = function (){}
        }
    };
    Debugger.prototype = {
        state: function(){},
        off: function(){},
        on: function(){},
        global: function(){},
        initView: function(){},
    }
    window.iDebugger = new Debugger({window: this})

    var Profiler = function (f){
        f.profiler = this
        return f
    };
    Profiler.groups = {global:true}
    Profiler.prototype={
        start: function(){},
        stop: function(){},
        group: function(g){if(g) Profiler.groups[g] = true},
        active: function(){},
        printElapsed: function(){},
        printResults: function(){}
    };
    return {Debugger:Debugger, Profiler:Profiler}
}();


