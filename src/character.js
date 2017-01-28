define('character', ['dispatcher', 'whichAnimationEvent'], function (dispatcher, whichAnimationEvent) {

    var events = {
        ACTION_START: 'action-start',
        ACTION_END: 'action-end'
    };

    var aniEvent = whichAnimationEvent();

    /**
     * @param {String} suit
     * @param {Number} x
     * @param {Number} y
     * @param {Array} keys [up, right, down, left, useTool/attack, switchWeapon]
     * @constructor
     */
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
        self.el = document.createElement('div');
        self.el.classList.add("character");
        self.el.classList.add(suit);
        body = document.createElement('div');
        body.classList.add("body");
        // body.classList.add(suit);
        self.el.appendChild(body);

        function isMoveKey(keyCode) {
            switch(keyCode) {
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
            for(var i = 0; i < downKeys.length; i += 1) {
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
            //TODO: later offer combos when multiple keys match.
            var containsActions = hasActionKey();
            for (var i = 0; i < downKeys.length; i += 1) {
                var key = downKeys[i];
                var actionKey = !isMoveKey(key);
                walkKeys += !actionKey ? 1 : 0;
                if (!containsActions && walkKeys === 1) {// only let them move one direction at a time. No diagonals.
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
                    walkKeys = 0;// so it will stop the walk
                    self.setAction(actionKeys[key]);
                    break;// if an action is being performed, we cannot do another action or walk as well.
                }
            }
            if (walkKeys && !self.el.classList.contains('walk')) {
                self.el.classList.add('walk');
            } else if (!walkKeys && self.el.classList.contains('walk')) {
                self.el.classList.remove('walk');
            }

            return self;
        }

        self.handleKeyDown = function (keyCode) {
            if (!keyMapInverse[keyCode] && !actionKeys[keyCode]) {
                return;// key is not handled by character.
            }
            if (downKeys.indexOf(keyCode) === -1) {
                downKeys.push(keyCode);
            }
            return self;
        };

        self.handleKeyUp = function (keyCode) {
            if (!keyMapInverse[keyCode] && !actionKeys[keyCode]) {
                return;// key is not handled by character.
            }
            var index = downKeys.indexOf(keyCode);
            if (index !== -1) {
                downKeys.splice(index, 1);
            }
            return self;
        };

        self.move = function (deltaX, deltaY) {
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
                add('right');
            } else if (deltaX < 0) {
                add('left');
            } else if (deltaY > 0) {
                add('down');
            } else {
                add('up');
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
                activeAction.end();// the callback.
            }
            var intv;
            activeAction = {name:name, end:function() {
                clearTimeout(intv);
                body.removeEventListener(aniEvent, activeAction.end);
                if(onFinishCallback) {
                    onFinishCallback(activeAction);
                }
                activeAction.end = fn;// empty out function so it cannot cause a recursive loop if called.
                self.el.classList.remove("action");
                self.el.classList.remove(name);
                self.dispatch(events.ACTION_END, activeAction);
                activeAction = null;
                if (afterAction[name]) {
                    self.el.classList.add(afterAction[name]);
                }
            }};
            body.addEventListener(aniEvent, activeAction.end);
            //TODO: this is a hack but it works.
            // intv = setTimeout(activeAction.end, 400);
            self.el.classList.add("action");
            self.el.classList.add(name);
            self.dispatch(events.ACTION_START, activeAction);
            return self;
        };

        self.addAccessory = function(name) {
            if (!accessories[name]) {
                var a = document.createElement('div');
                a.className = 'accessory ' + name;
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

        self.render = function () {
            handleDownKeys();
            return self;
        };

        dispatcher(self);
    }

    exports.events = events;
    exports.create = function (suit, x, y, keys, speed) {
        return new Character(suit, x, y, keys, speed);
    };
});