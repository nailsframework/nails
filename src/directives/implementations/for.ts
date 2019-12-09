import { Context } from '../../core/context/context';
import { ComponentEngine } from '../../core/engine/componentEngine';
import { RenderingEngine } from '../../core/engine/engine';
import { State } from '../../core/state';
import { Guid } from '../../core/math/Guid';

export class ForImplementation {
    private engine: RenderingEngine;
    private componentEngine: ComponentEngine;
    private context: Context;
    private reference: any;
    private element: HTMLElement;
    private statement: string;
    private state: State;
    private lastElement: HTMLElement = null;

    constructor(state: State, element: HTMLElement, statement: string) {
        this.state = state;
        this.engine = new RenderingEngine(this.state);
        this.componentEngine = new ComponentEngine(state, this.engine, null, []);
        this.context = new Context(state, this.componentEngine.getInstanceOfElementOrNull(element));
        this.reference = this.context.resolveOrUndefined(statement.split(' ')[3]);
        this.element = element;
        this.statement = statement;
    }

    public run() {
        this.element.style.display = 'none';
        this.engine.disableInterpolationForVariableNameOnElement(this.statement.split(' ')[1], this.element);

        const parent = this.element.parentElement;
        if (!parent) {
            throw new Error('Element ' + parent + ' has no parent');
        }
        if (!this.reference) {
            try {
                if (Array.isArray(JSON.parse(this.statement.split(' ')[3]))) {
                    this.reference = JSON.parse(this.statement.split(' ')[3]);
                }
            } catch (error) {
                throw new Error('Statement ' + this.statement + ' could not be translated into an object');
            }
        }

        this.interpolate(this.element, this.reference);
        this.hideElement(this.element);
        this.handleSelect(this.element.parentElement);

        // Weird browsers don't draw the added options when in a select tag in certain conditions.
    }

    private ensureSafeToAccess(element: HTMLElement): boolean {
        return element.parentElement !== null;
    }
    private addToList(element: HTMLElement) {
        const guid = Guid.newGuid();
        element.setAttribute('nails-generated-element', guid);
        if (this.lastElement === null) {
            this.engine.insertAfter(element, this.element);
            this.lastElement = element;
        }
        else {
            this.engine.insertAfter(element, this.lastElement);
            this.lastElement = element;
        }
    }
    private handleSelect(element: HTMLElement) {
        console.warn(element);
        if (this.ensureSafeToAccess(element) && element.parentElement instanceof HTMLSelectElement) {
            console.warn('success')
            console.warn(element)
            element.parentElement.add(element as HTMLOptionElement);
        }
    }
    private cleanUp() {
        const elements: HTMLCollection = this.element.parentElement.children;
        const parent: HTMLElement = this.element.parentElement;
        for (const element of elements) {
            if (element.hasAttribute('nails-generated-element')) {
                parent.removeChild(element);
            }
        }

    }
    private hideElement(e: HTMLElement) {
        e.hidden = true;
    }
    private replaceAll(search: string, replacement: string, target: string) {
        return target.replace(new RegExp(search, 'g'), replacement);
    }

    private removeStatementFromElement(element: HTMLElement) {
        if (element.hasAttribute('n-for')) {
            if (element.getAttribute('n-for') === this.statement) {
                element.removeAttribute('n-for');
            }
        }
    }

    private addContentsOfElementToAnother(source: Node, destination: Element) {
        while (source.childNodes.length > 0) {
            destination.appendChild(source.firstChild);
        }
    }

    private interpolate(el: HTMLElement, ref: []) {
        const interpolations = this.engine.getInterpolationsForTextContent(el.innerHTML);
        for (const idx of ref) {
            const forElement = document.createElement(el.tagName);
            this.addContentsOfElementToAnother(el.cloneNode(true), forElement);

            this.removeStatementFromElement(forElement);
            const resolved = this.context.resolveOrUndefinedCustomObject(this.statement.split(' ')[1], idx);
            if (!resolved) {
                throw new Error('Could not resolve Object for element ' + el + ' at index ' + idx);
            }
            for (const str of interpolations) {
                if (this.engine.stripAndTrimInterpolation(str) === this.statement.split(' ')[1]) {
                    const replacedHTML = this.replaceAll(str, idx, forElement.innerHTML);
                    forElement.innerHTML = replacedHTML;
                }
            }
            this.addToList(forElement);
            this.engine.executeInterpolationsOnElement(forElement);
            this.engine.executeDirectivesOnElement(forElement, true);
        }
    }
}
