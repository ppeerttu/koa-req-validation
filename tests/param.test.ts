import ValidationChain from "../src/lib/ValidationChain";
import { param } from "../src";

describe('param()', () => {

    test('Returns a new ValidationChain', () => {
        const chain = param('prop');
        expect(chain).toBeInstanceOf(ValidationChain);
    });

});