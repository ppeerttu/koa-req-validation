"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Validation result set.
 */
class ValidationResult {
    constructor(results) {
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
        return this.results;
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
}
exports.default = ValidationResult;
//# sourceMappingURL=ValidationResult.js.map