/// <reference types="validator" />
import { ParamLocation, IMinMaxOptions, IAllowNullOptions, CustomValidatorFunction } from './types';
import { ParameterizedContext } from 'koa';
import { IValidationContext } from '..';
/**
 * The validation chain object.
 */
export default class ValidationChain {
    /**
     * Parameter to be validated.
     */
    private parameter;
    /**
     * Validations to be excecuted.
     */
    private validations;
    /**
     * Location of the given parameter.
     */
    private location;
    /**
     * Is this parameter optional?
     */
    private isOptional;
    constructor(parameter: string, location: ParamLocation);
    run: () => (ctx: ParameterizedContext<IValidationContext, {}>, next: () => Promise<void>) => Promise<void>;
    /**
     * Pass a custom message to the validation.
     * @param message Custom message
     */
    withMessage(message: string): this;
    /**
     * Set this property as optional.
     */
    optional(options?: IAllowNullOptions): this;
    /**
     * Custom async validation function to execute. The function
     * must throw when the validation fails.
     *
     * @param func The validation function
     */
    custom(func: CustomValidatorFunction): this;
    /**
     * Check if the request property contains the given seed.
     */
    contains(seed: string): this;
    /**
     * Check if the request property equals the given comparison.
     */
    equals(comparison: string): this;
    /**
     * Check if the parameter is an integer.
     */
    isInt(options?: IMinMaxOptions): this;
    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    isLength(options: IMinMaxOptions): this;
    /**
     * Check if the parameter is an email.
     */
    isEmail(): this;
    /**
     * Check if the parameter is a boolean value.
     */
    isBoolean(): this;
    /**
     * Check if the parameter is a zero length string.
     */
    isEmpty(): this;
    /**
     * Check if the parameter is a float.
     */
    isFloat(): this;
    /**
     * Check if the parameter is an algorithm.
     *
     * @param algorithm The algorithm
     */
    isHash(algorithm: ValidatorJS.HashAlgorithm): this;
    /**
     * Check if the parameter is a valid JWT token.
     */
    isJWT(): this;
    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    isJSON(): this;
    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    isLatLong(): this;
    /**
     * Check if the paramter contains only lowercase characters.
     */
    isLowercase(): this;
    /**
     * Check if the parameter is a MAC address.
     */
    isMACAddress(): this;
    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    isMongoId(): this;
    /**
     * Check if the parameter contains only numbers.
     */
    isNumeric(): this;
    /**
     * Check if the parameter is a valid port number.
     */
    isPort(): this;
    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    isUUID(): this;
    /**
     * Check if the parameter contains only uppercase characters.
     */
    isUppercase(): this;
    /**
     * Check if the parameter matches given regular expression.
     * @param regExp The regular expression
     */
    matches(regExp: RegExp): this;
    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    private checkResults;
}
