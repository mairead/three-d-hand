(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.0.1
 */

(function() {
    "use strict";

    function $$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function $$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function $$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var $$utils$$_isArray;

    if (!Array.isArray) {
      $$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      $$utils$$_isArray = Array.isArray;
    }

    var $$utils$$isArray = $$utils$$_isArray;
    var $$utils$$now = Date.now || function() { return new Date().getTime(); };
    function $$utils$$F() { }

    var $$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      $$utils$$F.prototype = o;
      return new $$utils$$F();
    });

    var $$asap$$len = 0;

    var $$asap$$default = function asap(callback, arg) {
      $$asap$$queue[$$asap$$len] = callback;
      $$asap$$queue[$$asap$$len + 1] = arg;
      $$asap$$len += 2;
      if ($$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        $$asap$$scheduleFlush();
      }
    };

    var $$asap$$browserGlobal = (typeof window !== 'undefined') ? window : {};
    var $$asap$$BrowserMutationObserver = $$asap$$browserGlobal.MutationObserver || $$asap$$browserGlobal.WebKitMutationObserver;

    // test for web worker but not in IE10
    var $$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function $$asap$$useNextTick() {
      return function() {
        process.nextTick($$asap$$flush);
      };
    }

    function $$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new $$asap$$BrowserMutationObserver($$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function $$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = $$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function $$asap$$useSetTimeout() {
      return function() {
        setTimeout($$asap$$flush, 1);
      };
    }

    var $$asap$$queue = new Array(1000);

    function $$asap$$flush() {
      for (var i = 0; i < $$asap$$len; i+=2) {
        var callback = $$asap$$queue[i];
        var arg = $$asap$$queue[i+1];

        callback(arg);

        $$asap$$queue[i] = undefined;
        $$asap$$queue[i+1] = undefined;
      }

      $$asap$$len = 0;
    }

    var $$asap$$scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      $$asap$$scheduleFlush = $$asap$$useNextTick();
    } else if ($$asap$$BrowserMutationObserver) {
      $$asap$$scheduleFlush = $$asap$$useMutationObserver();
    } else if ($$asap$$isWorker) {
      $$asap$$scheduleFlush = $$asap$$useMessageChannel();
    } else {
      $$asap$$scheduleFlush = $$asap$$useSetTimeout();
    }

    function $$$internal$$noop() {}
    var $$$internal$$PENDING   = void 0;
    var $$$internal$$FULFILLED = 1;
    var $$$internal$$REJECTED  = 2;
    var $$$internal$$GET_THEN_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$selfFullfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function $$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.')
    }

    function $$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        $$$internal$$GET_THEN_ERROR.error = error;
        return $$$internal$$GET_THEN_ERROR;
      }
    }

    function $$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function $$$internal$$handleForeignThenable(promise, thenable, then) {
       $$asap$$default(function(promise) {
        var sealed = false;
        var error = $$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            $$$internal$$resolve(promise, value);
          } else {
            $$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          $$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          $$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function $$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, thenable._result);
      } else if (promise._state === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, thenable._result);
      } else {
        $$$internal$$subscribe(thenable, undefined, function(value) {
          $$$internal$$resolve(promise, value);
        }, function(reason) {
          $$$internal$$reject(promise, reason);
        });
      }
    }

    function $$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        $$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = $$$internal$$getThen(maybeThenable);

        if (then === $$$internal$$GET_THEN_ERROR) {
          $$$internal$$reject(promise, $$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          $$$internal$$fulfill(promise, maybeThenable);
        } else if ($$utils$$isFunction(then)) {
          $$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          $$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function $$$internal$$resolve(promise, value) {
      if (promise === value) {
        $$$internal$$reject(promise, $$$internal$$selfFullfillment());
      } else if ($$utils$$objectOrFunction(value)) {
        $$$internal$$handleMaybeThenable(promise, value);
      } else {
        $$$internal$$fulfill(promise, value);
      }
    }

    function $$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      $$$internal$$publish(promise);
    }

    function $$$internal$$fulfill(promise, value) {
      if (promise._state !== $$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = $$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
      } else {
        $$asap$$default($$$internal$$publish, promise);
      }
    }

    function $$$internal$$reject(promise, reason) {
      if (promise._state !== $$$internal$$PENDING) { return; }
      promise._state = $$$internal$$REJECTED;
      promise._result = reason;

      $$asap$$default($$$internal$$publishRejection, promise);
    }

    function $$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + $$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + $$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        $$asap$$default($$$internal$$publish, parent);
      }
    }

    function $$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          $$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function $$$internal$$ErrorObject() {
      this.error = null;
    }

    var $$$internal$$TRY_CATCH_ERROR = new $$$internal$$ErrorObject();

    function $$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        $$$internal$$TRY_CATCH_ERROR.error = e;
        return $$$internal$$TRY_CATCH_ERROR;
      }
    }

    function $$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = $$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = $$$internal$$tryCatch(callback, detail);

        if (value === $$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          $$$internal$$reject(promise, $$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== $$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        $$$internal$$resolve(promise, value);
      } else if (failed) {
        $$$internal$$reject(promise, error);
      } else if (settled === $$$internal$$FULFILLED) {
        $$$internal$$fulfill(promise, value);
      } else if (settled === $$$internal$$REJECTED) {
        $$$internal$$reject(promise, value);
      }
    }

    function $$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          $$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          $$$internal$$reject(promise, reason);
        });
      } catch(e) {
        $$$internal$$reject(promise, e);
      }
    }

    function $$$enumerator$$makeSettledResult(state, position, value) {
      if (state === $$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
        return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function $$$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor($$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          $$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            $$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        $$$internal$$reject(this.promise, this._validationError());
      }
    }

    $$$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return $$utils$$isArray(input);
    };

    $$$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    $$$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var $$$enumerator$$default = $$$enumerator$$Enumerator;

    $$$enumerator$$Enumerator.prototype._enumerate = function() {
      var length  = this.length;
      var promise = this.promise;
      var input   = this._input;

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    $$$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var c = this._instanceConstructor;
      if ($$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== $$$internal$$PENDING) {
          entry._onerror = null;
          this._settledAt(entry._state, i, entry._result);
        } else {
          this._willSettleAt(c.resolve(entry), i);
        }
      } else {
        this._remaining--;
        this._result[i] = this._makeResult($$$internal$$FULFILLED, i, entry);
      }
    };

    $$$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === $$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === $$$internal$$REJECTED) {
          $$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        $$$internal$$fulfill(promise, this._result);
      }
    };

    $$$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    $$$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      $$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt($$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt($$$internal$$REJECTED, i, reason);
      });
    };

    var $$promise$all$$default = function all(entries, label) {
      return new $$$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    };

    var $$promise$race$$default = function race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor($$$internal$$noop, label);

      if (!$$utils$$isArray(entries)) {
        $$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        $$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        $$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === $$$internal$$PENDING && i < length; i++) {
        $$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    };

    var $$promise$resolve$$default = function resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$resolve(promise, object);
      return promise;
    };

    var $$promise$reject$$default = function reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor($$$internal$$noop, label);
      $$$internal$$reject(promise, reason);
      return promise;
    };

    var $$es6$promise$promise$$counter = 0;

    function $$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function $$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var $$es6$promise$promise$$default = $$es6$promise$promise$$Promise;

    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise’s eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function $$es6$promise$promise$$Promise(resolver) {
      this._id = $$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if ($$$internal$$noop !== resolver) {
        if (!$$utils$$isFunction(resolver)) {
          $$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof $$es6$promise$promise$$Promise)) {
          $$es6$promise$promise$$needsNew();
        }

        $$$internal$$initializePromise(this, resolver);
      }
    }

    $$es6$promise$promise$$Promise.all = $$promise$all$$default;
    $$es6$promise$promise$$Promise.race = $$promise$race$$default;
    $$es6$promise$promise$$Promise.resolve = $$promise$resolve$$default;
    $$es6$promise$promise$$Promise.reject = $$promise$reject$$default;

    $$es6$promise$promise$$Promise.prototype = {
      constructor: $$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === $$$internal$$FULFILLED && !onFulfillment || state === $$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor($$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          $$asap$$default(function(){
            $$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          $$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    var $$es6$promise$polyfill$$default = function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport =
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return $$utils$$isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = $$es6$promise$promise$$default;
      }
    };

    var es6$promise$umd$$ES6Promise = {
      'Promise': $$es6$promise$promise$$default,
      'polyfill': $$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = es6$promise$umd$$ES6Promise;
    }
}).call(this);
}).call(this,require("FWaASH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"FWaASH":1}],3:[function(require,module,exports){
'use strict';

var kalman = require('./kalmanFilter.js');
var kalmanObjects = kalman.kalmanFilter();
var outputDebugging = require('./outputDebugging.js');

/**
 * -------
 * threeVR (https://github.com/richtr/threeVR)
 * -------
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 *
 * Author: Rich Tibbett (http://github.com/richtr)
 * License: The MIT License
 *
**/

//Note: manual user drag (rotate) and pinch (zoom) override handling
//removed for ease of use

//Added Kalman filtering to smooth on mobile device

exports.DeviceOrientationController = function ( object, domElement ) {

	this.object = object;
	this.element = domElement || document;

	this.freeze = true;

	this.useQuaternions = true; // use quaternions for orientation calculation by default

	this.deviceOrientation = {}; //this is the event object or referencing alpha, beta, gamma
	this.screenOrientation = window.orientation || 0;

	var CONTROLLER_EVENT = {
		SCREEN_ORIENTATION: 'orientationchange',
		MANUAL_CONTROL:     'userinteraction', // userinteractionstart, userinteractionend
		ROTATE_CONTROL:     'rotate'         // rotatestart, rotateend
	};

	var fireEvent = function () {
		var eventData;

		return function ( name ) {
			eventData = arguments || {};

			eventData.type = name;
			eventData.target = this;

			this.dispatchEvent( eventData );
		}.bind( this );
	}.bind( this )();

	this.onDeviceOrientationChange = function ( event ) {
		this.deviceOrientation = event;
	}.bind( this );

	this.onScreenOrientationChange = function () {
		this.screenOrientation = window.orientation || 0;
		//outputDebugging.showOrientation(window.orientation);

		fireEvent( CONTROLLER_EVENT.SCREEN_ORIENTATION );
	}.bind( this );

	var createQuaternion = (function () {

		var finalQuaternion = new THREE.Quaternion();
		var deviceEuler = new THREE.Euler();
		var screenTransform = new THREE.Quaternion();
		var worldTransform = new THREE.Quaternion( - Math.sqrt(0.5), 0, 0, Math.sqrt(0.5) ); // - PI/2 around the x-axis
		var minusHalfAngle = 0;
 
		return function ( alpha, beta, gamma, screenOrientation ) {

			deviceEuler.set( beta, alpha, -gamma, 'YXZ' ); //don't know why Gamma is negative either. It disappears here
			finalQuaternion.setFromEuler( deviceEuler );
			minusHalfAngle = - screenOrientation / 2;
			screenTransform.set( 0, Math.sin( minusHalfAngle ), 0, Math.cos( minusHalfAngle ) );
			finalQuaternion.multiply( screenTransform );
			finalQuaternion.multiply( worldTransform ); 
			//World transform se ems to position it in front, instead of having to look at it upside down

			return finalQuaternion;
		};

	})();

	this.updateDeviceMove = (function () {

		var deviceQuat = new THREE.Quaternion();
		var alpha, beta, gamma, orient;

		return function () {

			//alpha hack forces the values into the middle of the 360 degrees of rotation to 
			//prevent the kalman filter skewing when it hits the 0-360 gap
			alpha = this.deviceOrientation.alpha;
			if(alpha > 270){
				alpha = alpha - 90; //was 180
			}else if (alpha < 90){
				alpha = alpha + 90;
			}

			alpha  = THREE.Math.degToRad( alpha || 0 ); // Z
			//alpha  = THREE.Math.degToRad( this.deviceOrientation.alpha  || 0 ); // Z'
			beta   = THREE.Math.degToRad( this.deviceOrientation.beta  || 0 ); // X'
			gamma  = THREE.Math.degToRad( this.deviceOrientation.gamma || 0 ); // Y''
			orient = THREE.Math.degToRad( this.screenOrientation       || 0 ); // O

			outputDebugging.showAccelerometer();

			// only process non-zero 3-axis data
			if ( alpha !== 0 && beta !== 0 && gamma !== 0) {

				kalmanObjects.KO.z_k = $V([alpha, beta, gamma]); 
	    	kalmanObjects.KM.update(kalmanObjects.KO);
	    	outputDebugging.kalmanOutput(kalmanObjects.KM.x_k.elements);
	    	
	    	//kalman filtered values to smooth interpolation from accelerometer
	    	alpha = kalmanObjects.KM.x_k.elements[0];
	    	beta = kalmanObjects.KM.x_k.elements[1];
	    	gamma = kalmanObjects.KM.x_k.elements[2];

	    	deviceQuat = createQuaternion( alpha, beta, gamma, orient );

				if ( this.freeze ) {
					return;
				}
				this.object.quaternion.copy( deviceQuat );
			}

		};

	})();

	this.update = function () {
		this.updateDeviceMove();
	};

	this.connect = function () {

		window.addEventListener( 'orientationchange', this.onScreenOrientationChange, false );
		window.addEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );
		this.freeze = false;
	};

	this.disconnect = function () {
		this.freeze = true;
		window.removeEventListener( 'orientationchange', this.onScreenOrientationChange, false );
		window.removeEventListener( 'deviceorientation', this.onDeviceOrientationChange, false );
	};

	this.prototype = Object.create( THREE.EventDispatcher.prototype );

};


},{"./kalmanFilter.js":7,"./outputDebugging.js":9}],4:[function(require,module,exports){
'use strict';

var leapBox = require('./leapBox.js');

//animate is called after the Hand model has been loaded by ThreeJs
//This is recalled with each Leap frame receieved with the Leap.loop
//This contains all the positioning code for moving the Hand mesh around
exports.animate = function(frame, handMesh, fingers){
  var fingersAssigned = false; //flag to determine if all fingers have been detected and assigned an ID

  function rotationCtrl(dir){
      // make sure fingers won't go into weird position. T
      //I think this doctors the direction object for each rotation to prevent large shifts
        for (var i = 0, length = dir.length; i < length; i++) {
          if (dir[i] >= 0.8) {
            dir[i] = 0.8;
          }
          
        }
      return dir;
    }
        
    function rotateBones(finger){
      //treat direction value before applying rotation
      var fingerDir = rotationCtrl(finger.pointable.direction);

      //TODO: Need to add more fine tuning to Direction constraint to prevent them bending backwards but without limiting forward or side movement

      //var fingerDir = finger.pointable.direction;

      // apply rotation to the main bone
      finger.mainBone.rotation.set(0, -fingerDir[0], fingerDir[1]); 

      // apply rotation to phalanx bones
      for (var i = 0, length = finger.phalanges.length; i < length; i++) {
        var phalange = finger.phalanges[i];
        phalange.rotation.set(0, 0, fingerDir[1]);
      }
    }

  if (frame.hands.length > 0) {

    //set IDs at beginning for fingers
    if(!fingersAssigned){
      //if all 5 pointables are available
      if (frame.pointables.length === 5) {
        //assign the current ID to the fingers array
        for (var i = frame.pointables.length - 1; i >= 0; i--) {
          fingers[i].id = frame.pointables[i].id;
          //console.log("ASSIGNED ID: ", fingers[i].id)
        }
        fingersAssigned = true; //set flag to prevent IDs being reassigned
      }
    }

    //Setting palm position and rotation to position of hand mesh on screen
    var hand = frame.hands[0];

    var position = leapBox.leapToScene( frame , hand.palmPosition );//ensures hand appears within Leap Js interaction box
    handMesh.position = position; // apply position

    var rotation = {
      z: hand.pitch(),
      y: hand.yaw(),
      x: hand.roll()
    };

    //Rotate the main bone of the hand and palm around the hand rotation
    handMesh.bones[0].rotation.set(rotation.x, rotation.y, rotation.z); //pitch is in reverse. The user's position is in the negative z axis

    //For each finger in the hand set the rotation of the main finger bone, and the smaller phalanx bones

    for (var k = fingers.length - 1; k >= 0; k--) {
      //console.log("FINGER ID: ", fingers[i].id)

      fingers[k].fingerVisible = false;
    
      for (var j = frame.pointables.length - 1; j >= 0; j--) {
         //console.log("POINTABLE ID: ", frame.pointables[j].id)
         if (fingers[k].id === frame.pointables[j].id) {
          //console.log("FINGER FOUND");
          fingers[k].fingerVisible = true; //finger ID has been found and therefore the finger is visible
          //push current pointable item into fingers array
          fingers[k].pointable = frame.pointables[j];
          rotateBones(fingers[k]);
        }
      }
    }
  }
};
},{"./leapBox.js":8}],5:[function(require,module,exports){
'use strict';

require('es6-promise').polyfill();

var threeDStage = require('./threeDStage.js');
var orientationController = require('./DeviceOrientationController.js');
var hand = require('./hand.js');
var animateHand = require('./animateHand.js');

var handLoader = hand.createHand();  //returns loader async object
var handRig;
var stage = threeDStage.createStage();
var ctrl = orientationController.DeviceOrientationController;
var connection;

//TODO ES6: Would destructuring help recuce the footprint of this 
//method call and keep it in 80 chars 
stage.orientationControls = new ctrl( stage.camera, stage.renderer.domElement );
stage.orientationControls.connect();

//create promise implementation here to call hand loader
var loadHandRigging = new Promise(function(resolve){
  handLoader.handRigLoader.onLoadComplete = function(){
    resolve();
  };
});

//add hand to scene after promise is resolved
loadHandRigging.then(function() {
  handRig = hand.getHand();
  stage.scene.add(handRig.handMesh);  
  connection = new WebSocket('ws://' + window.location.hostname + ':1337');
  connection.onmessage = function (message) { 
    var frameData = JSON.parse(message.data);
    animateHand.animate(frameData, handRig.handMesh, handRig.fingers); 
  };
}, function(err) {
  console.log(err, "hand rig not loaded in reject");
});

// function onWindowResize() {

//   // windowHalfX = window.innerWidth / 2,
//   // windowHalfY = window.innerHeight / 2,

//   stage.camera.aspect = window.innerWidth / window.innerHeight;
//   stage.camera.updateProjectionMatrix();

//   stage.effect.setSize( window.innerWidth, window.innerHeight );

// }

// Render loop runs stage updating and view to cardboard
function render() {
	//stage.orientationControls.update();
	//TODO ES6: Destructuring and aliasing in the parameters would
	// clean up the render objects and make them more readable
  stage.effect.render( stage.scene, stage.camera );
  requestAnimationFrame(render);
}
render();

// //window.addEventListener( 'resize', onWindowResize, false );



},{"./DeviceOrientationController.js":3,"./animateHand.js":4,"./hand.js":6,"./threeDStage.js":10,"es6-promise":2}],6:[function(require,module,exports){
'use strict';

	var fingers = [
	  {id: 0, pointable: {}}, //middle
	  {id: 0, pointable: {}}, //ring
	  {id: 0, pointable: {}}, //index
	  {id: 0, pointable: {}}, //little
	  {id: 0, pointable: {}} //thumb
	];

	var hand;

exports.createHand = function(){ //set id for fingers once and assign bones
	
	//Instantiate new Mesh object by loading Blender JSON export
	var loader = new THREE.JSONLoader();

	//load Hand model with ThreeJS Loader
	loader.load('js/rigging.json', function (geometry, materials) {
	  var material;

	  hand = new THREE.SkinnedMesh(
	    geometry,
	    new THREE.MeshFaceMaterial(materials)
	  );

	  material = hand.material.materials;

	  for (var i = 0; i < materials.length; i++) {
	    var mat = materials[i];

	    mat.skinning = true;
	  }

	  //add bones from Hand into fingers array

	  //middle
	  fingers[0].mainBone = hand.bones[9];
	  fingers[0].phalanges = [hand.bones[10], hand.bones[11]];

	  //ring
	  fingers[1].mainBone = hand.bones[5];
	  fingers[1].phalanges = [hand.bones[6], hand.bones[7]];

	  //index
	  fingers[2].mainBone = hand.bones[13];
	  fingers[2].phalanges = [hand.bones[14], hand.bones[15]];

	  //little
	  fingers[3].mainBone = hand.bones[17];
	  fingers[3].phalanges = [hand.bones[18], hand.bones[19]];

	  //thumb
	  fingers[4].mainBone = hand.bones[2];
	  fingers[4].phalanges = [hand.bones[3]];

	});
	
	return {
		handRigLoader: loader
	};

};

exports.getHand = function(){
	return {
		handMesh: hand,
	  fingers: fingers
	};
};
},{}],7:[function(require,module,exports){
'use strict';

exports.kalmanFilter = function(){

  var x_0 = $V([0,3,1.5]); //vector. Initial accelerometer values.
  //These are the base values when the device is held up straight

  //P prior knowledge of state
  var P_0 = $M([
                [2,0,0],
                [0,2,0],
                [0,0,2]
              ]); //identity matrix. Initial covariance. Set to 1
  var F_k = $M([
                [1,0,0],
                [0,1,0], //0 if interaction is unpredictable
                [0,0,1]
              ]); //identity matrix. How change to model is applied. Set to 1 if smooth changes
  var Q_k = $M([
                [0,0,0],
                [0,0,0],
                [0,0,0]
              ]); //empty matrix. Noise in system is zero

  var KM = new KalmanModel(x_0,P_0,F_k,Q_k);

  var z_k = $V([0,3,1.5]); //Updated accelerometer values. Is this amount to correct in each pass? 
  //var z_k = $V([0,0,0]);
  var H_k = $M([
                [1,0,0],
                [0,1,0],
                [0,0,1]
              ]); //identity matrix. Describes relationship between model and observation
  var R_k = $M([
                [2,0,0],
                [0,2,0],
                [0,0,2]
              ]); //2x Scalar matrix. Describes noise from sensor. Set to 2 to begin
  var KO = new KalmanObservation(z_k,H_k,R_k);

  return {
    KO:KO,
    KM:KM
  };
};
},{}],8:[function(require,module,exports){
'use strict';

//Interaction Box conversion method to find central co-ordinates for interacting with stage. 
//Does it need third iteration for z co-ordinates? Is Z axis going to be positive or negative
exports.leapToScene = function(frame, leapPos){

  var iBox = frame.interactionBox;

  var left = iBox.center[0] - iBox.size[0]/2;
  var top = iBox.center[1] + iBox.size[1]/2;
  var back = iBox.center[2] + iBox.size[2]/2;

  var x = leapPos[2] - left;
  var y = leapPos[1] - top;
  var z = leapPos[0] - back;

  //why are x and z axis swapped round from the Hand position? This is weird.

  x /= iBox.size[0];
  y /= iBox.size[1];
  z /= iBox.size[2];

  // x *= width;
  // y *= height;
 //  z *= 500; //what is depth of interaction box as relates to screen size?


//this is fudging the interaction box positions to map to center of screen
//this is partly to do with the camera positioning. its not flat to stage.
  x *= 10;
  y *= 10;
  z *= 10;

  x += 10;
  y += 10;
  z += 10;

  return {x: x ,y: y ,z: -z};

  //z seems to be working in the x axis and vice versa? 
  //Why does z require the negative value here?
};
},{}],9:[function(require,module,exports){
'use strict';

exports.kalmanOutput = function(kalman){
	$(".kalman").html("KAL: beta: " +kalman[1].toFixed(6)+", alpha: " +kalman[0].toFixed(6) + ", gamma: " +kalman[2].toFixed(6));
};

exports.showFlip = function(prevAlpha, currAlpha, diff){
	$(".debugger").html("prev: " + prevAlpha + "  curr: " + currAlpha + "  diff: " + diff);
};

exports.showOrientation = function(orientation){
	$(".debugger").html("orientation:" + orientation);
};

exports.showAccelerometer = function(){
	// function getDeviceRotation(e){
	// //	$(".originals").html('ORIG beta: ' + e.beta.toFixed(6) + ", alpha: " + e.alpha.toFixed(6) + ", gamma: " + e.gamma.toFixed(6));
		
	// 	var alpha = THREE.Math.degToRad(e.alpha).toFixed(6); 
	// 	var beta = THREE.Math.degToRad(e.beta).toFixed(6);
	// 	var gamma = THREE.Math.degToRad(e.gamma).toFixed(6);
	
	// //	$(".accelerometer").html('RADI beta: ' + beta + ", alpha: " + alpha + ", gamma: " + gamma);
	// }

	// if (window.DeviceOrientationEvent) {
	//   window.addEventListener('deviceorientation', getDeviceRotation, false);
	// }else{
	//   $(".accelerometer").html("NOT SUPPORTED");
	// }
};

exports.showLeapData = function(frameData){
	$(".debugger").html("leapdata:" + frameData);
};


},{}],10:[function(require,module,exports){
'use strict';

//TODO ES6: Add default param unless right hand specified to point left
exports.createStage = function(){
	 
	//TODO ES6: convert to destructuring at bottom 
	var stageObjects = {}; 

	//TODO ES6: Declare vars as let further down where they are used
	var container;// = document.querySelector(viewport); 
	var light; 
	var torus;
	var geometry; 
	var material;
	var scene = new THREE.Scene();
	var camera;
	var effect; 

	var gridHelper;
	var size = 10;
	var step = 1;

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	
	//why is it only occupying half the screen? is this the aspect?
	var WIDTH = window.innerWidth; 
	var HEIGHT = window.innerHeight;

	var VIEW_ANGLE = 10; //was 10
	var ASPECT = WIDTH / HEIGHT; 
	var NEAR = 1;
	var FAR = 10000;

	var renderer = new THREE.WebGLRenderer({antialias:true}); 

	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFShadowMap;
	renderer.shadowMapAutoUpdate = true;
	renderer.setClearColor( 0xffffff, 1);
	container.appendChild(renderer.domElement);
	
	effect = new THREE.StereoEffect( renderer );
	
	effect.setSize(WIDTH, HEIGHT);
	//nb: can we change separation to calibrate for users
	effect.separation = 2.5 * 0.0254 / 2; //cardboard 2.5 inches

	//camera
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.rotation.order = 'YZX';
	camera.position.set(60, 10, VIEW_ANGLE); //was 60, 10, VIEW_ANGLE
	camera.lookAt( scene.position );

	scene.add(camera);

	//lighting
	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 100, 0);
	light.castShadow = true;
	light.shadowCameraLeft = -60;
	light.shadowCameraTop = -60;
	light.shadowCameraRight = 60;
	light.shadowCameraBottom = 60;
	light.shadowCameraNear = 1;
	light.shadowCameraFar = 1000;
	light.shadowBias = -0.0001;
	light.shadowMapWidth = light.shadowMapHeight = 1024;
	light.shadowDarkness = 0.7;
	scene.add(light);

	//grid helper
	gridHelper = new THREE.GridHelper( size, step );	
	gridHelper.position = new THREE.Vector3( 5, -1, 0 );
	scene.add(gridHelper);
	
	//geometry
	geometry = new THREE.TorusGeometry(2, 1, 12, 12);
	material = new THREE.MeshNormalMaterial( );
	torus = new THREE.Mesh( geometry, material );
	
	//why is torus appearing to left of screen instead of middle?
	//torus.position.set(100, 3, 0); 
	torus.position.set(2, 2, 0); 
	//moved from (2,2,0) to position items behind camera. This is a hack 
	//combined with the alpha position to prevent the kalman filter breaking
	torus.rotation.y += 90;

	scene.add(torus);

	//TODO ES6: Return fully populated object here, instead of above, will save chars
	stageObjects = {
		effect: effect,
		renderer: renderer,
		scene: scene,
		camera: camera
	};

	return stageObjects;
};

},{}]},{},[5])