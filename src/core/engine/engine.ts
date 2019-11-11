'use strict';
import { ActiveElement } from '../../classes/ActiveElement';
import { NailsDirectives } from '../../directiveDefinitions';
import { State } from '../state';
export class RenderingEngine {
  public state: State;
  public directives: NailsDirectives;

  constructor(state: State) {
    if (typeof state === 'undefined' || state === null) {
      // tslint:disable-next-line:no-console
      console.log('Engine was initialized without a state');
    }
    this.state = state;
    this.directives = new NailsDirectives();
  }

  public notifyDOM(target: any, prop: any, value: string) {
    console.log('state is: ' + this.state);
    const refs = this.state.findElementsByObject(target, prop);
    if (refs === [] || refs.length === 0) {
      return;
    }
    for (const ref of refs) {
      this.updateInterpolatedElement(ref.element, ref.content);
      this.executeDirectivesOnElement(ref.element, false);
    }

    return true;
  }

  public indexDOM() {
    if (typeof this.state.element !== 'undefined') {
      let element = null;
      if (this.state.element.startsWith('#')) {
        const selector = this.state.element.substr(1);
        element = document.getElementById(selector);
      } else {
        element = document.getElementsByTagName(this.state.element);
      }

      if (typeof element === 'undefined' || element === null) {
        console.error('No element with selector: ' + this.state.element + ' has been found');
        return;
      }
      if (element instanceof HTMLCollection && element.length > 1) {
        // tslint:disable-next-line:max-line-length
        console.error(
          'Multiple choices, try using id if the element tag is not unique. Your Selector was: ' + this.state.element,
        );
        return;
      }
      if (element instanceof HTMLCollection && element.length === 0) {
        console.error('No element with selector: ' + this.state.element + ' has been found');
        return;
      }
      if (element instanceof HTMLCollection) {
        element = element[0];
      }

      // From now on, we need to loop through all elements
      const activeElements = this.indexElement(element as HTMLElement);
      // Execute Directives

      // TODO: Manage the activeElements here and not in interpolations
      for (const el of activeElements) {
        this.executeDirectivesOnElement(el, true);
      }
      this.executeInerpolationsOnElement(element as HTMLElement);
    }
  }

  public insert(index: number, str: string, ref: string) {
    if (index > 0) {
      return ref.substring(0, index) + str + ref.substring(index, ref.length);
    }

    return str + ref;
  }

  public setTitle() {
    if (typeof this.state.data.title !== 'undefined' || this.state.data.title === null) {
      document.title = this.state.data.title;
    }
  }

  public elementCanGetAttribute(element: HTMLElement) {
    return 'getAttribute' in element;
  }

  public isNForActivated(element: HTMLElement) {
    if (this.elementCanGetAttribute(element)) {
      return element.getAttribute('n-for') !== null;
    }
    return false;
  }

  public disableInterpolationForVariableNameOnElement(name: string, element: HTMLElement) {
    if (typeof name === 'undefined' || typeof element === 'undefined') {
      return;
    }
    for (const el of this.state.disabledElements) {
      if (el.content === name && el.element === element) {
        return;
      }
    }
    const activeElement = new ActiveElement(element, null, '', name, '', '');
    this.state.disabledElements.push(activeElement);
  }
  public getElementDerrivedObject(element: HTMLElement) {
    return 'object';
  }
  public getElementDerrivedProperty(element: HTMLElement) {
    return 'property';
  }
  public getForArrayByStatement(statement: string) {
    const statements = statement.split(' ');
    return statements[statements.length];
  }
  public isForAttribute(element: ActiveElement) {
    const el = element.element;
    if ('getAttribute' in el) {
      return el.getAttribute('n-for') !== null;
    } else {
      return false;
    }
  }

  public isActiveElement(element: HTMLElement) {
    return this.getElementDirectives(element).length > 0;
  }

  public removePrefix(directive: string) {
    return directive.substring(2);
  }
  public prefixDiretive(directive: string) {
    return 'n-' + directive;
  }
  public getElementDirectives(element: HTMLElement) {
    if (typeof element === 'undefined') {
      return [];
    }
    const directives: string[] = [];
    for (let directive of this.directives.directives) {
      directive = this.prefixDiretive(directive);
      if ('hasAttribute' in element && element.hasAttribute(directive)) {
        directives.push(directive);
      }
    }
    return directives;
  }

  public indexElement(element: HTMLElement) {
    this.state.disableElementIfNeeded(element);
    const activeElements: any[] = [];
    for (const child of element.childNodes) {
      const active = this.indexElement(child as HTMLElement);
      activeElements.push.apply(activeElements, active);
    }
    if (this.isActiveElement(element)) {
      activeElements.push(element);
    }

    return activeElements;
  }

  public getElementAttributeForDirective(element: HTMLElement, directive: string) {
    directive = this.prefixDiretive(directive);
    if (element.hasAttribute(directive)) {
      return element.getAttribute(directive);
    } else {
      console.warn('directive: ' + directive + ' not found on element: ' + element);
      return '';
    }
  }
  public executeDirectivesOnElement(element: HTMLElement, add: boolean) {
    const directives = this.getElementDirectives(element);
    for (let directive of directives) {
      directive = this.removePrefix(directive);
      if (directive in this.directives) {
        // tslint:disable-next-line:no-eval
        eval(
          'this.directives.' +
            directive +
            '(element, this.getElementAttributeForDirective(element, directive), this.state)',
        );
        const nDirectives = this.getElementDirectives(element);
        if (add) {
          for (const dir of nDirectives) {
            this.state.addActiveDirectiveElement(dir, element.getAttribute(dir), element);
          }
        }
      } else {
        console.warn('not found directive: ' + directive);
      }
    }
  }

  public stripAndTrimNForInterpolation(interpolation: string) {
    interpolation = interpolation.replace('[[[', '');
    interpolation = interpolation.replace(']]]', '');
    interpolation = interpolation.trim();
    return interpolation;
  }

  public getNForInterpolations(content: string) {
    // tslint:disable-next-line:prefer-const
    let interpolations: string[];
    content = content.trim();
    const matches = content.match(/\[\[\[(( +)?\w+.?\w+( +)?)\]\]\]/g);
    if (matches === null) {
      return interpolations;
    }
    for (const match of matches) {
      interpolations.push(match);
    }

    return interpolations;
  }
  public getNForInterpolation(interpolation: string) {
    interpolation = interpolation.trim();
    if (interpolation.match(/\[\[\[(( +)?\w+.?\w+( +)?)\]\]\]/g)) {
      interpolation = this.stripAndTrimNForInterpolation(interpolation);
    } else {
      console.warn('Not found interpolation in submitted value: ' + interpolation);
      return interpolation;
    }

    return interpolation;
  }
  public getValueOfInterpolation(interpolation: string) {
    // This comes in the format of {{ interpolation }}
    interpolation = interpolation.trim();
    if (interpolation.match(/{{(.?\s?\w?.?\w\s?)+}}/g)) {
      interpolation = this.stripAndTrimInterpolation(interpolation);
    } else {
      console.warn('Not found interpolation in submitted value: ' + interpolation);
      return interpolation;
    }
    interpolation = interpolation.trim();
    let stripped = this.stripAndTrimInterpolation(interpolation);

    const args = stripped.split('.');
    stripped = '';
    for (const arg of args) {
      stripped += arg + '.';
    }
    stripped = stripped.substring(0, stripped.length - 1);
    if (typeof this.state.data[stripped.split('.')[0]] === 'undefined') {
      // tslint:disable-next-line:max-line-length
      return 'undefined'; // This saves us from from crashing when user tries to user data.key.subkey where data.key is not defined. Also leaves n-for alone
    }
    // tslint:disable-next-line:no-eval
    return eval('this.state.data.' + stripped);
  }

  public removeWhiteSpaceFromString(str: string) {
    return str.replace(/\s/g, '');
  }
  public stripAndTrimInterpolation(interpolation: string) {
    if (typeof interpolation === 'undefined' || typeof interpolation === null) {
      return interpolation;
    }
    interpolation = interpolation.replace('{{', '');
    interpolation = interpolation.replace('}}', '');
    interpolation = interpolation.trim();
    return interpolation;
  }
  public getInterpolationsForTextContent(text: string) {
    const interpolations: string[] = [];
    if (typeof text === 'undefined' || text === null) {
      return interpolations;
    }
    // text may come in this format 'hi, this is {{test}} and this is {{abc}}'
    const matches = text.match(/{{(.?\s?\w?.?\w\s?)+}}/g); // TODO: Regex is not perfect. May start with .
    if (matches === null) {
      return [];
    }
    for (const match of matches) {
      interpolations.push(match);
    }
    return interpolations;
  }
  public getObjectReferenceByInterpolationName(interpolation: string) {
    interpolation = this.stripAndTrimInterpolation(interpolation);
    return this.state.data[interpolation]; // H andle interpolations with . inside
  }

  // tslint:disable-next-line:no-empty
  public interpolateOnTextWithState(text: string, state: State) {}
  public getContentOfNodeIfTextNodeExists(node: Node): string {
    if (node.nodeType === 3) {
      return node.nodeValue;
    }
    if (node.childNodes.length === 0) {
      return null;
    }
    if (this.nodeHasTextNodeAsADirectChild(node as HTMLElement)) {
      for (const child of node.childNodes) {
        if (this.getContentOfNodeIfTextNodeExists(child) !== null) {
          return this.getContentOfNodeIfTextNodeExists(child);
        }
      }
    }
  }

  public setContentOfTextNode(node: Node, value: string) {
    if (node.nodeType !== 3) {
      console.error(
        'setContentOfTextNode... this implies that you *HAVE* to provide nothing else than a textNode as argument.',
      );
      return false;
    }
    node.nodeValue = value;
    return true;
  }
  public updateInterpolatedElement(ref: HTMLElement, originalText: string) {
    this.executeDirectivesOnElement(ref, false);
    const interpolations = this.getInterpolationsForTextContent(originalText);
    if (interpolations.length === 0) {
      return;
    }
    let interpolatedText = originalText;
    for (const interpolation of interpolations) {
      const value = this.getValueOfInterpolation(interpolation);

      if (this.isElementDisabled(this.stripAndTrimInterpolation(interpolation), ref)) {
        continue;
      }

      interpolatedText = interpolatedText.replace(interpolation, value);
    }

    ref.textContent = interpolatedText;
  }
  public isDescendant(parent: HTMLElement, child: HTMLElement) {
    let node = child.parentNode;
    while (node != null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  public isElementDisabled(name: string, element: HTMLElement) {
    for (const disabled of this.state.disabledElements) {
      if (this.isDescendant(element, disabled.element) || this.isDescendant(disabled.element, element)) {
        if (name.includes(disabled.content)) {
          return true;
        } // Edge case, we have a f***ing scope
      }
      if (disabled.content === name && disabled.element === element) {
        return true;
      }
    }
    return false;
  }
  public interpolateElement(element: HTMLElement, interpolations: string[]) {
    for (const interpolation of interpolations) {
      this.state.disableElementIfNeeded(element);
      const value = this.getValueOfInterpolation(interpolation);
      if (this.isElementDisabled(this.stripAndTrimInterpolation(interpolation).trim(), element)) {
        continue;
      }

      let text = element.textContent || element.textContent;
      text = text.replace(interpolation, value);

      if ('textContent' in element) {
        element.textContent = text;
        continue;
      }
    }
    return element;
  }

  public nodeHasTextNodeAsAChild(element: HTMLElement): boolean {
    if (element.nodeType === 3) {
      return true;
    }
    if (element.childNodes.length === 0) {
      return false;
    }
    return this.nodeHasTextNodeAsAChild(element);
  }

  public nodeHasTextNodeAsADirectChild(element: HTMLElement) {
    for (const child of element.childNodes) {
      if (child.nodeType === 3) {
        return true;
      }
    }
    return false;
  }
  public isTextNode(element: Node) {
    return element.nodeType === 3;
  }
  public sanitize(str: string) {
    if (typeof str !== 'string') {
      return str;
    }
    const temp = document.createElement('div');
    temp.textContent = str;
    const san = temp.innerHTML;
    return san;
  }

  public executeInerpolationsOnElement(element: HTMLElement) {
    for (const child of element.childNodes) {
      this.executeInerpolationsOnElement(child as HTMLElement);
    }

    const interpolations = this.getInterpolationsForTextContent(element.nodeValue);

    if (this.isTextNode(element)) {
      // Interpolation should only happen on a text node. Otherwise, DOM may be damaged.

      if (interpolations.length === 0) {
        return; // No interpolations on this element
      }

      if (element.nodeType !== 3) {
        return;
      }

      for (const interpolation of interpolations) {
        this.state.addActiveElement(
          element as HTMLElement,
          this.getObjectReferenceByInterpolationName(interpolation),
          element.nodeValue,
          interpolation,
        );
      }
      this.interpolateElement(element as HTMLElement, interpolations);
    } else {
      // tslint:disable-next-line:max-line-length
      // Special case: Nfor. We do have to add them, but if this else getts extended for some reason, reconsider this.
      if (!this.isNForActivated(element as HTMLElement)) {
        return;
      }

      const el = element as HTMLElement;
      const interpolation = '{{' + el.getAttribute('n-for').split(' ')[3] + '}}';
      this.state.addActiveElement(el, el.getAttribute('n-for').split(' ')[3], null, interpolation);
    }
  }
}
