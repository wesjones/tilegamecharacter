(function(exports, global) {
    global["tgc"] = exports;
    var define, internal, finalize = function() {};
    (function() {
        var get, defined, pending, definitions, initDefinition, $cachelyToken = "~", $depsRequiredByDefinitionToken = ".";
        get = Function[$cachelyToken] = Function[$cachelyToken] || function(name) {
            if (!get[name]) {
                get[name] = {};
            }
            return get[name];
        };
        definitions = get("c");
        defined = get("d");
        pending = get("p");
        initDefinition = function(name) {
            if (defined[name]) {
                return;
            }
            var args = arguments;
            var val = args[1];
            if (typeof val === "function") {
                defined[name] = val();
            } else {
                definitions[name] = args[2];
                definitions[name][$depsRequiredByDefinitionToken] = val;
            }
        };
        define = internal = function() {
            initDefinition.apply(null, arguments);
        };
        resolve = function(name, fn) {
            pending[name] = true;
            var deps = fn[$depsRequiredByDefinitionToken];
            var args = [];
            var i, len;
            var dependencyName;
            if (deps) {
                len = deps.length;
                for (i = 0; i < len; i++) {
                    dependencyName = deps[i];
                    if (definitions[dependencyName]) {
                        if (!pending.hasOwnProperty(dependencyName)) {
                            resolve(dependencyName, definitions[dependencyName]);
                        }
                        resolve(dependencyName, definitions[dependencyName]);
                        delete definitions[dependencyName];
                    }
                }
            }
            if (!defined.hasOwnProperty(name)) {
                for (i = 0; i < len; i++) {
                    dependencyName = deps[i];
                    args.push(defined.hasOwnProperty(dependencyName) && defined[dependencyName]);
                }
                defined[name] = fn.apply(null, args);
            }
            delete pending[name];
        };
        finalize = function() {
            for (var name in definitions) {
                resolve(name, definitions[name]);
            }
        };
        return define;
    })();
    //! ################# YOUR CODE STARTS HERE #################### //
    //! src/character.js
    define("character", [ "dispatcher", "whichAnimationEvent" ], function(dispatcher, whichAnimationEvent) {
        var events = {
            ACTION_START: "action-start",
            ACTION_END: "action-end"
        };
        var aniEvent = whichAnimationEvent();
        function Character(suit, x, y, keys, speed) {
            var self = this;
            var accessories = {};
            var body;
            var downKeys = [];
            var actionKeys = {};
            var afterAction = {};
            var activeAction;
            var keyMap = {
                up: keys[0],
                right: keys[1],
                down: keys[2],
                left: keys[3]
            };
            var keyMapInverse = {};
            for (var i in keyMap) {
                if (keyMap.hasOwnProperty(i)) {
                    keyMapInverse[keyMap[i]] = i;
                }
            }
            var fn = function() {};
            self.x = x || 0;
            self.y = y || 0;
            self.el = document.createElement("div");
            self.el.classList.add("character");
            self.el.classList.add(suit);
            body = document.createElement("div");
            body.classList.add("body");
            self.el.appendChild(body);
            function isMoveKey(keyCode) {
                switch (keyCode) {
                  case keyMap.up:
                  case keyMap.down:
                  case keyMap.left:
                  case keyMap.right:
                    return true;

                  default:
                    return false;
                }
            }
            function hasActionKey() {
                for (var i = 0; i < downKeys.length; i += 1) {
                    if (!isMoveKey(downKeys[i])) {
                        return true;
                    }
                }
                return false;
            }
            function handleDownKeys() {
                if (activeAction) {
                    return;
                }
                var walkKeys = 0;
                var containsActions = hasActionKey();
                for (var i = 0; i < downKeys.length; i += 1) {
                    var key = downKeys[i];
                    var actionKey = !isMoveKey(key);
                    walkKeys += !actionKey ? 1 : 0;
                    if (!containsActions && walkKeys === 1) {
                        if (key === keyMap.right) {
                            self.move(speed, 0);
                        } else if (key === keyMap.left) {
                            self.move(-speed, 0);
                        } else if (key === keyMap.up) {
                            self.move(0, -speed);
                        } else if (key === keyMap.down) {
                            self.move(0, speed);
                        }
                    } else if (actionKey) {
                        walkKeys = 0;
                        self.setAction(actionKeys[key]);
                        break;
                    }
                }
                if (walkKeys && !self.el.classList.contains("walk")) {
                    self.el.classList.add("walk");
                } else if (!walkKeys && self.el.classList.contains("walk")) {
                    self.el.classList.remove("walk");
                }
                return self;
            }
            self.handleKeyDown = function(keyCode) {
                if (!keyMapInverse[keyCode] && !actionKeys[keyCode]) {
                    return;
                }
                if (downKeys.indexOf(keyCode) === -1) {
                    downKeys.push(keyCode);
                }
                return self;
            };
            self.handleKeyUp = function(keyCode) {
                if (!keyMapInverse[keyCode] && !actionKeys[keyCode]) {
                    return;
                }
                var index = downKeys.indexOf(keyCode);
                if (index !== -1) {
                    downKeys.splice(index, 1);
                }
                return self;
            };
            self.move = function(deltaX, deltaY) {
                var el = self.el;
                self.x += deltaX;
                self.y += deltaY;
                function remove(cls) {
                    if (cls && el.classList.contains(cls)) {
                        el.classList.remove(cls);
                    }
                }
                function add(cls) {
                    if (self.dir !== cls) {
                        remove(self.dir);
                        el.classList.add(cls);
                        self.dir = cls;
                    }
                }
                if (deltaX > 0) {
                    add("right");
                } else if (deltaX < 0) {
                    add("left");
                } else if (deltaY > 0) {
                    add("down");
                } else {
                    add("up");
                }
                return self;
            };
            self.addAction = function(name, keyCode, endClass) {
                actionKeys[keyCode] = name;
                if (endClass) {
                    afterAction[name] = endClass;
                }
                return self;
            };
            self.getAction = function() {
                return activeAction;
            };
            self.setAction = function(name, onFinishCallback) {
                if (activeAction) {
                    activeAction.end();
                }
                var intv;
                activeAction = {
                    name: name,
                    end: function() {
                        clearTimeout(intv);
                        body.removeEventListener(aniEvent, activeAction.end);
                        if (onFinishCallback) {
                            onFinishCallback(activeAction);
                        }
                        activeAction.end = fn;
                        self.el.classList.remove("action");
                        self.el.classList.remove(name);
                        self.dispatch(events.ACTION_END, activeAction);
                        activeAction = null;
                        if (afterAction[name]) {
                            self.el.classList.add(afterAction[name]);
                        }
                    }
                };
                body.addEventListener(aniEvent, activeAction.end);
                self.el.classList.add("action");
                self.el.classList.add(name);
                self.dispatch(events.ACTION_START, activeAction);
                return self;
            };
            self.addAccessory = function(name) {
                if (!accessories[name]) {
                    var a = document.createElement("div");
                    a.className = "accessory " + name;
                    self.el.appendChild(a);
                    accessories[name] = a;
                }
                return self;
            };
            self.removeAccessory = function(name) {
                if (accessories[name]) {
                    self.el.removeChild(accessories[name]);
                    delete accessories[name];
                }
                return self;
            };
            self.render = function() {
                handleDownKeys();
                return self;
            };
            dispatcher(self);
        }
        exports.events = events;
        exports.create = function(suit, x, y, keys, speed) {
            return new Character(suit, x, y, keys, speed);
        };
    });
    //! node_modules/hbjs/src/utils/async/dispatcher.js
    define("dispatcher", [ "apply", "isFunction", "dispatcherEvent" ], function(apply, isFunction, Event) {
        function validateEvent(e) {
            if (!e) {
                throw Error("event cannot be undefined");
            }
        }
        var dispatcher = function(target, scope, map) {
            if (target && target.on && target.on.dispatcher) {
                return target;
            }
            target = target || {};
            var listeners = {};
            function getIndexOfListener(event, callback) {
                var list = listeners[event];
                if (list) {
                    for (var i = 0; i < list.length; i += 1) {
                        if (list[i].cb === callback) {
                            return i;
                        }
                    }
                }
                return -1;
            }
            function off(event, callback) {
                validateEvent(event);
                var index = getIndexOfListener(event, callback), list = listeners[event];
                if (index !== -1) {
                    list.splice(index, 1);
                }
            }
            function on(event, callback, priority) {
                if (isFunction(callback)) {
                    validateEvent(event);
                    listeners[event] = listeners[event] || [];
                    listeners[event].push({
                        cb: callback,
                        priority: priority !== undefined ? priority : 10
                    });
                    listeners[event].sort(prioritySort);
                    return function() {
                        off(event, callback);
                    };
                }
            }
            on.dispatcher = true;
            function once(event, callback, priority) {
                if (isFunction(callback)) {
                    validateEvent(event);
                    function fn() {
                        off(event, fn);
                        apply(callback, scope || target, arguments);
                    }
                    return on(event, fn, priority);
                }
            }
            function prioritySort(a, b) {
                return a.priority - b.priority;
            }
            function mapListeners(item, number, list) {
                list[number] = item.cb;
            }
            function getListeners(event, strict) {
                validateEvent(event);
                var list, a = "*";
                if (event || strict) {
                    list = [];
                    if (listeners[a]) {
                        list = listeners[a].concat(list);
                    }
                    if (listeners[event]) {
                        list = listeners[event].concat(list);
                    }
                    list.map(mapListeners);
                    return list;
                }
                return listeners;
            }
            function removeAllListeners() {
                listeners = {};
            }
            function fire(callback, args) {
                return callback && apply(callback, target, args);
            }
            function dispatch(event) {
                validateEvent(event);
                var list = getListeners(event, true), len = list.length, i, event = typeof event === "object" ? event : new Event(event);
                if (len) {
                    arguments[0] = event;
                    for (i = 0; i < len; i += 1) {
                        if (!event.immediatePropagationStopped) {
                            fire(list[i], arguments);
                        }
                    }
                }
                return event;
            }
            if (scope && map) {
                target.on = scope[map.on] && scope[map.on].bind(scope);
                target.off = scope[map.off] && scope[map.off].bind(scope);
                target.once = scope[map.once] && scope[map.once].bind(scope);
                target.dispatch = target.fire = scope[map.dispatch].bind(scope);
            } else {
                target.on = on;
                target.off = off;
                target.once = once;
                target.dispatch = target.fire = dispatch;
            }
            target.getListeners = getListeners;
            target.removeAllListeners = removeAllListeners;
            return target;
        };
        return dispatcher;
    });
    //! node_modules/hbjs/src/utils/data/apply.js
    define("apply", [ "isFunction" ], function(isFunction) {
        return function(func, scope, args) {
            if (!isFunction(func)) {
                return;
            }
            args = args || [];
            switch (args.length) {
              case 0:
                return func.call(scope);

              case 1:
                return func.call(scope, args[0]);

              case 2:
                return func.call(scope, args[0], args[1]);

              case 3:
                return func.call(scope, args[0], args[1], args[2]);

              case 4:
                return func.call(scope, args[0], args[1], args[2], args[3]);

              case 5:
                return func.call(scope, args[0], args[1], args[2], args[3], args[4]);

              case 6:
                return func.call(scope, args[0], args[1], args[2], args[3], args[4], args[5]);
            }
            return func.apply(scope, args);
        };
    });
    //! node_modules/hbjs/src/utils/validators/isFunction.js
    define("isFunction", function() {
        var isFunction = function(val) {
            return typeof val === "function";
        };
        return isFunction;
    });
    //! node_modules/hbjs/src/utils/async/dispatcher-event.js
    define("dispatcherEvent", function() {
        function Event(type) {
            this.type = type;
            this.defaultPrevented = false;
            this.propagationStopped = false;
            this.immediatePropagationStopped = false;
        }
        Event.prototype.preventDefault = function() {
            this.defaultPrevented = true;
        };
        Event.prototype.stopPropagation = function() {
            this.propagationStopped = true;
        };
        Event.prototype.stopImmediatePropagation = function() {
            this.immediatePropagationStopped = true;
        };
        Event.prototype.toString = function() {
            return this.type;
        };
        return Event;
    });
    //! src/whichAnimationEvent.js
    define("whichAnimationEvent", function() {
        function whichAnimationEvent() {
            var t, el = document.createElement("fakeelement");
            var animations = {
                animation: "animationend",
                OAnimation: "oAnimationEnd",
                MozAnimation: "animationend",
                WebkitAnimation: "webkitAnimationEnd"
            };
            for (t in animations) {
                if (el.style[t] !== undefined) {
                    return animations[t];
                }
            }
        }
        return whichAnimationEvent;
    });
    //! #################  YOUR CODE ENDS HERE  #################### //
    finalize();
    return global["tgc"];
})(this["tgc"] || {}, function() {
    return this;
}());