import { validationResults } from '../src';
import { ParamLocation } from '../src/lib/types';
import ValidationChain from '../src/lib/ValidationChain';
import { mockContext } from './helpers';

/**
 * Mock next function
 */
const next = async () => {
    // no-op
};

const prop = 'property';

/**
 * ValidationChain
 */
describe('ValidationChain', () => {

    describe('constructor()', () => {

        test('Constructs without exceptions', () => {
            expect(() => {
                const chain = new ValidationChain('param', ParamLocation.BODY);
            }).not.toThrow();
        });

        test('Throws a TypeError with invalid parameters', () => {
            expect(() => {
                const location: any = 'invalid';
                const chain = new ValidationChain('param', location);
            }).toThrow(TypeError);
        });

    });

    describe('Chaining', () => {

        test('Stores validations', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .contains('seed')
                .equals('foo');

            const ctx: any = mockContext();
            await validationChain.build()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(results.array().length).toBe(2);
            expect(Object.keys(results.mapped()).length).toBe(1);
        });

        test('Combines previous chain results', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .contains('seed')
                .equals('foo');
            const validationChain2 = new ValidationChain('param2', ParamLocation.PARAM)
                .isInt();

            const ctx: any = mockContext();
            await validationChain.build()(ctx, next);
            await validationChain2.build()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(Object.keys(results.mapped()).length).toBe(2);
            expect(results.array().length).toBe(3);
        });

        test('Runs sanitizers only if validators have been passed', async () => {
            const valid = '2019-01-01';
            const invalid = '2019-20-20';

            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isISO8601()
                .toDate();

            const ctxInvalid = mockContext(ParamLocation.BODY, { [prop]: invalid });
            const ctxValid = mockContext(ParamLocation.BODY, { [prop]: valid });

            await validationChain.build()(ctxInvalid, next);

            let results = validationResults(ctxInvalid);

            expect(results.hasErrors()).toBe(true);
            expect(Object.keys(results.passedData()).length).toBe(0);

            await validationChain.build()(ctxValid, next);

            results = validationResults(ctxValid);

            expect(results.hasErrors()).toBe(false);
            expect(Object.keys(results.passedData()).length).toBe(1);
            expect(results.passedData()[prop]).toBeInstanceOf(Date);
        });

        test('Works with deprecated .run() as well', async () => {
            const valid = '2019-01-01';
            const invalid = '2019-20-20';

            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isISO8601()
                .toDate();

            const ctxInvalid = mockContext(ParamLocation.BODY, { [prop]: invalid });
            const ctxValid = mockContext(ParamLocation.BODY, { [prop]: valid });

            await validationChain.run()(ctxInvalid, next);

            let results = validationResults(ctxInvalid);

            expect(results.hasErrors()).toBe(true);
            expect(Object.keys(results.passedData()).length).toBe(0);

            await validationChain.run()(ctxValid, next);

            results = validationResults(ctxValid);

            expect(results.hasErrors()).toBe(false);
            expect(Object.keys(results.passedData()).length).toBe(1);
            expect(results.passedData()[prop]).toBeInstanceOf(Date);
        });

    });

});
