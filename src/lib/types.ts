import { RouterContext, Middleware } from "@koa/router";
import ValidationChain from "./ValidationChain";

export interface Validator extends ValidationChain<Validator>, Middleware {
}

/**
 * Interface describing validation errors.
 */
export interface IValidationError {
    param: string;
    location: string;
    msg: string;
    value: string;
}

/**
 * Options containing allowNull flag.
 */
export interface IOptionalOptions {
    allowNull?: boolean;
}

/**
 * Custom validation function with context object.
 */
export type CustomValidatorFunctionWithContext = (
    input: unknown,
    ctx: RouterContext
) => Promise<void>;

/**
 * Definition of custom validation function. Custom
 * validation function should throw an error
 * when ever validation fails.
 */
export type CustomValidatorFunction = (input: unknown) => Promise<void>;

/**
 * Custom validation error message function. This function will receive the request
 * context and the user's input for the parameter, and it has to return the error
 * message as a result.f
 */
export type CustomErrorMessageFunction = (ctx: RouterContext, input: string) => string;

/**
 * Location of the parameter to be validated.
 */
export enum ParamLocation {
    BODY = "body",
    PARAM = "param",
    QUERY = "query",
}

/**
 * Validation results as mapped object.
 */
export interface IMappedValidationResults {
    [key: string]: IValidationError;
}
