/**
 * Plugin: TimeKeeper
 * Author: Sundarasan Natarajan
 * GIT: https://github.com/Sujsun/timekeeper.git
 * Version: 0.0.1
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
   * ----------
   * TimeKeeper
   * ----------
   */
  var OPTIONS_DEFAULTS = {
    ajaxType: 'get',
    ajaxMilliUrl: '/utcMillis',
    responseParser: function (response) {
      return parseInt(response);
    },
  };

  /**
   * TimeKeeper Constructor
   */
  function TimeKeeper (options) {
    this._options = ObjectUtils.clone(options || {});
    this._options = ObjectUtils.defaults(this._options, OPTIONS_DEFAULTS);
    this._differenceInMillis = 0;
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
  };

  TimeKeeper.prototype.resetDate = function () {
    return (window.Date = this._Date);
  };

  TimeKeeper.prototype.setDifferenceInMillis = function (differenceInMillis) {
    return (this._differenceInMillis = differenceInMillis);
  };

  TimeKeeper.prototype.getDifferenceInMillis = function () {
    return this._differenceInMillis;
  };

  /**
   * TimeKeeper Private Members
   */
  
  /**
   * Taking a backup of original Date constructor
   */
  TimeKeeper.prototype._Date = window.Date;

  TimeKeeper.prototype._sync = function (callback) {
    callback || (callback = function() {});
    var self = this;
    this._getServerDateMillis(function (err, serverTimeInMillis) {
      if (err) {
        console.error('Failed to fetch server time. Error:', err);
        callback(err);
      } else {
        self._findDifferenceInMillis(serverTimeInMillis);
        callback(null, self.Date());
      }
    });
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
    var self = this;
    AJAX.call({
      type: this._options.ajaxType,
      url: this._options.ajaxMilliUrl,
      success: function (data) {
        callback(null, self._options.responseParser(data));
      },
      error: function (err) {
        callback(err);
      },
    });
  };

  TimeKeeper.prototype._findDifferenceInMillis = function (serverDateInMillis) {
    this._differenceInMillis = this._getMachineDateMillis() - serverDateInMillis;
  };

  function createInstance (options) {
    return new TimeKeeper(options);
  }

  return createInstance;

});