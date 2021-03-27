import { DynamicStyleContext } from './DynamicStyleContext';

export class DynamicStyle
{
    private static _instance: DynamicStyle;

    private elements: DynamicStyleContext[];

    public images: Map<string, string>;

    public frames: Object;

    private lastBroughtToTop: HTMLElement;

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
        const els = document.querySelectorAll("div.nitro-frame[draggable=true]");

        let maxZ = 0;

		els.forEach((ele: HTMLElement) => {
			if (window.getComputedStyle) {
				let z = ele.style.zIndex;

				if (!z || z === undefined || z === null) {
					z = document.defaultView
						.getComputedStyle(el, null)
						.getPropertyValue("z-index");
					ele.style.zIndex = z;
				}

				if (parseInt(z) > maxZ) maxZ = parseInt(z);
			}
		});

		if (maxZ) {
            if (this.lastBroughtToTop && this.lastBroughtToTop == el) return;

			maxZ += 1;

            this.lastBroughtToTop = el;

			el.style.zIndex = maxZ.toString();
        }

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
