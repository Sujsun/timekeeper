/**
 * Plugin: TimeKeeper
 * Author: Sundarasan Natarajan
 * GIT: https://github.com/Sujsun/timekeeper.git
 * Version: 0.0.2
 */
(function (root, factory) {

  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else {
    // Browser globals
    root.TimeKeeper = factory();
  }

})(window, function () {

  /**
   * ------------
   * AJAX Helpers
   * ------------
   */
  var AJAX = {

    /**
     * AJAX Helper
     * @param  {Object} params { type: 'get', dataType: 'json', data: { .. }, headers: { ... } success: Function, error: Function }
     * @return {XHRObject}
     */
    call: function(params) {
      var result,
        headerName,
        headerValue;

      typeof(params) === 'object' || (params = {});
      typeof(params.type) === 'string' || (params.type = 'get');
      typeof(params.type) === 'string' && (params.type = params.type.toUpperCase());
      typeof(params.success) === 'function' || (params.success = EMPTY_FUNCTION);
      typeof(params.error) === 'function' || (params.error = EMPTY_FUNCTION);

      var xhttp = new XMLHttpRequest();

      for (headerName in params.headers) {
        headerValue = params.headers[headerName];
        xhttp.setRequestHeader(headerName, headerValue);
      }

      xhttp.onreadystatechange = function() {

        if (xhttp.readyState == 4) {
          if ((xhttp.status >= 200 && xhttp.status < 300) || xhttp.status == 304) {
            result = xhttp.responseText;
            if (params.dataType === 'json') {
              try {
                result = JSON.parse(xhttp.responseText);
              } catch (error) {
                params.error.call(params.context, error, xhttp, params);
              }
            }
            params.success.call(params.context, result, xhttp, params);
          } else {
            params.error.call(params.context, new Error('Ajax failed'), xhttp, params);
          }
        }

      };

      xhttp.open(params.type, params.url, true);
      xhttp.send(params.data);
      return xhttp;
    },

  };

  /**
   * ------------
   * Object Utils
   * ------------
   */
  var ObjectUtils = {

    clone: function (obj) {
      var newObj = {}, key;
      for (key in obj) {
        newObj[key] = obj[key];
      }
      return newObj;
    },

    defaults: function (object, defaults) {
      var key;
      for (key in defaults) {
        typeof(object[key]) === 'undefined' && (object[key] = defaults[key]);
      }
      return object;
    },

    unbind: Function.bind.bind(Function.bind),

    instantiate: function (constructor, args) {
      return new (this.unbind(constructor, null).apply(null, args));
    },

  };

  /**
   * ---------
   * Minivents
   * ---------
   */
  function Events(target) {
    var events = {},
      empty = [];
    target = target || this
    /**
     *  On: listen to events
     */
    target.on = function(type, func, ctx) {
      (events[type] = events[type] || []).push([func, ctx])
    }
    /**
     *  Off: stop listening to event / specific callback
     */
    target.off = function(type, func) {
      type || (events = {})
      var list = events[type] || empty,
        i = list.length = func ? list.length : 0;
      while (i--) func == list[i][0] && list.splice(i, 1)
    }
    /** 
     * Emit: send event, callbacks will be triggered
     */
    target.emit = function(type) {
      var e = events[type] || empty,
        list = e.length > 0 ? e.slice(0, e.length) : e,
        i = 0,
        j;
      while (j = list[i++]) j[0].apply(j[1], empty.slice.call(arguments, 1))
    };
  };

  /**
   * ----------
   * TimeKeeper
   * ----------
   */
  var OPTIONS_DEFAULTS = {
    ajaxType: 'get',
    ajaxMilliUrl: '/utcMillis',
    syncInterval: 1 * 60 * 1000, // 1 minute
    differenceInMillis: 0,
    overrideDate: false,
    responseParser: function (response) {
      return parseInt(response);
    },
  };

  var EVENTS = {
    SYNC: 'sync',
    SYNCED: 'synced',
    SYNC_ERROR: 'sync_error',

    FIRST_SYNC: 'first_sync',
    FIRST_SYNCED: 'first_synced',
    FIRST_SYNC_ERROR: 'first_sync_error',
  };

  /**
   * TimeKeeper Constructor
   */
  function TimeKeeper (options) {
    this._options = ObjectUtils.clone(options || {});
    this._options = ObjectUtils.defaults(this._options, OPTIONS_DEFAULTS);
    this._differenceInMillis = this._options.differenceInMillis;
    this._isSyncedOnce = false;
    this._event = new Events();
    this.setCorrectTimeInMillis(this._options.correctTimeInMillis);
    this._options.overrideDate && (this.overrideDate());
    return this;
  }

  /**
   * TimeKeeper Public Methods
   */
  TimeKeeper.prototype.sync = function () {
    return this._sync.apply(this, arguments);
  };

  TimeKeeper.prototype.Date = function () {
    return this._getCorrectDate();
  };

  TimeKeeper.prototype.overrideDate = function () {
    var self = this;
    window.Date = function (OriginalDate) {
      function CorrectedDate() {
        var date = ObjectUtils.instantiate(OriginalDate, arguments),
          argumentsLength = arguments.length;
        if (argumentsLength === 0) {
          date.setTime(self._getCorrectDateMillis());
        }
        return date;
      }
      CorrectedDate.prototype = OriginalDate.prototype;
      return CorrectedDate;
    }(this._Date);
    if (!window.Date.now) {
      window.Date.now = function now () {
        return new window.Date().getTime();
      };
    }
    if (!window.Date.parse) {
      window.Date.parse = this._Date.parse;
    }
    if (!window.Date.UTC) {
      window.Date.UTC = this._Date.UTC;
    }
  };

  TimeKeeper.prototype.releaseDate = function () {
    return (window.Date = this._Date);
  };

  TimeKeeper.prototype.setCorrectTimeInMillis = function (correctTimeInMillis) {
    return typeof(correctTimeInMillis) === 'number' && this._findDifferenceInMillis(correctTimeInMillis);
  };

  TimeKeeper.prototype.setDifferenceInMillis = function (differenceInMillis) {
    return (this._differenceInMillis = differenceInMillis);
  };

  TimeKeeper.prototype.getDifferenceInMillis = function () {
    return this._differenceInMillis;
  };

  TimeKeeper.prototype.startSync = function (syncInterval) {
    return this._startSync.apply(this, arguments);
  };

  TimeKeeper.prototype.stopSync = function () {
    return this._stopSync.apply(this, arguments);
  };

  TimeKeeper.prototype.on = function () {
    this._event.on.apply(this._event, arguments);
  };

  TimeKeeper.prototype.off = function () {
    this._event.off.apply(this._event, arguments);
  };

  /**
   * TimeKeeper Private Members
   */
  
  /**
   * Taking a backup of original Date constructor
   */
  TimeKeeper.prototype._Date = window.Date;

  TimeKeeper.prototype._startSync = function (syncInterval) {
    var self = this;
    typeof(syncInterval) === 'number' && (this._options.syncInterval = syncInterval);
    this.stopSync();
    this.sync();
    return this._syncIntervalIndex = window.setInterval(function () {
      self.sync();
    }, this._options.syncInterval);
  };

  TimeKeeper.prototype._stopSync = function () {
    window.clearInterval(this._syncIntervalIndex);
    delete this._syncIntervalIndex;
  };

  TimeKeeper.prototype._sync = function (callback) {
    callback || (callback = function() {});
    var self = this,
      correctDate = self.Date();
    this._emitPreSyncEvent();
    this._getServerDateMillis(function (err, serverTimeInMillis) {
      if (err) {
        console.error('Failed to fetch server time. Error:', err);
        callback(err);
        self._emitSyncEvent(err);
      } else {
        self._findDifferenceInMillis(serverTimeInMillis);
        correctDate = self.Date();
        callback(null, correctDate);
        self._emitSyncedEvent(null, correctDate);
      }
    });
  };

  TimeKeeper.prototype._emitPreFirstSyncEvent = function () {
    if (this._isSyncedOnce === false) {
      this._event.emit(EVENTS.FIRST_SYNC);
    }
  };

  TimeKeeper.prototype._emitPreSyncEvent = function () {
    this._emitPreFirstSyncEvent();
    this._event.emit(EVENTS.SYNC);
  };

  TimeKeeper.prototype._emitFirstSyncedEvent = function (err, data) {
    if (this._isSyncedOnce === false) {
      this._isSyncedOnce = true;
      this._event.emit(err ? EVENTS.FIRST_SYNC_ERROR : EVENTS.FIRST_SYNCED, err || data);
    }
  };

  TimeKeeper.prototype._emitSyncedEvent = function (err, data) {
    this._emitFirstSyncedEvent(err, data);
    this._event.emit(err ? EVENTS.SYNC_ERROR : EVENTS.SYNCED, err || data);
  };

  TimeKeeper.prototype._getCorrectDate = function () {
    return new this._Date(this._getCorrectDateMillis());
  };

  TimeKeeper.prototype._getCorrectDateMillis = function () {
    return this._getMachineDateMillis() + this._differenceInMillis;
  };

  TimeKeeper.prototype._getMachineDateMillis = function () {
    return new this._Date().getTime();
  };

  TimeKeeper.prototype._getServerDateMillis = function (callback) {
    var self = this,
      startTime = new this._Date().getTime();
    AJAX.call({
      type: this._options.ajaxType,
      url: this._options.ajaxMilliUrl,
      success: function (data) {
        var timeForResponse = new self._Date().getTime() - startTime,
          serverTime = self._options.responseParser(data) - (timeForResponse / 2); // Adjusting the server time, since request takes some time
        callback(null, serverTime);
      },
      error: function (err) {
        callback(err);
      },
    });
  };

  TimeKeeper.prototype._findDifferenceInMillis = function (serverDateInMillis) {
    this._differenceInMillis = serverDateInMillis - this._getMachineDateMillis();
  };

  function createInstance (options) {
    return new TimeKeeper(options);
  }

  return createInstance;

});