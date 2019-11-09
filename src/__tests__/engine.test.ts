import { Nails } from '../nails';
import { State } from '../core/state';
const nailsConfig = {
    el: 'body',
    data: {
        ipsum: "1",
        dolor: "2",
        sit: "3",
        amet: "4",
    },
    methods: {
        onInit() { },
        // tslint:disable-next-line: no-empty
        onMounted(currentState: State) { },
    },
};

const nails = new Nails(nailsConfig);
const testText = 'lorem {{ipsum}} {{ dolor}} {{sit}} {amet}';
const element = document.createElement('div');
element.innerHTML = testText;
test('Interpolations', () => {
    expect(nails.engine.getInterpolationsForTextContent(testText)).toHaveLength(3);
    // tslint:disable-next-line: max-line-length
    expect(nails.engine.interpolateElement(element, nails.engine.getInterpolationsForTextContent(testText)).innerHTML).toMatch('lorem 1 2 3 {amet}');
});


