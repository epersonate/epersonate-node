import http from 'request';
import Bluebird from 'bluebird';
import merge from 'lodash/merge';

const EPERSONATE_HEADER = 'x-epersonate';

export default class Client {
  constructor({token}) {
    this.personalAccessToken = token;
    this.promises = false;
    this.requestOpts = {
      baseUrl: '$ENV_BASE_URL$'
    };
    return this;
  }

  usePromises() {
    this.promises = true;
    return this;
  }

  promiseProxy(done, args, f) {
    if (this.promises || !done) {
      const callbackHandler = this.callback;
      return new Bluebird((resolve, reject) => {
        const resolver = (err, data) => {
          if (err)
            return reject(err);

          resolve(data);
        };
        return f(args, (err, r) => {
          return callbackHandler(resolver, err, r);
        });
      });
    } else {
      return f(args, (err, r) => this.callback(done, err, r));
    }
  }

  promiseProxyRequest(done, args) {
    return this.promiseProxy(done, args, this.request.bind(this));
  }

  post(endpoint, body, done) {
    return this.promiseProxyRequest(done,
      {
        method: 'post',
        uri: endpoint,
        body
      }
    );
  }

  request(args, done) {
    const defaultArgs = {
      json: true,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'epersonate-node/$ENV_BASE_VERSION$',
        Authorization: `Bearer ${this.personalAccessToken}`
      }
    };
    const requestArgs = merge({}, this.requestOpts, defaultArgs, args);
    return http(requestArgs, done);
  }

  callback(done, err, res) {
    if (!done)
      return;

    return done(err, res);
  }

  verify({request, token}, done) {
    const verify = ({vRequest, vToken}, vDone) => {
      if (vRequest && !vToken) {
        try {
          vToken = vRequest.headers[EPERSONATE_HEADER] || vRequest.header(EPERSONATE_HEADER);
        } catch (e) {
          console.error(e);
        }
      }

      if (!vToken)
        return done(null, {valid: false});

      return this.post('/api/v1/impersonations/', {
        vToken
      }, (err, res) => {
        if (err)
          return vDone(err, {
            valid: false
          });

        return vDone(null, res.body);
      });
    };

    return this.promiseProxy(done, {request, token}, verify.bind(this));
  }
}
