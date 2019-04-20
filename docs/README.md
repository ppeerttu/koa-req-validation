
koa-request-validation
======================

[![Build Status](https://travis-ci.org/ppeerttu/koa-request-validation.svg?branch=master)](https://travis-ci.org/ppeerttu/koa-request-validation) ![dependencies](https://david-dm.org/ppeerttu/koa-request-validation.svg) [![codecov](https://codecov.io/gh/ppeerttu/koa-request-validation/branch/master/graph/badge.svg?token=IuGu3GKizF)](https://codecov.io/gh/ppeerttu/koa-request-validation)

A [validator](https://github.com/chriso/validator.js) middleware for [koa](https://koajs.com/). Inspired by [express-validator](https://github.com/express-validator/express-validator).

*   [koa-request-validation](#koa-request-validation)
*   [Installation](#installation)
*   [Getting started](#getting-started)
*   [Motivation](#motivation)
    *   [Peer dependencies](#peer-dependencies)
*   [Issues](#issues)
*   [Contribution](#contribution)
*   [Licence](#licence)

Installation
============

The **koa-request-validation** requires [validator](https://github.com/chriso/validator.js), [koa-router](https://github.com/ZijianHe/koa-router) and [koa-bodyparser](https://github.com/koajs/bodyparser) as peer dependencies.

Install peer dependencies

```
npm install validator koa-bodyparser koa-router
```

Install **koa-request-validation**

```
npm install koa-request-validation
```

Getting started
===============

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

Motivation
==========

Motivation behind this module is the awesome experience of using the [express-validator](https://github.com/express-validator/express-validator). However, due to various reasons the `express-validator` doesn't suit it and it seems that there is quite a lot of request validation packages out there mainly for `koa` v1 without warranty for active maintenance. This package tries to mimic the `express-validator` pacakge and eventually provide most of the features.

Peer dependencies
-----------------

The usage of the few peer dependencies is a known dececision. As it appears to be slowly growing concern that developers hog thousands of npm pacakges without knowing them, we'd like to make sure the developer knows what's included in this package and actively consider whether to include this pacakge along with it's peer dependencies to the project.

Also, since this package is still in very raw state and lots of features are missing, it makes more sense to manually install the [validator.js](https://github.com/chriso/validator.js) -module along the project dependencies for the opportunity of using it as is in the application.

Issues
======

We use [GitHub](https://github.com/ppeerttu/koa-request-validation/issues) for issue tracking. Please look from [previously submitted issues](https://github.com/ppeerttu/koa-request-validation/issues?utf8=%E2%9C%93&q=is%3Aissue) if someone else has already submitted the same issue.

Contribution
============

All contributions to the project are welcome. Contact the author for now, guidelines for contributions will be defined later.

Licence
=======

[MIT Licence](LICENCE)

## Index

### External modules

* ["index"](modules/_index_.md)
* ["lib/ValidationChain"](modules/_lib_validationchain_.md)
* ["lib/ValidationResult"](modules/_lib_validationresult_.md)
* ["lib/types"](modules/_lib_types_.md)

---

