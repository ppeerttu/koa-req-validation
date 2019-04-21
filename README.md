# koa-req-validation

[![Build Status](https://travis-ci.org/ppeerttu/koa-req-validation.svg?branch=master)](https://travis-ci.org/ppeerttu/koa-req-validation)
[![dependencies Status](https://david-dm.org/ppeerttu/koa-req-validation/status.svg)](https://david-dm.org/ppeerttu/koa-req-validation)
[![devDependencies Status](https://david-dm.org/ppeerttu/koa-req-validation/dev-status.svg)](https://david-dm.org/ppeerttu/koa-req-validation?type=dev)
[![peerDependencies Status](https://david-dm.org/ppeerttu/koa-req-validation/peer-status.svg)](https://david-dm.org/ppeerttu/koa-req-validation?type=peer)
[![codecov](https://codecov.io/gh/ppeerttu/koa-req-validation/branch/master/graph/badge.svg?token=IuGu3GKizF)](https://codecov.io/gh/ppeerttu/koa-req-validation)

A [validator][validator-site] middleware for [koa][koa-site]. Inspired by [express-validator][express-validator-site].

- [koa-req-validation](#koa-req-validation)
- [Installation](#installation)
- [Getting started](#getting-started)
- [Documentation](#documentation)
- [Motivation](#motivation)
  - [Peer dependencies](#peer-dependencies)
- [Issues](#issues)
- [Contribution](#contribution)
- [Licence](#licence)


# Installation

The **koa-req-validation** requires [validator][validator-site], [koa-router][koa-router-site] and [koa-bodyparser][koa-bodyparser-site] as peer dependencies.


Install peer dependencies
```
npm install validator koa-bodyparser koa-router
```

Install **koa-req-validation**
```
npm install koa-req-validation
```


# Getting started

A basic usage example

```typescript
import Router, { IRouterContext } from 'koa-router';
import { query, validationResults, IValidationContext } from 'koa-req-validation';

// ...

const router = new Router();

router.get(
    '/api/hello',
    query('name')
        .isLength({ min: 3, max: 20 })
        .withMessage('The name has to be between 3 and 20 characters')
        .run(), // <-- This is required at the end of each validation
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

See the [demo][demo-link] for other examples.

# Documentation

See the [generated TypeDoc][typedocs] for now. Improved documentation is coming up in the future.

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

[MIT Licence][licence-link]


[demo-link]:https://github.com/ppeerttu/koa-req-validation/blob/master/demo/index.ts
[licence-link]:https://github.com/ppeerttu/koa-req-validation/blob/master/LICENCE
[typedocs]:https://ppeerttu.github.io/koa-req-validation/

[issue-site]:https://github.com/ppeerttu/koa-req-validation/issues
[issue-all-filter-site]:https://github.com/ppeerttu/koa-req-validation/issues?utf8=%E2%9C%93&q=is%3Aissue

[koa-site]:https://koajs.com/
[koa-router-site]:https://github.com/ZijianHe/koa-router
[koa-bodyparser-site]:https://github.com/koajs/bodyparser
[validator-site]:https://github.com/chriso/validator.js
[express-validator-site]:https://github.com/express-validator/express-validator
