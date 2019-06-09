import { ParameterizedContext } from 'koa';
import validator from 'validator';

import { IValidationContext, IValidationError } from '..';
import {
    CustomValidatorFunction,
    IIsCurrencyOptions,
    IIsDecimalOptions,
    IIsFQDNOptions,
    IISSNOptions,
    IIsURLOptions,
    IMinMaxOptions,
    IOptionalOptions,
    IsAlphaLocale,
    IsInValuesOptions,
    IsMobilePhoneLocale,
    IsPostalCodeLocale,
    IValidationDefinition,
    ParamLocation,
    ISanitationDefinition,
    INormalizeEmailOptions,
} from './types';
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
    private validations: IValidationDefinition[] = [];

    /**
     * Sanitations to be executed.
     */
    private sanitations: ISanitationDefinition[] = [];

    /**
     * Location of the given parameter.
     */
    private location: ParamLocation;

    /**
     * Is this parameter optional?
     */
    private isOptional: {
        value: boolean,
        options?: IOptionalOptions,
    } = { value: false };

    /**
     * Create a new ValidationChain.
     *
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
                + ` but received ${location}`,
            );
        }
        this.location = location;
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
    public run = () => async (
        ctx: ParameterizedContext<IValidationContext>,
        next: () => Promise<void>,
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
     *
     * @param message Custom message
     */
    public withMessage(message: string) {
        const validationDefinition = this.validations[this.validations.length - 1];
        validationDefinition.message = message;
        return this;
    }

    /**
     * Set this property as optional.
     */
    public optional(options?: IOptionalOptions) {
        this.isOptional = {
            value: true,
            options,
        };
        return this;
    }

    /**
     * Custom async validation function to execute. The function
     * must throw when the validation fails.
     *
     * @param func The validation function
     */
    public custom(func: CustomValidatorFunction) {
        this.validations.push({
            validation: 'custom',
            func,
        });
        return this;
    }

    /**
     * Check if the request property contains the given seed.
     */
    public contains(seed: string) {
        this.validations.push({
            validation: 'contains',
            options: seed,
        });
        return this;
    }

    /**
     * Check if the request property equals the given comparison.
     */
    public equals(comparison: string) {
        this.validations.push({
            validation: 'equals',
            options: comparison,
        });
        return this;
    }

    /**
     * Check if the parameter is an integer.
     */
    public isInt(options?: IMinMaxOptions) {
        this.validations.push({
            validation: 'isInt',
            options,
        });
        return this;
    }

    /**
     * Check if the string is in given length.
     *
     * @param options Min and max length
     */
    public isLength(options: IMinMaxOptions) {
        this.validations.push({
            validation: 'isLength',
            options,
        });
        return this;
    }

    /**
     * Check if the parameter is an email.
     */
    public isEmail() {
        this.validations.push({
            validation: 'isEmail',
        });
        return this;
    }

    /**
     * Check if the parameter is a boolean value.
     */
    public isBoolean() {
        this.validations.push({
            validation: 'isBoolean',
        });
        return this;
    }

    /**
     * Check if the parameter is a zero length string.
     */
    public isEmpty() {
        this.validations.push({
            validation: 'isEmpty',
        });
        return this;
    }

    /**
     * Check if the parameter is a float.
     */
    public isFloat() {
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
    public isHash(algorithm: ValidatorJS.HashAlgorithm) {
        this.validations.push({
            validation: 'isHash',
            options: algorithm,
        });
        return this;
    }

    /**
     * Check if the parameter is a valid JWT token.
     */
    public isJWT() {
        this.validations.push({
            validation: 'isJWT',
        });
        return this;
    }

    /**
     * Check if the parameter is a valid JSON. Uses
     * `JSON.parse`.
     */
    public isJSON() {
        this.validations.push({
            validation: 'isJSON',
        });
        return this;
    }

    /**
     * Check if the parameter is a latitude-lognitude coordinate
     * in the format `lat,long` or `lat, long`.
     */
    public isLatLong() {
        this.validations.push({
            validation: 'isLatLong',
        });
        return this;
    }

    /**
     * Check if the paramter contains only lowercase characters.
     */
    public isLowercase() {
        this.validations.push({
            validation: 'isLowercase',
        });
        return this;
    }

    /**
     * Check if the parameter is a MAC address.
     */
    public isMACAddress() {
        this.validations.push({
            validation: 'isMACAddress',
        });
        return this;
    }

    /**
     * Check if the parameter is a valid MongoDB ObjectId.
     */
    public isMongoId() {
        this.validations.push({
            validation: 'isMongoId',
        });
        return this;
    }

    /**
     * Check if the parameter contains only numbers.
     */
    public isNumeric() {
        this.validations.push({
            validation: 'isNumeric',
        });
        return this;
    }

    /**
     * Check if the parameter is a valid port number.
     */
    public isPort() {
        this.validations.push({
            validation: 'isPort',
        });
        return this;
    }

    /**
     * Check if the parameter is valid UUID (v3, v4 or v5).
     */
    public isUUID() {
        this.validations.push({
            validation: 'isUUID',
        });
        return this;
    }

    /**
     * Check if the parameter contains only uppercase characters.
     */
    public isUppercase() {
        this.validations.push({
            validation: 'isUppercase',
        });
        return this;
    }

    /**
     * Check if the parameter matches given regular expression.
     *
     * @param regExp The regular expression
     */
    public matches(regExp: RegExp) {
        this.validations.push({
            validation: 'matches',
            options: regExp,
        });
        return this;
    }

    /**
     * Check if the parameter is some of the allowed
     * values.
     *
     * @param values Options containing at least `values`
     * property with allowed values
     */
    public isIn(values: IsInValuesOptions) {
        this.validations.push({
            validation: 'isIn',
            options: values,
        });
        return this;
    }

    /**
     * Check if the string is a date that's after the specified
     * date (defaults to now).
     *
     * @param date The date
     */
    public isAfter(date = new Date().toString()) {
        this.validations.push({
            validation: 'isAfter',
            options: date,
        });
        return this;
    }

    /**
     * Check if the string contains only letters. Locale
     * defaults to en-US.
     *
     * @param locale The locale
     */
    public isAlpha(locale?: IsAlphaLocale) {
        this.validations.push({
            validation: 'isAlpha',
            options: locale,
        });
        return this;
    }

    /**
     * Check if the string contains only letters and numbers.
     * Locale defaults to en-US.
     *
     * @param locale The locale
     */
    public isAlphanumeric(locale?: IsAlphaLocale) {
        this.validations.push({
            validation: 'isAlphanumeric',
            options: locale,
        });
        return this;
    }

    /**
     * Check if the string contains ACII characters only.
     */
    public isAscii() {
        this.validations.push({
            validation: 'isAscii',
        });
        return this;
    }

    /**
     * Check if the string is base64 encoded.
     */
    public isBase64() {
        this.validations.push({
            validation: 'isBase64',
        });
        return this;
    }

    /**
     * Check if the string is a date that's before
     * the given date. Defaults to now.
     *
     * @param date The date
     */
    public isBefore(date = new Date().toString()) {
        this.validations.push({
            validation: 'isBefore',
            options: date,
        });
        return this;
    }

    /**
     * Check if the strin's length (in UTF-8 bytes)
     * falls in range.
     *
     * @param options The range
     */
    public isByteLength(options: IMinMaxOptions = { min: 0 }) {
        this.validations.push({
            validation: 'isByteLength',
            options,
        });
        return this;
    }

    /**
     * Check if the string is a credit card.
     */
    public isCreditCard() {
        this.validations.push({
            validation: 'isCreditCard',
        });
        return this;
    }

    /**
     * Check if the string is a valid currency amount.
     *
     * @param options The options
     */
    public isCurrency(options?: IIsCurrencyOptions) {
        this.validations.push({
            validation: 'isCurrency',
            options,
        });
        return this;
    }

    /**
     * Check if the string is a data uri format.
     */
    public isDataURI() {
        this.validations.push({
            validation: 'isDataURI',
        });
        return this;
    }

    /**
     * Check if the string represents a decimal number.
     *
     * @param options The options
     */
    public isDecimal(options?: IIsDecimalOptions) {
        this.validations.push({
            validation: 'isDecimal',
            options,
        });
        return this;
    }

    /**
     * Check if the string is a number divisible by
     * given number.
     *
     * @param division The division number
     */
    public isDivisibleBy(division: number) {
        this.validations.push({
            validation: 'isDivisibleBy',
            options: division,
        });
        return this;
    }

    /**
     * Check if the string is fully qualified
     * domain name.
     *
     * @param options The options
     */
    public isFQDN(options?: IIsFQDNOptions) {
        this.validations.push({
            validation: 'isFQDN',
            options,
        });
        return this;
    }

    /**
     * Check if the string contains any full-width
     * chars.
     */
    public isFullWidth() {
        this.validations.push({
            validation: 'isFullWidth',
        });
        return this;
    }

    /**
     * Check if the string contains any half-width
     * chars.
     */
    public isHalfWidth() {
        this.validations.push({
            validation: 'isHalfWidth',
        });
        return this;
    }

    /**
     * Check if the string is a hexadecimal
     * color.
     */
    public isHexColor() {
        this.validations.push({
            validation: 'isHexColor',
        });
        return this;
    }

    /**
     * Check if the string is a hexadecimal
     * number.
     */
    public isHexadecimal() {
        this.validations.push({
            validation: 'isHexadecimal',
        });
        return this;
    }

    /**
     * Check if the string is an IP (ver 4 or 6).
     */
    public isIP(version?: 4 | 6) {
        this.validations.push({
            validation: 'isIP',
            options: version,
        });
        return this;
    }

    /**
     * Check if the string is an IP range (ver 4 only).
     */
    public isIPRange() {
        this.validations.push({
            validation: 'isIPRange',
        });
        return this;
    }

    /**
     * Check if the string is an ISBN.
     *
     * @param version The version
     */
    public isISBN(version: 10 | 13) {
        this.validations.push({
            validation: 'isISBN',
            options: version,
        });
        return this;
    }

    /**
     * Check if the string is an ISSN.
     *
     * @param options The options
     */
    public isISSN(options?: IISSNOptions) {
        this.validations.push({
            validation: 'isISSN',
            options,
        });
        return this;
    }

    /**
     * Check if the string is an ISIN.
     */
    public isISIN() {
        this.validations.push({
            validation: 'isISIN',
        });
        return this;
    }

    /**
     * Check if the string is valid ISO8601 date.
     */
    public isISO8601() {
        this.validations.push({
            validation: 'isISO8601',
        });
        return this;
    }

    /**
     * Check if the string is valid RFC3339 date.
     */
    public isRFC3339() {
        this.validations.push({
            validation: 'isRFC3339',
        });
        return this;
    }

    /**
     * Check if the string is a valid ISO 3166-1 alpha-2
     * officially assigned country code.
     */
    public isISO31661Alpha2() {
        this.validations.push({
            validation: 'isISO31661Alpha2',
        });
        return this;
    }

    /**
     * Check if the string is a ISRC.
     */
    public isISRC() {
        this.validations.push({
            validation: 'isISRC',
        });
        return this;
    }

    /**
     * Check if the string is a MD5 hash.
     */
    public isMD5() {
        this.validations.push({
            validation: 'isMD5',
        });
        return this;
    }

    /**
     * Check if the string is a valid MIME type format.
     */
    public isMimeType() {
        this.validations.push({
            validation: 'isMimeType',
        });
        return this;
    }

    /**
     * Check if the string is a mobile phone number.
     *
     * @param locale The locale, defaults to any
     */
    public isMobilePhone(
        locale: 'any' | IsMobilePhoneLocale | IsMobilePhoneLocale[] = 'any',
    ) {
        this.validations.push({
            validation: 'isMobilePhone',
            options: locale,
        });
        return this;
    }

    /**
     * Check if the string contains one or more multibyte chars.
     */
    public isMultibyte() {
        this.validations.push({
            validation: 'isMultibyte',
        });
        return this;
    }

    /**
     * Check if the string is a postal code.
     *
     * @param locale The locale to use
     */
    public isPostalCode(locale: IsPostalCodeLocale = 'any') {
        this.validations.push({
            validation: 'isPostalCode',
            options: locale,
        });
        return this;
    }

    /**
     * Check if the string contains any surrogate pairs chars.
     */
    public isSurrogatePair() {
        this.validations.push({
            validation: 'isSurrogatePair',
        });
        return this;
    }

    /**
     * Check if the string is an URL.
     *
     * @param options Possible options
     */
    public isURL(options?: IIsURLOptions) {
        this.validations.push({
            validation: 'isURL',
            options,
        });
        return this;
    }

    /**
     * Check if the string contains a mixture of full and half-width chars.
     */
    public isVariableWidth() {
        this.validations.push({
            validation: 'isVariableWidth',
        });
        return this;
    }

    /**
     * Checks characters if they appear in the whitelist.
     *
     * @param chars The characters
     */
    public isWhitelisted(chars: string | string[]) {
        this.validations.push({
            validation: 'isWhitelisted',
            options: chars,
        });
        return this;
    }

    /**
     * Run the validations and return the results.
     * @param ctx The context
     */
    private async checkResults(
        ctx: ParameterizedContext<IValidationContext>,
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
                            + `param ${this.parameter} at ${this.location}`,
                        );
                    }
                    try {
                        await func(input, ctx);
                    } catch (e) {
                        arr.push({
                            msg: message || e.message || this.defaultErrorMessage,
                            location: this.location,
                            param: this.parameter,
                            value: originalInput + '',
                        });
                    }

                    // @ts-ignore
                } else if (input === null || !validator[validation](input, options)) {
                    arr.push({
                        msg: message || this.defaultErrorMessage,
                        location: this.location,
                        param: this.parameter,
                        value: originalInput + '',
                    });
                }

                return arr;
            },
            Promise.resolve([]),
        );
        return new ValidationResult(errors);
    }

    /**
     * Sanitize the given input value according to sanitation definitions.
     *
     * @param input The input as string
     */
    private sanitize(input: string): string | boolean | Date | number {
        let value: string | boolean | Date | number = input;
        for (const { sanitation, options } of this.sanitations) {
            if (typeof value !== 'string') {
                // Once a to-starting sanitation has been done, the sanitation process
                // has to end
                break;
            }
            switch (sanitation) {
                case 'blacklist':
                case 'whitelist':
                    value = validator[sanitation](value, options as string);
                    break;
                case 'escape':
                case 'unescape':
                    value = validator[sanitation](value);
                    break;
                case 'ltrim':
                case 'rtrim':
                case 'trim':
                    value = validator[sanitation](value, options as string | undefined);
                    break;
                case 'normalizeEmail':
                    value = validator.normalizeEmail(
                        value,
                        options as INormalizeEmailOptions | undefined,
                    );
                    break;
                case 'stripLow':
                case 'toBoolean':
                    value = validator[sanitation](value, options as boolean | undefined);
                    break;
                case 'toDate':
                case 'toFloat':
                    value = validator[sanitation](value);
                    break;
                case 'toInt':
                    value = validator[sanitation](value, options as number | undefined);
                    break;
            }
        }
        return value;
    }
}
