import { State } from '../core/state';
import { Nails } from '../nails';

const nailsConfig = {
  el: 'body',
  // tslint:disable-next-line: object-literal-sort-keys
  data: {
    ipsum: '1',
    // tslint:disable-next-line: object-literal-sort-keys
    dolor: '2',
    sit: '3',
    amet: '4',
  },
  methods: {
    // tslint:disable-next-line: no-empty
    onInit() {},
    // tslint:disable-next-line: no-empty
    onMounted(currentState: State) {},
  },
};
const nails = new Nails(nailsConfig);
const testText = 'lorem {{ipsum}} {{ dolor}} {{sit}} {amet}';
const element = document.createElement('div');
element.innerHTML = testText;

test('Interpolations', () => {
  expect(nails.engine.getInterpolationsForTextContent(testText)).toHaveLength(3);
  // tslint:disable-next-line: max-line-length
  expect(
    nails.engine.interpolateElement(element, nails.engine.getInterpolationsForTextContent(testText)).innerHTML,
  ).toMatch('lorem 1 2 3 {amet}');
});

test('Get Attributes', () => {
  element.setAttribute('test', 'worked');
  const guid = nails.componentEngine.setInstanceIdOnElement(element, null);
  expect(guid).toBeDefined();
  expect(nails.componentEngine.getElementAttributesByInstanceId(guid)).toBeInstanceOf(NamedNodeMap);
  expect(nails.componentEngine.getElementAttributesByInstanceId(guid).getNamedItem('test').value).toEqual('worked');
  expect(nails.componentEngine.getElementAttributesByInstanceId(null)).toBe(null);
  expect(nails.componentEngine.getElementAttributesByInstanceId(undefined)).toBe(null);
  expect(nails.componentEngine.getElementAttributesByInstanceId('dead-beef')).toBe(null);
});
