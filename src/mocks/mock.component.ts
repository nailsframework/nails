import { CoreComponent } from '../core/components/core.component';
import { State } from '../core/state';

export class MockComponent extends CoreComponent {
  public ins: any = {
    work: 'true',
  };
  constructor(state: State) {
    super(state);
    this.selector = 'mock';
  }

  public render() {
    return '<div><p>mock</p></div>';
  }
}
