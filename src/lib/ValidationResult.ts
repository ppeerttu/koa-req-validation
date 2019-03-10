import { IValidationError } from "..";
import { MappedValidationResults } from "./types";

/**
 * Validation result set.
 */
export default class ValidationResult {

    private results: IValidationError[];

    constructor(results?: IValidationError[]) {
        if (results) {
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
        return this.results;
    }

    /**
     * Return the validation results as mapped validation results.
     */
    public mapped(): MappedValidationResults {
        const validation: MappedValidationResults = {};
        for (const result of this.results) {
            validation[result.param]= result;
        }
        return validation;
    }

}