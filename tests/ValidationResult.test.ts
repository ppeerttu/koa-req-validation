import { IValidationError } from '../src';
import ValidationResult from '../src/lib/ValidationResult';

describe('ValidationResult', () => {

    describe('constructor()', () => {

        test('Constructs without exceptions', () => {
            expect(() => {
                const results1 = new ValidationResult();
                const results2 = new ValidationResult([]);
                const results3 = new ValidationResult([], []);
                const results4 = new ValidationResult([], [], []);
            }).not.toThrow();
        });

        test('Throws a TypeError when initializing with invalid value', () => {
            expect(() => {
                const param: any = {};
                const restults = new ValidationResult([], [], param);
            }).toThrow(TypeError);

            expect(() => {
                const results = new ValidationResult('foo', []);
            }).toThrow(Error);
        });

    });

    describe('static fromResults()', () => {

        test('Merges values properly', () => {
            const err1: IValidationError = {
                msg: 'Invalid value',
                value: 'null',
                param: 'name',
                location: 'body',
            };
            const err2: IValidationError = {
                msg: 'Invalid value',
                value: '31-31-2019',
                param: 'startDate',
                location: 'body',
            };
            const result1 = new ValidationResult('foo', undefined, [err1]);
            const result2 = new ValidationResult([], [], [err2]);
            const result3 = new ValidationResult(['biz', 'baz'], [new Date(), 2], []);

            const merged = ValidationResult.fromResults([result1, result2, result3]);

            expect(merged.parameters.length).toBe(3);
            expect(merged.finalValues.length).toBe(3);
            expect(merged.hasErrors()).toBe(true);
            expect(merged.array().length).toBe(2);
        });
    });

    describe('hasErrors()', () => {

        test('Should return false when no errors in result', () => {
            const results = new ValidationResult([], []);

            expect(results.hasErrors()).toBe(false);
        });

        test('Should return true when there are errors in result', () => {
            const results = new ValidationResult([], [], [{
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
            const result1 = new ValidationResult([], []);
            const result2 = new ValidationResult([], [], errors);

            expect(result1.array()).toHaveProperty('length', 0);
            expect(result2.array()).toStrictEqual(errors);
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
            const result2 = new ValidationResult([], [], errors);

            expect(Object.keys(result1.mapped()).length).toBe(0);
            const mapped = result2.mapped();
            expect(Object.keys(mapped).length).toBe(1);
            expect(mapped.foo).toBe(errors[0]);
        });

    });

    describe('passedData()', () => {

        test('Should return passed values in an object', () => {
            const err1: IValidationError = {
                msg: 'Invalid value',
                value: 'null',
                param: 'name',
                location: 'body',
            };
            const err2: IValidationError = {
                msg: 'Invalid value',
                value: '31-31-2019',
                param: 'startDate',
                location: 'body',
            };
            const result1 = new ValidationResult('foo', undefined, [err1]);
            const result2 = new ValidationResult([], [], [err2]);
            const result3 = new ValidationResult(['biz', 'baz'], [new Date(), 2], []);

            const merged = ValidationResult.fromResults([result1, result2, result3]);

            const passed = merged.passedData();

            expect(passed.biz).toBeInstanceOf(Date);
            expect(passed.baz).toBe(2);
            expect(Object.keys(passed).length).toBe(2);
        });

    });

});
