# koa-request-validation

[![Build Status](https://travis-ci.org/ppeerttu/koa-request-validation.svg?branch=master)](https://travis-ci.org/ppeerttu/koa-request-validation)
![dependencies](https://david-dm.org/ppeerttu/koa-request-validation.svg)
[![codecov](https://codecov.io/gh/ppeerttu/koa-request-validation/branch/master/graph/badge.svg?token=IuGu3GKizF)](https://codecov.io/gh/ppeerttu/koa-request-validation)

A [validator][validator-site] middleware for [koa][koa-site]. Inspired by [express-validator][express-validator-site].

- [koa-request-validation](#koa-request-validation)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Motivation](#motivation)
  - [Peer dependencies](#peer-dependencies)
- [Issues](#issues)
- [Contribution](#contribution)
- [Licence](#licence)


# Installation

**NOTE: This project has not been released in npm yet.**

The **koa-request-validation** requires [validator][validator-site], [koa-router][koa-router-site] and [koa-bodyparser][koa-bodyparser-site] as peer dependencies.


Install peer dependencies
```
npm install validator koa-bodyparser koa-router
```

Install **koa-request-validation**
```
npm install koa-request-validation
```


# Getting started

A basic usage example

```typescript
import Router, { IRouterContext } from 'koa-router';
import { query, validationResults, IValidationContext } from 'koa-request-validation';

/// ....

const router = new Router();

router.get(
    '/api/hello',
    query('name')
        .isLength({ min: 3, max: 20 })
        .withMessage('The name has to be between 3 and 20 characters')
        .run(),
    async (ctx: ParameterizedContext<IValidationContext>) => {
        const result = validationResults(ctx);
        if (result.hasErrors()) {
            throw new RequestError(422, result.mapped());
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name}`;
    }
);
```

See the [demo](./demo/index.ts) for other examples.

# Motivation

Motivation behind this module is the awesome experience of using the [express-validator][express-validator-site]. However, due to various reasons the `express-validator` doesn't suit it and it seems that there is quite a lot of request validation packages out there mainly for `koa` v1 without warranty for active maintenance. This package tries to mimic the `express-validator` pacakge and eventually provide most of the features.

## Peer dependencies

The usage of the few peer dependencies is a known dececision. As it appears to be slowly growing concern that developers hog thousands of npm pacakges without knowing them, we'd like to make sure the developer knows what's included in this package and actively consider whether to include this pacakge along with it's peer dependencies to the project.

Also, since this package is still in very raw state and lots of features are missing, it makes more sense to manually install the [validator.js][validator-site] -module along the project dependencies for the opportunity of using it as is in the application.

# Issues

We use [GitHub][issue-site] for issue tracking. Please look from [previously submitted issues][issue-all-filter-site] if someone else has already submitted the same issue.

# Contribution

All contributions to the project are welcome. Contact the author for now, guidelines for contributions will be defined later.

# Licence

[MIT Licence](LICENCE)



[issue-site]:https://github.com/ppeerttu/koa-request-validation/issues
[issue-all-filter-site]:https://github.com/ppeerttu/koa-request-validation/issues?utf8=%E2%9C%93&q=is%3Aissue

[koa-site]:https://koajs.com/
[koa-router-site]:https://github.com/ZijianHe/koa-router
[koa-bodyparser-site]:https://github.com/koajs/bodyparser
[validator-site]:https://github.com/chriso/validator.js
[express-validator-site]:https://github.com/express-validator/express-validator
