import { IValidationError } from '..';
import { IMappedValidationResults } from './types';
/**
 * Validation result set.
 */
export default class ValidationResult {
    private results;
    constructor(results?: IValidationError[]);
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
}
