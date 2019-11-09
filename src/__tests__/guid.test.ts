import { Guid } from '../core/math/Guid';

test('Guid generation', () => {
  const first = Guid.newGuid();
  const second = Guid.newGuid();
  expect(first).not.toEqual(second);
});
