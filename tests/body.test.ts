import ValidationChain from "../src/lib/ValidationChain";
import { body } from "../src";

describe('body()', () => {

    test('Returns a new ValidationChain', () => {
        const chain = body('prop');
        expect(chain).toBeInstanceOf(ValidationChain);
    });

});