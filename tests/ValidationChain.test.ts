import ValidationChain from "../src/lib/ValidationChain";
import { ParamLocation } from "../src/lib/types";
import { mockContext } from "./helpers";
import { validationResults } from "../src";

/**
 * Mock next function
 */
const next = async () => {};

const prop = 'property';

/**
 * ValidationChain
 */
describe('ValidationChain', () => {

    describe('constructor()', () => {

        test('Constructs without exceptions', () => {
            expect(() => {
                new ValidationChain('param', ParamLocation.BODY);
            }).not.toThrow();
        });
    
        test('Throws a TypeError with invalid parameters', () => {
            expect(() => {
                const location: any = 'invalid';
                new ValidationChain('param', location);
            }).toThrow(TypeError);
        });  
  
    });

    test('Stores validations', async () => {
        const validationChain = new ValidationChain('param', ParamLocation.BODY)
            .contains('seed')
            .equals('foo');

        const ctx: any = mockContext();
        await validationChain.run()(ctx, next);
        const results = validationResults(ctx);
        expect(results.hasErrors()).toBe(true);
        expect(results.array().length).toBe(2)
    });

    describe('optional()', () => {

        test('Ignores undefined value', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .equals('foo')
                .optional();
    
            const ctx: any = mockContext();
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(false);
            expect(results.array().length).toBe(0);
        });

        test('Doesn\t ignore null value', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .equals('foo')
                .optional();
    
            const ctx: any = mockContext(ParamLocation.BODY, { param: null });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(true);
            expect(results.array().length).toBe(1);
        });


        test('Ignore null value when alloNull has been set', async () => {
            const validationChain = new ValidationChain('param', ParamLocation.BODY)
                .equals('foo')
                .optional({ allowNull: true });
    
            const ctx: any = mockContext(ParamLocation.BODY, { param: null });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.hasErrors()).toBe(false);
            expect(results.array().length).toBe(0);
        });

    });

    describe('custom()', () => {

        test('Returns errors if function throws', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .custom(
                    async (input: any) => {
                        if (typeof input !== 'number') {
                            throw new TypeError('Invalid number: ' + input);
                        }
                    }
                );
            const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(1);
        });


        test('Doesn\'t return errors if function doesn\'t throw', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .custom(
                    async (input: any) => {
                        if (typeof input !== 'number') {
                            throw new TypeError('Invalid number: ' + input);
                        }
                    }
                );
            const ctx: any = mockContext(ParamLocation.BODY, { int: 12 });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });
    });

    describe('isInt()', () => {

        test('No errors if valid integer', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt();
            const ctx: any = mockContext(ParamLocation.BODY, { int: '12' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });

        test('Returns error if not valid integer', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt();
            const ctx: any = mockContext(ParamLocation.BODY, { int: 'abc' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('int');
        });

        test('Returns error if value too small', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt({ min: 5});
            const ctx: any = mockContext(ParamLocation.BODY, { int: '-9' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('int');
        });

        test('Returns error if value too big', async () => {
            const validationChain = new ValidationChain('int', ParamLocation.BODY)
                .isInt({ max: 5 });
            const ctx: any = mockContext(ParamLocation.BODY, { int: '9' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('int');
        });

    });

    describe('isLength()', () => {

        test('Returns null if value is in given length', async () => {
            const validationChain = new ValidationChain('string', ParamLocation.PARAM)
                .isLength({ min: 5, max: 7 });
            const ctx: any = mockContext(ParamLocation.PARAM, { string: 'abcabc' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });

        test('Returns error if value too small', async () => {
            const validationChain = new ValidationChain('string', ParamLocation.PARAM)
                .isLength({ min: 5 });
            const ctx: any = mockContext(ParamLocation.PARAM, { string: 'ab' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('string');
        });

        test('Returns error if value too big', async () => {
            const validationChain = new ValidationChain('string', ParamLocation.PARAM)
                .isLength({ max: 5 });
            const ctx: any = mockContext(ParamLocation.PARAM, { string: 'abcabc' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('string');
        });

    });

    describe('isEmail()', () => {

        test('Returns null if the value is valid email', async () => {
            const validationChain = new ValidationChain('email', ParamLocation.BODY)
                .isEmail();
            const ctx = mockContext(ParamLocation.BODY, { email: 'foo@bar.com' });
            await validationChain.run()(ctx, next);
            expect(validationResults(ctx).array().length).toBe(0);
        });

        test('Returns error if the value is not valid email', async () => {
            const validationChain = new ValidationChain('email', ParamLocation.BODY)
                .isEmail();
            const ctx = mockContext(ParamLocation.BODY, { email: 'foobar.com' });
            const ctx2 = mockContext(ParamLocation.BODY, { email: 'foo@bar' });
            await validationChain.run()(ctx, next);
            await validationChain.run()(ctx2, next);
            expect(validationResults(ctx).mapped()).toHaveProperty('email');
            expect(validationResults(ctx2).mapped()).toHaveProperty('email');
        });

    });

    describe('withMessage()', () => {

        test('Return the given message when validation returns an error', async () => {
            const message = 'Has to be a real email';
            const validationChain = new ValidationChain('email', ParamLocation.BODY)
                .isEmail()
                .withMessage(message)
            const ctx = mockContext(ParamLocation.BODY, { email: 'foobar.com' });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            const mappedResults = results.mapped();
            expect(mappedResults).toHaveProperty('email');
            expect(mappedResults.email).toHaveProperty('msg', message);
        });

    });

    describe('contains()', () => {

        test('Return an error if the haystack doesn\'t contain the seed', async () => {
            const seed = 'seed';
            const haystack = 'haystack';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .contains(seed);
            const ctx = mockContext(ParamLocation.BODY, { [prop]: haystack });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the haystack contains the seed', async () => {
            const seed = 'seed';
            const haystack = 'hayseed';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .contains(seed);
            const ctx = mockContext(ParamLocation.BODY, { [prop]: haystack });
            await validationChain.run()(ctx, next);
            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('equals', () => {

        test('Returns an error if the strings doesn\'t match', async () => {
            const comparison = 'comparison';
            const value = 'nosirapmoc';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .equals(comparison);
            
            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the values equal', async () => {
            const comparison = 'comparison';
            const value = 'comparison';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .equals(comparison);
            
            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isBoolean()', () => {

        test('Returns an error if the value is not boolean value', async () => {
            const value = null;
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isBoolean();
            
            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is a boolean value', async () => {
            const value = false;
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isBoolean();
            
            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

    describe('isEmpty()', () => {

        test('Returns an error if the value is not empty', async () => {
            const value = 'value';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isEmpty();
            
            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).toHaveProperty(prop);
        });

        test('Doesn\'t return an error if the value is empty', async () => {
            const value = '';
            const validationChain = new ValidationChain(prop, ParamLocation.BODY)
                .isEmpty();
            
            const ctx = mockContext(ParamLocation.BODY, { [prop]: value });
            await validationChain.run()(ctx, next);

            const results = validationResults(ctx);
            expect(results.mapped()).not.toHaveProperty(prop);
        });

    });

});