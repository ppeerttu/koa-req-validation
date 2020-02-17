"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Validation result set.
 */
class ValidationResult {
    /**
     * Merge multiple validation error results into a single one.
     *
     * @param results An array of validation error results
     */
    static fromResults(results) {
        const parameters = [];
        const finalValues = [];
        const errors = [];
        for (const result of results) {
            parameters.push(...result.parameters);
            finalValues.push(...result.finalValues);
            errors.push(...result.array());
        }
        return new ValidationResult(parameters, finalValues, errors);
    }
    constructor(parameter = [], 
    // tslint:disable-next-line: max-line-length
    finalValue, results) {
        this.parameters = Array.isArray(parameter) ? parameter : [parameter];
        this.finalValues = Array.isArray(finalValue)
            ? finalValue
            : (this.parameters.length ? [finalValue] : []);
        if (this.parameters.length !== this.finalValues.length) {
            throw new Error(`Invalid ValidationResult state: parameters (${this.parameters.length})`
                + ` and finalValues (${this.finalValues.length}) do not match`);
        }
        if (results) {
            if (!Array.isArray(results)) {
                throw new TypeError(`Parameter for ValidationResult constructor must be an`
                    + ` array but received ${results}`);
            }
            this.results = results;
        }
        else {
            this.results = [];
        }
    }
    /**
     * See if validation result has any validation errors.
     */
    hasErrors() {
        return this.results.length > 0;
    }
    /**
     * Reuturn the validation results as an array.
     */
    array() {
        return [...this.results];
    }
    /**
     * Return the validation results as mapped validation results.
     */
    mapped() {
        const validation = {};
        for (const result of this.results) {
            validation[result.param] = result;
        }
        return validation;
    }
    /**
     * Return final values that have been stored within this validation result. This can
     * be used for retrieving all values that have passed validations and been sanitized.
     */
    passedData() {
        const results = {};
        for (let i = 0; i < this.parameters.length; i++) {
            if (typeof this.finalValues[i] !== 'undefined') {
                results[this.parameters[i]] = this.finalValues[i];
            }
        }
        return results;
    }
}
exports.default = ValidationResult;
//# sourceMappingURL=ValidationResult.js.map