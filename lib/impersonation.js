export default class Impersonation {
  constructor(client) {
    this.client = client;
  }

  verify({request, token}, done) {
    if (request && !token)
      token = request.header('x-epersonate');

    if (!token)
      return done(null, {
        valid: false
      });

    return this.client.post('/api/v1/impersonations/', {
      token
    }, done);
  }
}

