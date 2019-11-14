import { ComponentEngine } from '../core/engine/componentEngine';
import { Nails } from '../nails';
import { State } from '../core/state';
import { CoreComponent } from '../core/components/core.component';
import { Instance } from '../classes/Instance';

class AppComponent extends CoreComponent {
  constructor(state: State) {
    super(state);
    this.selector = 'app';
  }
}
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
    onInit() { },
    // tslint:disable-next-line: no-empty
    onMounted(currentState: State) { },
  },
  components: [AppComponent],
};
const nails = new Nails(nailsConfig);
const element = document.createElement('div');
const componentEngine = new ComponentEngine(nails.state, nails.engine, nails, []);

let id = '';
it('should create fake element', () => {
  expect(componentEngine.generateTempElement('<div></div>')).toBeInstanceOf(Element);
});

it('should identify guid elements', () => {
  expect(componentEngine.elementHasGuidSet(element)).toBe(false);
  id = componentEngine.setInstanceIdOnElement(element, null);
  expect(componentEngine.elementHasGuidSet(element)).toBe(true);
});

it('should render component', () => {
  const fake = componentEngine.generateTempElement('<app />');
  componentEngine.renderElement(fake);
  expect(fake).toBeTruthy();
});

it('should render all', () => {
  const fake = componentEngine.generateTempElement('<app />');
  componentEngine.renderComponents(fake);
  expect(fake).toBeTruthy();
  expect(componentEngine.shallRenderElement(element)).toBe(true);
  const fakeParent = componentEngine.generateTempElement('');
  fakeParent.appendChild(fake);
  componentEngine.renderedElements.push(fakeParent);
});

it('should recreate all', () => {
  expect(componentEngine.recreateAllComponents()).toBeFalsy();
});

it('should recreate by name', () => {
  expect(componentEngine.recreateComponentsByName('app')).toBeFalsy();
});

it('should get instance ', () => {
  expect(componentEngine.getInstanceFromInstanceId(id)).toBeInstanceOf(Instance);
  expect(componentEngine.getInstanceFromInstanceId(id).getComponent()).toBe(null);
  expect(componentEngine.getInstanceOfElementOrNull(element)).toBe(null);
  expect(componentEngine.findComponentInMountedComponentsByTagName('app')).toBeInstanceOf(Object);
});

it('should render n-content', () => {
  expect(componentEngine.renderNContent(element, element)).toBeFalsy();
  expect(componentEngine.traverseElementAndExecuteDirectives(element)).toBeFalsy();
  expect(componentEngine.engine).toBeDefined();
});
