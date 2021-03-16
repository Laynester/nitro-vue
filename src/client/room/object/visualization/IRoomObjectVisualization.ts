import { Rectangle, RenderTexture, Texture } from 'pixi.js';
import { IRoomGeometry } from '../../utils/IRoomGeometry';
import { IRoomObject } from '../IRoomObject';
import { IObjectVisualizationData } from './IRoomObjectVisualizationData';

export interface IRoomObjectVisualization
{
    initialize(data: IObjectVisualizationData): boolean;
    dispose(): void;
    update(geometry: IRoomGeometry, time: number, update: boolean, skipUpdate: boolean): void;
    getBoundingRectangle(): Rectangle;
    getImage(bgColor: number, originalId: number): RenderTexture;
    instanceId: number;
    object: IRoomObject;
    image: Texture;
    updateSpriteCounter: number;
}