import { ComponentEngine } from "../core/engine/componentEngine";
import { Nails } from "../nails";
import { State } from "../core/state";

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
};
const nails = new Nails(nailsConfig);
const element = document.createElement('div');
const componentEngine = new ComponentEngine(nails.state, nails.engine, nails, []);


it('should create fake element', () => {
    expect(componentEngine.generateTempElement('<div></div>')).toBeInstanceOf(Element);
});

it('should identify guid elements', () => {
    expect(componentEngine.elementHasGuidSet(element)).toBe(false);
    componentEngine.setInstanceIdOnElement(element, null);
    expect(componentEngine.elementHasGuidSet(element)).toBe(true);
});





