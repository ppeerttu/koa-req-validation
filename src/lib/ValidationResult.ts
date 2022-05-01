import { IMappedValidationResults, IValidationError } from "./types";

/**
 * Validation result set.
 */
export default class ValidationResult {
    /**
     * Merge multiple validation error results into a single one.
     *
     * @param results An array of validation error results
     */
    public static fromResults(results: ValidationResult[]): ValidationResult {
        const parameters: string[] = [];
        const finalValues: (undefined | string | boolean | Date | number)[] = [];
        const errors: IValidationError[] = [];

        for (const result of results) {
            parameters.push(...result.parameters);
            finalValues.push(...result.finalValues);
            errors.push(...result.array());
        }
        return new ValidationResult(parameters, finalValues, errors);
    }

    public readonly parameters: string[];

    public readonly finalValues: (undefined | string | boolean | Date | number)[];

    private results: IValidationError[];

    constructor(
        parameter: string | string[] = [],
        // tslint:disable-next-line: max-line-length
        finalValue?:
            | undefined
            | string
            | boolean
            | Date
            | number
            | (undefined | string | boolean | Date | number)[],
        results?: IValidationError[]
    ) {
        this.parameters = Array.isArray(parameter) ? parameter : [parameter];
        this.finalValues = Array.isArray(finalValue)
            ? finalValue
            : this.parameters.length
            ? [finalValue]
            : [];

        if (this.parameters.length !== this.finalValues.length) {
            throw new Error(
                `Invalid ValidationResult state: parameters (${this.parameters.length})` +
                    ` and finalValues (${this.finalValues.length}) do not match`
            );
        }
        if (results) {
            if (!Array.isArray(results)) {
                throw new TypeError(
                    `Parameter for ValidationResult constructor must be an` +
                        ` array but received ${results}`
                );
            }
            this.results = results;
        } else {
            this.results = [];
        }
    }

    /**
     * See if validation result has any validation errors.
     */
    public hasErrors(): boolean {
        return this.results.length > 0;
    }

    /**
     * Reuturn the validation results as an array.
     */
    public array(): IValidationError[] {
        return [...this.results];
    }

    /**
     * Return the validation results as mapped validation results.
     */
    public mapped(): IMappedValidationResults {
        const validation: IMappedValidationResults = {};
        for (const result of this.results) {
            validation[result.param] = result;
        }
        return validation;
    }

    /**
     * Return final values that have been stored within this validation result. This can
     * be used for retrieving all values that have passed validations and been sanitized.
     */
    public passedData<T = Record<string, unknown>>(): T {
        const results: Record<string, unknown> = {};
        for (let i = 0; i < this.parameters.length; i++) {
            if (typeof this.finalValues[i] !== "undefined") {
                results[this.parameters[i]] = this.finalValues[i];
            }
        }
        return this.deepen<T>(results);
    }

    /**
     * Deepen a dot-notated nested object into a real nested object.
     *
     * @param obj Object with dot-notated nested properties
     *
     * ```typescript
     * const dotNotated = { "nested.prop": "value" };
     * const deepened = this.deepen(dotNotated);
     * console.log(deepened); // { 'nested': { 'prop': 'value' }}
     * ```
     */
    private deepen<T = Record<string, unknown>>(obj: Record<string, unknown>): T {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const output: Record<string, any> = {};
        for (const key in obj) {
            let t = output;
            const parts = key.split(".");
            const k = parts.pop() as string;
            while (parts.length) {
                const part = parts.shift() as string;
                t = t[part] = t[part] || {};
            }
            t[k] = obj[key];
        }
        return output as T;
    }
}
