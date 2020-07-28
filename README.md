# epersonate-node
> Official Node Wrapper for EPersonate API.

## EPersonate Documentation

[Official EPersonate Documentation](https://docs.epersonate.com)

## Installation

```bash
npm install -s epersonate
```


## Usage

Require EPersonate:

```node
const Epersonate = require('epersonate');
// OR
import EPersonate from 'epersonate';
```


### Using Personal Access Token

Go to https://epersonate.com/app/settings > Personal Access Token > Create Personal Access Token

Add this token to your environment variables.
 
```node
const epersonate = new EPersonate.Client({ token: 'EPERSONATE_TOKEN'});
```

**Note: Replace `EPERSONATE_TOKEN` with the token generated before.**


## Example Usage

```javascript
function login(req, res) {
    // Your logic.
    (...)
    const impersonation = await epersonate.verify({
        token: req.header('x-epersonate')
    });
    if (!impersonation.body.valid)
        return;

    const user = await User.find(impersonation.body.userId);
}
```

Alternatively, you can pass the request object to epersonate verify method:

```javascript
    const res = await epersonate.verify({
        request: req
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


Require EPersonate:

```node
const EPersonate = require('./dist/index');
```

## Deploy

```bash
npm version
npm build
```