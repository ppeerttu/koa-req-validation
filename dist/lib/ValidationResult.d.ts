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
    static fromResults(results: ValidationResult[]): ValidationResult;
    readonly parameters: string[];
    readonly finalValues: (undefined | string | boolean | Date | number)[];
    private results;
    constructor(parameter?: string | string[], finalValue?: undefined | string | boolean | Date | number | (undefined | string | boolean | Date | number)[], results?: IValidationError[]);
    /**
     * See if validation result has any validation errors.
     */
    hasErrors(): boolean;
    /**
     * Reuturn the validation results as an array.
     */
    array(): IValidationError[];
    /**
     * Return the validation results as mapped validation results.
     */
    mapped(): IMappedValidationResults;
    /**
     * Return final values that have been stored within this validation result. This can
     * be used for retrieving all values that have passed validations and been sanitized.
     */
    passedData<T = Record<string, unknown>>(): T;
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
    private deepen;
}
