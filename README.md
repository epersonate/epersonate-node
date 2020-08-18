# epersonate-node
> [Official Node Wrapper](https://www.npmjs.com/package/@epersonate/epersonate) for ePersonate API.

## ePersonate Documentation

[Official ePersonate Documentation](http://docs.epersonate.com)

## Installation

```bash
npm install -s @epersonate/epersonate
```


## Usage

Require ePersonate:

```js
const Epersonate = require('@epersonate/epersonate'); 
// Or with ES6 syntax
import * as Epersonate from '@epersonate/epersonate';

const epersonate = new Epersonate.Client({
    token: Env.get('EPERSONATE_TOKEN')
});
```


### Using Personal Access Token

Go to https://epersonate.com/app/settings > Personal Access Token > Create Personal Access Token

**Note: Replace `EPERSONATE_TOKEN` with the newly generated token.**


## Example Usage

```javascript
function login(req, res, next) {
    // Your logic.
    (...)
    const impersonation = await epersonate.verify({
        token: req.header('x-epersonate')
    });
    if (!impersonation.valid)
        return next();

    const user = await User.find(impersonation.userId);

    return next();
}
```

Alternatively, you can pass the request object to epersonate verify method, it will take care of extracting the `x-epersonate` header or cookie:

```javascript
    const impersonation = await epersonate.verify({
        request: req
    });
```

## Storing impersonation events

```javascript
    const impersonation = await epersonate.verify({
        request: req,
        name: req.url,
        metadata: {
            id: req.id,
            method: req.method,
            'foo': 'bar',
            (...)
        }
    });
```

## Running the code locally

```bash
gulp babel
```

Before creating a PR:

```
gulp lint
```


Require ePersonate:

```node
const ePersonate = require('./dist/index');
```

## Deploy

Update version in package.json && gulpfile.js

```bash
npm publish
```