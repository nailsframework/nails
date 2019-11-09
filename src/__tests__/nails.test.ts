import { Nails } from '../nails';
import { State } from '../core/state';
const nailsConfig = {
    el: 'body',
    methods: {
        onInit() { },
        // tslint:disable-next-line: no-empty
        onMounted(currentState: State) { },
    },
};

const nails = new Nails(nailsConfig);


test('mount nails', () => {
    expect(nails).toBeDefined();
    expect(nails.componentEngine).toBeDefined();
    expect(nails.engine).toBeDefined();
    expect(nails.injector).toBeDefined();
})

