import Router, { RouterContext } from "@koa/router";
import http from "http";
import Koa from "koa";
import bodyParser from "koa-bodyparser";

import {
    CustomErrorMessageFunction,
    param,
    query,
    validationResults,
    body,
} from "..";

interface AuthData {
    /**
     * User ID
     */
    userId: string;
    /**
     * User role
     */
    role: "user" | "admin";
    /**
     * Username
     */
    username: string;
}

interface AuthState {
    auth?: AuthData;
}

/**
 * Class returning errors as JSON response.
 */
class RequestError extends Error {
    public readonly name = "RequestError";

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
    const port = parseInt(process.env.PORT || "", 10);
    if (isNaN(port)) {
        return 3000;
    }
    return port;
}

const app = new Koa();
const router = new Router();

const customErrorMessage: CustomErrorMessageFunction = (
    _ctx: RouterContext,
    value: string
) => {
    return (
        `The name has to be between 3 and 20 ` +
        `characters long but received length ${value.length}`
    );
};

const arrayExample = [
    param("count").isInt({ min: 1, max: 100 }).toInt().build(),
    query("name")
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage(customErrorMessage)
        .build(),
];

router.get(
    "/api/hello",
    query("name")
        .isLength({ min: 3, max: 20 })
        .withMessage("The name has to be between 3 and 20 characters")
        .build(),
    async (ctx: RouterContext) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name}`;
    }
);

router.get(
    "/api/hello/optional",
    query("name").isLength({ min: 3, max: 20 }).optional().build(),
    async (ctx: RouterContext) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        const { name } = ctx.query;
        ctx.body = `Hello ${name || "stranger"}`;
    }
);

router.get("/api/hello/:count", ...arrayExample, async (ctx: RouterContext) => {
    const results = validationResults(ctx);
    if (results.hasErrors()) {
        throw new RequestError(422, results.mapped());
    }
    const { count, name } = results.passedData();
    let response = "";
    for (let i = 0; i < count; i++) {
        response += `Hello ${name}\n`;
    }
    ctx.body = response;
});

router.post(
    "/api/person",
    body("name").isLength({ min: 3, max: 55 }).build(),
    body("address.street").isLength({ min: 2, max: 55 }).build(),
    body("address.zip").isPostalCode().build(),
    body("address.city").isLength({ min: 3, max: 55 }).build(),
    async (ctx: RouterContext) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        console.log(results.passedData());
        const { name, address } = results.passedData();
        ctx.body = {
            message: `${name} lives at ${address.street} ${address.zip} ${address.city}`,
        };
    }
);

router.get(
    "/api/auth",
    query("username").optional().isLength({ min: 3, max: 55 }).build(),
    async (ctx: RouterContext<AuthState>) => {
        const results = validationResults(ctx);
        if (results.hasErrors()) {
            throw new RequestError(422, results.mapped());
        }
        if (ctx.state.auth) {
            ctx.body = ctx.state.auth;
        } else {
            throw new RequestError(401, { message: "Unauthorized" });
        }
    }
);

app.use(bodyParser())
    .use(async (ctx: RouterContext, next) => {
        try {
            await next();
        } catch (e) {
            if (e.name === "RequestError") {
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

server.on("error", (error) => {
    console.error(error);
});

server.on("listening", () => {
    // tslint:disable-next-line: no-console
    console.log(`Demo app listening on port ${httpPort}`);
});

server.listen(httpPort);
