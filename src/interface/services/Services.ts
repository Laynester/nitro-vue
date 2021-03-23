import { NavigatorService } from './NavigatorService';
import { SettingService } from './SettingService';

export class Services
{
    private static _instance: Services;

    private _navigatorService: NavigatorService;

    private _settingService: SettingService;

    constructor()
    {
        this._navigatorService = new NavigatorService();
        this._settingService = new SettingService();
    }

    static instance()
    {
        if (!Services._instance) Services._instance = new Services();

        return Services._instance;
    }

    public get navigatorService(): NavigatorService
    {
        return this._navigatorService;
    }

    public get settingService(): SettingService
    {
        return this._settingService;
    }
}
