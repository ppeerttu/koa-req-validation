import http from 'http';
import Koa, { ParameterizedContext } from 'koa';
import Router, { IRouterContext } from 'koa-router';
import bodyParser from 'koa-bodyparser';

import { query, validationResults, param, IValidationContext } from '../src';

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
    const port = parseInt(process.env.PORT || '');
    if (isNaN(port)) {
        return 3000;
    }
    return port;
}

const app = new Koa();
const router = new Router();

const arrayExample = [
    param('count')
        .isInt({ min: 1, max: 100 })
        .run(),
    query('name')
        .isLength({ min: 3, max: 20 })
        .run()
];

router.get(
    '/api/hello',
    query('name')
        .isLength({ min: 3, max: 20 })
        .withMessage('The name has to be between 3 and 20 characters')
        .run(),
    async (ctx: ParameterizedContext<IValidationContext>) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name}`;
    }
);

router.get(
    '/api/hello/optional',
    query('name')
        .isLength({ min: 3, max: 20 })
        .optional()
        .run(),
    async (ctx: ParameterizedContext<IValidationContext>) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name || 'stranger'}`;
    }
);

router.get(
    '/api/hello/:count',
    ...arrayExample,
    async (ctx: ParameterizedContext<IValidationContext>) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { count } = ctx.params;
        const { name } = ctx.query;
        let response = '';
        for (let i = 0; i < count; i++) {
            response += `Hello ${name}\n`;
        }
        ctx.body = response;
    }
);

app
    .use(bodyParser())
    .use(async (ctx: ParameterizedContext<IRouterContext>, next) => {
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
    console.log(`Demo app listening on port ${httpPort}`);
});

server.listen(httpPort);