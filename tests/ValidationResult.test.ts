import { IValidationError } from '../src';
import ValidationResult from '../src/lib/ValidationResult';

describe('ValidationResult', () => {

    describe('constructor()', () => {

        test('Constructs without exceptions', () => {
            expect(() => {
                const results1 = new ValidationResult();
                const results2 = new ValidationResult([]);
            }).not.toThrow();
        });

        test('Throws a TypeError when initializing with invalid value', () => {
            expect(() => {
                const param: any = {};
                const restults = new ValidationResult(param);
            }).toThrow(TypeError);
        });

    });

    describe('hasErrors()', () => {

        test('Should return false when no errors in result', () => {
            const results = new ValidationResult();

            expect(results.hasErrors()).toBe(false);
        });

        test('Should return true when there are errors in result', () => {
            const results = new ValidationResult([{
                param: 'foo',
                msg: 'Invalid value',
                location: 'body',
                value: '',
            }]);

            expect(results.hasErrors()).toBe(true);
        });

    });

    describe('array()', () => {

        test('Should return the array of validation errors', () => {
            const errors: IValidationError[] = [
                {
                    param: 'foo',
                    msg: 'Invalid value',
                    location: 'body',
                    value: '',
                },
            ];
            const result1 = new ValidationResult();
            const result2 = new ValidationResult(errors);

            expect(result1.array()).toHaveProperty('length', 0);
            expect(result2.array()).toBe(errors);
        });

    });

    describe('mapped()', () => {

        test('Should return the array of validation errors as mapped object', () => {
            const errors: IValidationError[] = [
                {
                    param: 'foo',
                    msg: 'Invalid value',
                    location: 'body',
                    value: '',
                },
            ];
            const result1 = new ValidationResult();
            const result2 = new ValidationResult(errors);

            expect(Object.keys(result1.mapped()).length).toBe(0);
            const mapped = result2.mapped();
            expect(Object.keys(mapped).length).toBe(1);
            expect(mapped.foo).toBe(errors[0]);
        });

    });

});
