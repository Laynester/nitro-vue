import { NavigatorService } from './NavigatorService';

export class Services
{
    private static _instance: Services;

    private _navigatorService: NavigatorService;

    constructor()
    {
        this._navigatorService = new NavigatorService();
    }

    static getInstance()
    {
        if (!Services._instance)
        {
            Services._instance = new Services();
        }
        return Services._instance;
    }

    public get navigatorService(): NavigatorService
    {
        return this._navigatorService;
    }
}
