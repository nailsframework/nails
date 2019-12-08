import { State } from '../core/state';
import { Nails } from '../nails';
import { ComponentEngine } from '../core/engine/componentEngine';
import { MockComponent } from '../mocks/mock.component';

const nailsConfig = {
  el: 'body',
  // tslint:disable-next-line: object-literal-sort-keys
  data: {
    ipsum: '1',
    // tslint:disable-next-line: object-literal-sort-keys
    dolor: '2',
    sit: {
      amet: '3',
    },
    amet: '4',
  },
  methods: {
    // tslint:disable-next-line: no-empty
    onInit() { },
    // tslint:disable-next-line: no-empty
    onMounted(currentState: State) { },
  },
};
const nails = new Nails(nailsConfig);
const testText = 'lorem {{ipsum}} {{ dolor}} {{sit.amet}} {amet}';
const element = document.createElement('div');
const componentEngine = new ComponentEngine(nails.state, nails.engine, nails, []);

element.innerHTML = testText;

it('should interpolate', () => {
  expect(nails.engine.getInterpolationsForTextContent(testText)).toHaveLength(3);
  // tslint:disable-next-line: max-line-length
  expect(
    nails.engine.interpolateElement(element, nails.engine.getInterpolationsForTextContent(testText)).innerHTML,
  ).toMatch('lorem 1 2 3 {amet}');
});

it('should get Attributes', () => {
  element.setAttribute('test', 'worked');
  element.setAttribute('n-if', 'true');
  element.setAttribute('n-click', '');
  element.setAttribute('n-form', 'test');
  element.setAttribute('n-onchange', '');

  const guid = nails.componentEngine.setInstanceIdOnElement(element, new MockComponent(nails.state));
  expect(guid).toBeDefined();
  expect(nails.componentEngine.getElementAttributesByInstanceId(guid)).toBeInstanceOf(NamedNodeMap);
  expect(nails.componentEngine.getElementAttributesByInstanceId(guid).getNamedItem('test').value).toEqual('worked');
  expect(nails.componentEngine.getElementAttributesByInstanceId(null)).toBe(null);
  expect(nails.componentEngine.getElementAttributesByInstanceId(undefined)).toBe(null);
  expect(nails.componentEngine.getElementAttributesByInstanceId('dead-beef')).toBe(null);
});

it('should index DOM', () => {
  expect(nails.engine.indexDOM()).toBeFalsy();
});

it('should execute directives on element ', () => {
  expect(nails.engine.executeDirectivesOnElement(element, true)).toBeFalsy();
  expect(nails.state.activeElements).toHaveLength(0);
});

it('should set attributes', () => {
  expect(componentEngine.getInstanceOfElementOrNull(element)).toBe(null);
  expect(componentEngine.setComponentVariables(element)).toBeFalsy();
});
