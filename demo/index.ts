import Router, { RouterContext } from '@koa/router';
import http from 'http';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import {
    CustomErrorMessageFunction,
    IValidationState,
    param,
    query,
    validationResults,
} from '../src';

/**
 * Class returning errors as JSON response.
 */
class RequestError extends Error {

    public readonly name = 'RequestError';

    public readonly status: number;

    public readonly response: any;

    constructor(status: number, errors: any) {
        super();
        this.status = status;
        this.response = errors;
    }
}

/**
 * Get server port from PORT env variable or
 * default to 3000.
 */
function getPort(): number {
    const port = parseInt(process.env.PORT || '', 10);
    if (isNaN(port)) {
        return 3000;
    }
    return port;
}

const app = new Koa();
const router = new Router();

const customErrorMessage: CustomErrorMessageFunction = (
    ctx: RouterContext,
    value: string,
) => {
    return `The name has to be between 3 and 20 `
        + `characters long but received length ${value.length}`;
};

const arrayExample = [
    param('count')
        .isInt({ min: 1, max: 100 })
        .toInt()
        .run(),
    query('name')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage(customErrorMessage)
        .run(),
];

router.get(
    '/api/hello',
    query('name')
        .isLength({ min: 3, max: 20 })
        .withMessage('The name has to be between 3 and 20 characters')
        .run(),
    async (ctx: RouterContext<IValidationState>) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name}`;
    },
);

router.get(
    '/api/hello/optional',
    query('name')
        .isLength({ min: 3, max: 20 })
        .optional()
        .run(),
    async (ctx: RouterContext<IValidationState>) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name || 'stranger'}`;
    },
);

router.get(
    '/api/hello/:count',
    ...arrayExample,
    async (ctx: RouterContext<IValidationState>) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { count, name } = results.passedData();
        let response = '';
        for (let i = 0; i < count; i++) {
            response += `Hello ${name}\n`;
        }
        ctx.body = response;
    },
);

app
    .use(bodyParser())
    .use(async (ctx: RouterContext<IValidationState>, next) => {
        try {
            await next();
        } catch (e) {
            if (e.name === 'RequestError') {
                ctx.status = e.status;
                ctx.body = e.response;
            } else {
                throw e;
            }
        }
    })
    .use(router.routes())
    .use(router.allowedMethods());

const httpPort = getPort();

const server = http.createServer(app.callback());

server.on('error', (error) => {
    console.error(error);
});

server.on('listening', () => {
    // tslint:disable-next-line: no-console
    console.log(`Demo app listening on port ${httpPort}`);
});

server.listen(httpPort);
