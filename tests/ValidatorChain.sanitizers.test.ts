import { validationResults } from '../src';
import { CustomErrorMessageFunction, ParamLocation } from '../src/lib/types';
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
 * ValidatorChain sanitizer functions
 */
describe('ValidatorChain sanitizers', () => {

    test('blacklist()', async () => {
        const chars = 'l ';
        const value = 'hello world';

        const validationChain = new ValidationChain(prop, ParamLocation.QUERY)
            .blacklist(chars);
        const ctx = mockContext(ParamLocation.QUERY, { [prop]: value });
        await validationChain.run()(ctx, next);

        const results = validationResults(ctx);
        expect(results.mapped()).not.toHaveProperty(prop);

        const passedData = results.passedData();
        expect(passedData[prop]).toEqual('heoword');
    });

});
