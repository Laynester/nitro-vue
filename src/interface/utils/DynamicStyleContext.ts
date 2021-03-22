import { DynamicStyle } from './DynamicStyle';

export class DynamicStyleContext
{
    private classList: string[];

    public image: string;

    public colourCode: string;

    private opacity: number = 0;

    private RGB: { r, g, b };

    private element: HTMLElement;

    private imageEl: HTMLImageElement;

    private canvasEl: HTMLCanvasElement;

    constructor(el: HTMLElement, bindings: string[])
    {
        this.element = el;

        this.splitBindings(bindings);

        this.setClasses();
    }

    private splitBindings(bindings:string[]): void
    {
        this.classList = bindings[0].split('|');

        this.image = bindings[1];

        this.colourCode = bindings[2];

        this.opacity = parseInt(bindings[3]);

        if (!this.image || !this.colourCode) return;

        this.generateColours();
    }

    private setClasses(): void
    {
        this.element.classList.add('nitro-' + this.classList[0]);

        this.element.setAttribute('data-style', this.classList[1]);
    }

    public setStyle(): void
    {
        const bg = `url(${DynamicStyle.getInstance().images.get(this.namespace)})`;
        if(!this.classList[0].includes('header-bg')) this.element.style.borderImageSource = bg;
        if(this.classList[0] !== "border") this.element.style.backgroundImage = bg;
    }

    public generateColours(): void
    {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

        this.colourCode = this.colourCode.replace(shorthandRegex, function (m, r, g, b)
        {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.colourCode);

        this.RGB = result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    public createImage(): void
    {
        if (!this.imageEl) this.imageEl = document.createElement("img");

        DynamicStyle.getInstance().images.set(this.namespace,'');

        document.body.append(this.imageEl);

        this.imageEl.setAttribute('src', '/assets/images/' + this.image);

        this.imageEl.addEventListener('load',this.onload.bind(this));
    }

    public onload(event:any): void
    {
        if (!this.canvasEl) this.canvasEl = document.createElement("canvas");

        document.body.append(this.canvasEl);

        this.canvasEl.width = this.imageEl.width;

        this.canvasEl.height = this.imageEl.height;

        this.canvasEl.getContext('2d').drawImage(this.imageEl, 0, 0);

        const data = this.canvasEl.getContext('2d').getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);

        for (let i = 0; i < data.data.length; i += 4)
        {
            if (!(data.data[i] == 0 && data.data[i + 1] == 0 && data.data[i + 2] == 0))
            {
                data.data[i] =  this.RGB.r - (data.data[i] < 255 ? (200 - data.data[i]) : 0);
                data.data[i + 1] = this.RGB.g - (data.data[i + 1] < 255 ? (200 - data.data[i + 1]) : 0);
                data.data[i + 2] = this.RGB.b - (data.data[i + 2] < 255 ? (200 - data.data[i + 2]) : 0);
                if (data.data[i + 3] && this.opacity) data.data[i + 3] = this.opacity;
            } else if (data.data[i + 3] && this.opacity) data.data[i + 3] = (255 - this.opacity);
        }

        this.canvasEl.getContext('2d').putImageData(data, 0, 0);

        DynamicStyle.getInstance().images.set(this.namespace,this.canvasEl.getContext('2d').canvas.toDataURL());

        DynamicStyle.getInstance().setElements(this.namespace);

        this.dispose();
    }

    public dispose(): void
    {
        this.imageEl.remove();

        this.imageEl = null;

        this.canvasEl.remove();

        this.canvasEl = null;
    }

    public get namespace(): string
    {
        return `${this.classList[0]}-${this.classList[1]}-${this.colourCode}`;
    }

    public get hasCustomRender(): boolean
    {
        return !(!this.image && !this.colourCode);
    }
}
