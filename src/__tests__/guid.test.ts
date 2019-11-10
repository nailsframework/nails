import { Guid } from '../core/math/Guid';

it('should generate a guid', () => {
  const first = Guid.newGuid();
  const second = Guid.newGuid();
  expect(first).not.toEqual(second);
});
