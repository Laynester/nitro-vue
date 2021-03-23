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
            if (newEl.image && newEl.colourCode)
            {
                newEl.setStyle();
            }
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

    public bringToTop(el:HTMLElement): void
    {
        if (!el.getAttribute('draggable')) return;

        if (el.getAttribute('draggable') == false.toString()) return;

        let maxZ = 90;

        this.elements.forEach((e) =>
        {
            if (!e.element.getAttribute('draggable') || e.element.getAttribute('draggable') == false.toString() || e.element.getAttribute('draggable') === null) return;

            console.log(e.element.getAttribute('draggable'));

            if (!e.element.style.zIndex) e.element.style.zIndex = (90).toString();

            if(parseInt(e.element.style.zIndex) >= maxZ) maxZ = parseInt(e.element.style.zIndex) + 1;
        });

        el.style.zIndex = maxZ.toString();
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
            1: [
                'ubuntu-frame.png',
                'ubuntu-frame-header.png'
            ]
        };
    }
}
