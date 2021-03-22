import { DynamicStyleContext } from './DynamicStyleContext';

export class DynamicStyle
{
    private static _instance: DynamicStyle;

    private elements: DynamicStyleContext[];

    public images: Map<string, string>;

    constructor()
    {
        this.elements = [];

        this.images = new Map();
    }

    static getInstance()
    {
        if (!DynamicStyle._instance)
        {
            DynamicStyle._instance = new DynamicStyle();
        }

        return DynamicStyle._instance;
    }

    public addElement(el:HTMLElement, bindings:[]): void
    {
        const newEl = new DynamicStyleContext(el, bindings);

        if (this.images.has(newEl.namespace))
        {
            if(newEl.image && newEl.colourCode) this.setElements(newEl.namespace);
        }
        else
        {
            if(newEl.image && newEl.colourCode) newEl.createImage();
        }

        this.elements.push(newEl);
    }

    public setElements(namespace: string)
    {
        this.elements.forEach((e) =>
        {
            if(e.image && e.colourCode) e.setStyle();
        });
    }
}
