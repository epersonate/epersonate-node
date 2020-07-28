import request from 'request';
import Bluebird from 'bluebird';
import Impersonation from './impersonation';

import merge from 'lodash/merge';

export default class Client {
  constructor({token}) {
    this.personalAccessToken = token;
    this.impersonations = new Impersonation(this);
    this.promises = false;
    this.requestOpts = {
      baseUrl: 'ENV_BASE_URL'
    };
    return this;
  }

  usePromises() {
    this.promises = true;
    return this;
  }

  promiseProxy(done, args) {
    if (this.promises || !done) {
      const callbackHandler = this.callback;
      return new Bluebird((resolve, reject) => {
        const resolver = (err, data) => {
          if (err)
            return reject(err);

          resolve(data);
        };
        return this.request(args, (err, r) => {
          return callbackHandler(resolver, err, r);
        });
      });
    } else {
      return this.request(args, (err, r) => this.callback(done, err, r));
    }
  }

  post(endpoint, body, done) {
    return this.promiseProxy(done,
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
        'User-Agent': 'epersonate-node/0.0.1',
        Authorization: `Bearer ${this.personalAccessToken}`
      }
    };
    const requestArgs = merge({}, this.requestOpts, defaultArgs, args);
    return request(requestArgs, done);
  }

  callback(done, err, res) {
    if (!done)
      return;

    return done(err, res);
  }

  /* alias */
  verify(...args) {
    return this.impersonations.verify(...args);
  }
}
