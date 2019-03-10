import validator from "validator";
import { IValidationDefinition, ParamLocation, IMinMaxOptions, IAllowNullOptions, CustomValidatorFunction } from "./types";
import { ParameterizedContext } from "koa";
import { IValidationContext, IValidationError } from "..";
import ValidationResult from "./ValidationResult";

/**
 * The validation chain object.
 */
export default class ValidationChain {

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
        options?: IAllowNullOptions
    };

    constructor(
        parameter: string,
        location: ParamLocation,
    ) {
        this.parameter = parameter;
        this.location = location;
        this.validations = [];
        this.isOptional = { value: false };
    }

    run = () => async (
        ctx: ParameterizedContext<IValidationContext>,
        next: () => Promise<void>
    ) => {
        try {
            const results = await this.checkResults(ctx);
            if (results) {
                if (Array.isArray(ctx.state.validationResults)) {
                    ctx.state.validationResults.push(results);
                } else {
                    ctx.state.validationResults = [results];
                }
            }
        } catch (e) {
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
    optional(options?: IAllowNullOptions) {
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
     * Run the validations and return the results.
     * @param ctx The context
     */
    private async checkResults(
        ctx: ParameterizedContext<IValidationContext>
    ): Promise<ValidationResult | null> {
        let input: any;;
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
        }

        const errors = await this.validations.reduce(
            async (arrP: Promise<IValidationError[]>, current) => {
                const arr = await arrP;
                const { validation, options, message, func } = current;

                if (validation === 'custom') {
                    try {
                        if (!func) {
                            throw new Error(
                                `No custom validation function defined for `
                                + `param ${this.parameter} at ${this.location}`
                            );
                        }
                        await func(input, ctx);
                    } catch (e) {
                        arr.push({
                            msg: message || e.message || 'Invalid value',
                            location: this.location,
                            param: this.parameter,
                            value: originalInput + ''
                        });
                    }

                    // @ts-ignore
                } else if (input === null || !validator[validation](input, options)) {
                    arr.push({
                        msg: message || 'Invalid value',
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