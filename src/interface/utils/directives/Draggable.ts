import Vue from 'vue';
import { Services } from '../../services/Services';

export default Vue.directive('Draggable', function (element, binding)
{
    let name = "draggable";

    element.classList.forEach(e =>
    {
        name +=  "-" + e;
    });
    const bind = binding.value;
    const center = (bind.center == undefined || bind.center == null ? false : bind.center);
    const noMemory = (bind.noMemory == undefined || bind.noMemory == null ? false : bind.noMemory);

    if (center)
    {
        element.style.top = `calc(50vh - ${ (element.offsetHeight / 2) }px)`;
        element.style.left = `calc(50vw - ${ (element.offsetWidth / 2) }px)`;
    }

    if (!bind.handle) return;

    const handle: HTMLElement = bind.handle;

    const start = {
        x: 0,
        y:0,
    };

    const offset = {
        x: 0,
        y:0,
    };

    const delta = {
        x: 0,
        y:0,
    };

    const translate = () =>
    {
        if(delta.x === 0 && delta.y === 0) return;
        element.style.transform = `translate(${delta.x}px, ${ delta.y}px)`;
    };

    const memory = Services.instance().settingService.POS_MEMORY.get(name);

    console.log(memory);

    if(memory)
    {
        console.log(memory);
        offset.x  = memory.offset.x;
        offset.y  = memory.offset.y;
        delta.x   = memory.delta.x;
        delta.y   = memory.delta.y;

        translate();
    }

    handle.addEventListener('mousedown', (e) =>
    {
        start.x = e.clientX - offset.x;
        start.y = e.clientY - offset.y;
        document.addEventListener('mousemove',ondrag);
    });

    const ondrag = (e) =>
    {
        e.preventDefault();
        delta.x = e.clientX - start.x;
        delta.y = e.clientY - start.y;

        offset.x = delta.x;

        offset.y = delta.y;
        translate();
    };

    document.addEventListener('mouseup', (e) =>
    {
        offset.x = delta.x;
        offset.y = delta.y;
        document.removeEventListener('mousemove', ondrag);
        if (!noMemory)
        {
            console.log(Services.instance().settingService.POS_MEMORY);
            Services.instance().settingService.POS_MEMORY.set(name, {
                offset: {
                    x: offset.x,
                    y: offset.y
                },
                delta: {
                    x: delta.x,
                    y: delta.y
                }
            });
        }
    });
});
