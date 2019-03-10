# koa-request-validation

A [koa](koa-site) middleware for [validator](validator-site). Inspired by [express-validator](express-validator-site).


# Installation

The `koa-request-validation` requires [validator](validator-site), [koa-router](koa-router-site) and [koa-bodyparser](koa-bodyparser-site) as peer dependencies.


Install peer dependencies
```
npm install validator koa-bodyparser koa-router
```

Install `koa-request-validation`
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
        const errors = validationResults(ctx);
        if (errors) {
            throw new RequestError(422, errors);
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name}`;
    }
);
```

# Motivation

Motivation behind this module is the awesome experience of using the [express-validator](express-validator-site). However, (mostly, but not only) due to `async` middleware in [koa](koa-site) the `express-validator` doesn't suit it and it seems that there is quite a lot of request validation packages out there mainly for `koa` v1 without any clear standard and warranty for active maintenance. This package tries to mimic the API of the `express-validator` and slowly provide all the same features.

## Peer dependencies

The usage of the few peer dependencies is a known dececision. As it appears to be slowly growing concern that developers hog thousands of npm pacakges without knowing them, we'd like to make sure the developer knows what's included in this package and actively consider whether to include this pacakge along with it's peer dependencies to the project he/she is building.

Also, since this package is still in very raw state and lots of features are missing, it makes more sense to manually install the [validator.js](validator-site) -module along the project dependencies for the opportunity of using it as is in the application.


[koa-site]:https://koajs.com/
[koa-router-site]:https://github.com/ZijianHe/koa-router
[koa-bodyparser-site]:https://github.com/koajs/bodyparser
[validator-site]:https://github.com/chriso/validator.js
[express-validator-site]:https://github.com/express-validator/express-validator
