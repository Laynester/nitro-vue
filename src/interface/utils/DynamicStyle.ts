import { DynamicStyleContext } from './DynamicStyleContext';

export class DynamicStyle
{
    private static _instance: DynamicStyle;

    private elements: DynamicStyleContext[];

    public images: Map<string, string>;

    public frames: Object;

    constructor()
    {
        this.elements = [];

        this.images = new Map();

        this.genStyles();
    }

    static getInstance()
    {
        if (!DynamicStyle._instance)
        {
            DynamicStyle._instance = new DynamicStyle();
        }

        return DynamicStyle._instance;
    }

    public addElement(el:HTMLElement, bindings:string[]): void
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

    public removeElement(el: HTMLElement):void
    {
        this.elements.filter((e) =>
        {
            return e.element = el;
        });
    }

    public setElements(namespace: string)
    {
        this.elements.forEach((e) =>
        {
            if(e.image && e.colourCode) e.setStyle();
        });
    }

    public genStyles(): void
    {
        this.frames = {
            0: [
                'volter-frame.png',
                'volter-frame-header.png',
                'volter-frame-header-text.png',
            ],
            3: [
                'ubuntu-frame.png',
                'ubuntu-frame-header.png'
            ]
        };
    }
}
