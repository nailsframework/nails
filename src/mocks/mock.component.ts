import { CoreComponent } from "../core/components/core.component";
import { State } from "../core/state";

export class MockComponent extends CoreComponent {
    constructor(state: State) {
        super(state);
        this.selector = "mock";
    }

    render() {
        return '<div><p>mock</p></div>'
    }
}