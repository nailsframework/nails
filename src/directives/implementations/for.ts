import { Context } from '../../core/context/context';
import { ComponentEngine } from '../../core/engine/componentEngine';
import { RenderingEngine } from '../../core/engine/engine';
import { Guid } from '../../core/math/Guid';
import { State } from '../../core/state';

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
        this.statement = statement;
        this.state = state;
        this.engine = new RenderingEngine(this.state);
        this.componentEngine = new ComponentEngine(state, this.engine, null, []);
        this.context = new Context(this.state, this.componentEngine.getInstanceOfElementOrNull(element));
        this.reference = this.context.resolveContextOrUndefined(this.statement.split(' ')[3]);

        this.element = element;
    }

    public run() {
        this.engine.disableInterpolationForVariableNameOnElement(this.statement.split(' ')[1], this.element);

        const parent = this.element.parentElement;
        if (!parent) {
            throw new Error('Element ' + parent + ' has no parent');
        }
        if (!this.reference) {
            this.reference = this.context.resolveOrUndefined(this.statement.split(' ')[3]);
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
        this.cleanUp();

        this.interpolate(this.element, this.reference);
        this.hideElement(this.element);
        this.handleSelect(this.element.parentElement);
    }

    private addToList(element: HTMLElement) {
        const guid = Guid.newGuid();
        element.setAttribute('nails-generated-element', guid);
        if (this.lastElement === null) {
            this.engine.insertAfter(element, this.element);
            this.lastElement = element;
        } else {
            this.engine.insertAfter(element, this.lastElement);
            this.lastElement = element;
        }
    }
    private handleSelect(element: HTMLElement) {
        if (element instanceof HTMLSelectElement) {
            element.selectedIndex = 1;
        }
    }
    private cleanUp() {
        const elements: Element[] = [...this.element.parentElement.children];
        const parent: HTMLElement = this.element.parentElement;
        const removal: Element[] = [];
        for (const element of elements) {
            if (element.hasAttribute('nails-generated-element')) {
                removal.push(element);
            }
        }

        for (const element of removal) {
            parent.removeChild(element);
        }
    }
    private hideElement(e: HTMLElement) {
        e.hidden = true;
        e.setAttribute('disabled', '');
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

    private removeFirstPathFragmentFromString(str: string): string {
        const arr = str.split('.');
        if (arr.length > 1) {
            arr.shift();
        }
        return arr.join();
    }

    private copyAttributes(source: HTMLElement, destination: HTMLElement) {
        for (const attribute of source.attributes) {
            destination.setAttribute(attribute.name, attribute.value);
        }
    }

    private getInterpolatedText(text: string, idx: any, interpolations: string[]): string {
        for (const interpolation of interpolations) {
            const stripped = this.engine.stripAndTrimInterpolation(interpolation);
            // tslint:disable-next-line:max-line-length
            const customResolve = this.context.resolveOrUndefinedCustomObject(
                this.removeFirstPathFragmentFromString(stripped),
                idx,
            );
            const resolve = this.context.resolveContextOrUndefined(stripped);
            if (customResolve) {
                text = this.replaceAll(interpolation, customResolve, text);
            } else if (this.statement.split(' ')[1] === stripped) {
                // One dimensional, in this case we just send an empty string as path.
                const oneDimensionalResolve = this.context.resolveOrUndefinedCustomObject('', idx);
                if (oneDimensionalResolve) {
                    // tslint:disable-next-line:max-line-length
                    text = this.replaceAll(interpolation, oneDimensionalResolve, text);
                } else {
                    // This happens when the object supplied is undefined. We will alert the user with a stacktrace.
                    throw new Error('Resolved onedimensional element is undefined.');
                }
            } else if (resolve) {
                text = this.replaceAll(interpolation, resolve, text);
            } else {
                console.warn('Failed to resolve ' + interpolation + ' on n-for');
            }
        }

        return text;
    }
    private executeDirectivesOnElement(element: Element) {
        for (const child of element.children) {
            this.executeDirectivesOnElement(child);
        }

        this.engine.executeDirectivesOnElement(element as HTMLElement, true);
    }
    private interpolate(el: HTMLElement, ref: []) {
        const interpolations = this.engine.getInterpolationsForTextContent(el.outerHTML);
        for (const idx of ref) {
            const forElement = document.createElement(el.tagName);
            this.addContentsOfElementToAnother(el.cloneNode(true), forElement);
            this.copyAttributes(el, forElement);

            this.removeStatementFromElement(forElement);
            forElement.innerHTML = this.getInterpolatedText(forElement.innerHTML, idx, interpolations);
            for (const attribute of forElement.attributes) {
                const value = this.getInterpolatedText(attribute.value, idx, interpolations);
                forElement.setAttribute(attribute.name, value);
            }
            forElement.removeAttribute('hidden');
            this.addToList(forElement);
            this.engine.executeInterpolationsOnElement(forElement);
            this.executeDirectivesOnElement(forElement);
        }
    }
}
