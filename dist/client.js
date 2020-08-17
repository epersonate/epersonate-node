"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _request = _interopRequireDefault(require("request"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _merge = _interopRequireDefault(require("lodash/merge"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var EPERSONATE_HEADER = 'x-epersonate';

var Client = /*#__PURE__*/function () {
  function Client(_ref) {
    var token = _ref.token;

    _classCallCheck(this, Client);

    this.personalAccessToken = token;
    this.promises = false;
    this.requestOpts = {
      baseUrl: 'http://localhost:9031'
    };
    return this;
  }

  _createClass(Client, [{
    key: "usePromises",
    value: function usePromises() {
      this.promises = true;
      return this;
    }
  }, {
    key: "promiseProxy",
    value: function promiseProxy(done, args, f) {
      var _this = this;

      if (this.promises || !done) {
        var callbackHandler = this.callback;
        return new _bluebird["default"](function (resolve, reject) {
          var resolver = function resolver(err, data) {
            if (err) return reject(err);
            resolve(data);
          };

          return f(args, function (err, r) {
            return callbackHandler(resolver, err, r);
          });
        });
      } else {
        return f(args, function (err, r) {
          return _this.callback(done, err, r);
        });
      }
    }
  }, {
    key: "promiseProxyRequest",
    value: function promiseProxyRequest(done, args) {
      return this.promiseProxy(done, args, this.request.bind(this));
    }
  }, {
    key: "post",
    value: function post(endpoint, body, done) {
      return this.promiseProxyRequest(done, {
        method: 'post',
        uri: endpoint,
        body: body
      });
    }
  }, {
    key: "request",
    value: function request(args, done) {
      var defaultArgs = {
        json: true,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'epersonate-node/1.0.2',
          Authorization: "Bearer ".concat(this.personalAccessToken)
        }
      };
      var requestArgs = (0, _merge["default"])({}, this.requestOpts, defaultArgs, args);
      return (0, _request["default"])(requestArgs, done);
    }
  }, {
    key: "callback",
    value: function callback(done, err, res) {
      if (!done) return;
      return done(err, res);
    }
  }, {
    key: "verifyImpersonation",
    value: function verifyImpersonation(_ref2, done) {
      var request = _ref2.request,
          token = _ref2.token;

      if (request && !token) {
        try {
          token = request.headers[EPERSONATE_HEADER] || request.header(EPERSONATE_HEADER);
        } catch (e) {
          console.error(e);
        }
      }

      if (!token) return done(null, {
        valid: false
      });
      return this.post('/api/v1/impersonations/', {
        token: token
      }, function (err, res) {
        if (err) return done(err, {
          valid: false
        });
        return done(null, res.body);
      });
    }
  }, {
    key: "verify",
    value: function verify(_ref3, done) {
      var request = _ref3.request,
          token = _ref3.token;
      return this.promiseProxy(done, {
        request: request,
        token: token
      }, this.verifyImpersonation.bind(this));
    }
  }]);

  return Client;
}();

exports["default"] = Client;
