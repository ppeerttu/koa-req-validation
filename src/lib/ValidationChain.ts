import validator from 'validator';
import {
    IValidationDefinition,
    ParamLocation,
    IMinMaxOptions,
    IOptionalOptions,
    CustomValidatorFunction,
    IsInValuesOptions,
    IsAlphaLocale,
    IIsCurrencyOptions
} from './types';
import { ParameterizedContext } from 'koa';
import { IValidationContext, IValidationError } from '..';
import ValidationResult from './ValidationResult';

/**
 * The validation chain object.
 */
export default class ValidationChain {
    
    /**
     * Default error message when validation fails.
     */
    public readonly defaultErrorMessage = 'Invalid value';

    /**
     * Parameter to be validated.
     */
    private parameter: string;

    /**
     * Validations to be excecuted.
     */
    private validations: IValidationDefinition[];

    /**
     * Location of the given parameter.
     */
    private location: ParamLocation;

    /**
     * Is this parameter optional?
     */
    private isOptional: {
        value: boolean,
        options?: IOptionalOptions
    };

    /**
     * Create a new ValidationChain.
     * @param parameter Name of the parameter to validate
     * @param location Location of the parameter in request
     */
    constructor(
        parameter: string,
        location: ParamLocation,
    ) {
        this.parameter = parameter;
        if (!Object.values(ParamLocation).includes(location)) {
            throw new TypeError(
                `Param location has to be one of `
                + Object.values(ParamLocation).join(', ')
                + ` but received ${location}`
            );
        }
        this.location = location;
        this.validations = [];
        this.isOptional = { value: false };
    }

    /**
     * Run the validation. This method has to be called
     * at the end of each validation.
     * ```typescript
     * router.post(
     *     '/auth/login',
     *     body('username').equals('user').run(),
     *     body('password').equals('pass').run(),
     *     handler
     * );
     * ```
     */
    run = () => async (
        ctx: ParameterizedContext<IValidationContext>,
        next: () => Promise<void>
    ) => {
        const results = await this.checkResults(ctx);
        if (results) {
            if (Array.isArray(ctx.state.validationResults)) {
                ctx.state.validationResults.push(results);
            } else {
                ctx.state.validationResults = [results];
            }
        }
        await next();
    }

    /**
     * Pass a custom message to the validation.
     * @param message Custom message
     */
    withMessage(message: string) {
        const validationDefinition = this.validations[this.validations.length - 1];
        validationDefinition.message = message;
        return this;
    }

    /**
     * Set this property as optional.
     */
    optional(options?: IOptionalOptions) {
        this.isOptional = {
            value: true,
            options
        };
        return this;
    }

    /**
     * Custom async validation function to execute. The function
     * must throw when the validation fails.
     * 
     * @param func The validation function
     */
    custom(func: CustomValidatorFunction) {
        this.validations.push({
            validation: 'custom',
            func
        });
        return this;
    }

    /**
     * Check if the request property contains the given seed.
     */
    contains(seed: string) {
        this.validations.push({
            validation: 'contains',
            options: seed
        });
        return this;
    }

    /**
     * Check if the request property equals the given comparison.
     */
    equals(comparison: string) {
        this.validations.push({
            validation: 'equals',
            options: comparison
        });
        return this;
    }

    /**
     * Check if the parameter is an integer.
     */
    isInt(options?: IMinMaxOptions) {
        this.validations.push({
            validation: 'isInt',
            options
        });
        return this;
    }

    /**
     * Check if the string is in given length.
     * 
     * @param options Min and max length
     */
    isLength(options: IMinMaxOptions) {
        this.validations.push({
            validation: 'isLength',
            options
        });
        return this;
    }

    /**
     * Check if the parameter is an email.
     */
    isEmail() {
        this.validations.push({
            validation: 'isEmail'
        });
        return this;
    }

    /**
     * Check if the parameter is a boolean value.
     */
    isBoolean() {
        this.validations.push({
            validation: 'isBoolean'
        })
        return this;
    }

    /**
     * Check if the parameter is a zero length string.
     */
    isEmpty() {
        this.validations.push({
            validation: 'isEmpty',
        });
        return this;
    }

    /**
     * Check if the parameter is a float.
     */
    isFloat() {
        this.validations.push({
            validation: 'isFloat',
        });
        return this;
    }

    /**
     * Check if the parameter is an algorithm.
     * 
     * @param algorithm The algorithm
     */
    isHash(algorithm: ValidatorJS.HashAlgorithm) {
        this.validations.push({
            validation: 'isHash',
            options: algorithm
        });
        return this;
    }
    
    /**
     * Check if the parameter is a valid JWT token.
     */
    isJWT() {
        this.validations.push({
            validation: 'isJWT',
        });
        return this;
    }

    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    isJSON() {
        this.validations.push({
            validation: 'isJSON'
        });
        return this;
    }

    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    isLatLong() {
        this.validations.push({
            validation: 'isLatLong',
        });
        return this;
    }

    /**
     * Check if the paramter contains only lowercase characters.
     */
    isLowercase() {
        this.validations.push({
            validation: 'isLowercase',
        });
        return this;
    }

    /**
     * Check if the parameter is a MAC address.
     */
    isMACAddress() {
        this.validations.push({
            validation: 'isMACAddress',
        });
        return this;
    }

    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    isMongoId() {
        this.validations.push({
            validation: 'isMongoId',
        });
        return this;
    }

    /**
     * Check if the parameter contains only numbers.
     */
    isNumeric() {
        this.validations.push({
            validation: 'isNumeric',
        });
        return this;
    }

    /**
     * Check if the parameter is a valid port number.
     */
    isPort() {
        this.validations.push({
            validation: 'isPort',
        });
        return this;
    }

    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    isUUID() {
        this.validations.push({
            validation: 'isUUID',
        });
        return this;
    }

    /**
     * Check if the parameter contains only uppercase characters.
     */
    isUppercase() {
        this.validations.push({
            validation: 'isUppercase',
        });
        return this;
    }

    /**
     * Check if the parameter matches given regular expression.
     * @param regExp The regular expression
     */
    matches(regExp: RegExp) {
        this.validations.push({
            validation: 'matches',
            options: regExp
        });
        return this;
    }

    /**
     * Check if the parameter is some of the allowed
     * values.
     * @param values Options containing at least `values`
     * property with allowed values
     */
    isIn(values: IsInValuesOptions) {
        this.validations.push({
            validation: 'isIn',
            options: values
        });
        return this;
    }

    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     * @param date The date
     */
    isAfter(date = new Date().toString()) {
        this.validations.push({
            validation: 'isAfter',
            options: date
        });
        return this;
    }

    /**
     * Check if the string contains only letters. Locale
     * defaults to en-US.
     * @param locale The locale
     */
    isAlpha(locale?: IsAlphaLocale) {
        this.validations.push({
            validation: 'isAlpha',
            options: locale
        });
        return this;
    }

    /**
     * Check if the string contains only letters and numbers.
     * Locale defaults to en-US.
     * @param locale The locale
     */
    isAlphanumeric(locale?: IsAlphaLocale) {
        this.validations.push({
            validation: 'isAlphanumeric',
            options: locale
        });
        return this;
    }

    /**
     * Check if the string contains ACII characters only.
     */
    isAscii() {
        this.validations.push({
            validation: 'isAscii',
        });
        return this;
    }

    /**
     * Check if the string is base64 encoded.
     */
    isBase64() {
        this.validations.push({
            validation: 'isBase64',
        });
        return this;
    }

    /**
     * Check if the string is a date that's before
     * the given date. Defaults to now.
     * @param date The date
     */
    isBefore(date = new Date().toString()) {
        this.validations.push({
            validation: 'isBefore',
            options: date,
        });
        return this;
    }

    /**
     * Check if the strin's length (in UTF-8 bytes)
     * falls in range.
     * @param options The range
     */
    isByteLength(options: IMinMaxOptions = { min: 0 }) {
        this.validations.push({
            validation: 'isByteLength',
            options,
        });
        return this;
    }
    
    /**
     * Check if the string is a credit card.
     */
    isCreditCard() {
        this.validations.push({
            validation: 'isCreditCard',
        });
        return this;
    }

    /**
     * Check if the string is a valid currency amount.
     * @param options The options
     */
    isCurrency(options?: IIsCurrencyOptions) {
        this.validations.push({
            validation: 'isCurrency',
            options
        });
        return this;
    }

    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    private async checkResults(
        ctx: ParameterizedContext<IValidationContext>
    ): Promise<ValidationResult | null> {
        let input: any;
        let originalInput: any;

        switch (this.location) {
            case ParamLocation.BODY:
                input = ctx.request.body[this.parameter];
                break;
            case ParamLocation.PARAM:
                input = ctx.params[this.parameter];
                break;
            case ParamLocation.QUERY:
                input = ctx.query[this.parameter];
                break;
        }

        originalInput = input;

        if (typeof input === 'undefined') {
            if (this.isOptional.value) {
                return null;
            }
            input = null;
        } else if (input === null) {
            if (this.isOptional.options && this.isOptional.options.allowNull) {
                return null;
            }
        } else {
            input = input.toString();
        }

        const errors = await this.validations.reduce(
            async (arrP: Promise<IValidationError[]>, current) => {
                const arr = await arrP;
                const { validation, options, message, func } = current;
                if (validation === 'custom') {
                    // Has to be thrown before the try-catch
                    // in order to notify the developer during development
                    if (!func) {
                        throw new Error(
                            `No custom validation function defined for `
                            + `param ${this.parameter} at ${this.location}`
                        );
                    }
                    try {
                        await func(input, ctx);
                    } catch (e) {
                        arr.push({
                            msg: message || e.message || this.defaultErrorMessage,
                            location: this.location,
                            param: this.parameter,
                            value: originalInput + ''
                        });
                    }

                    // @ts-ignore
                } else if (input === null || !validator[validation](input, options)) {
                    arr.push({
                        msg: message || this.defaultErrorMessage,
                        location: this.location,
                        param: this.parameter,
                        value: originalInput + ''
                    });
                }

                return arr;
            },
            Promise.resolve([])
        );
        return new ValidationResult(errors);
    }
}