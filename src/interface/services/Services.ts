import { NavigatorService } from './NavigatorService';
import { NotificationsService } from './NotificationsService';
import { SettingService } from './SettingService';

export class Services
{
    private static _instance: Services;

    private _navigatorService: NavigatorService;

    private _settingService: SettingService;

    private _notificationService: NotificationsService;

    constructor()
    {
        this._navigatorService = new NavigatorService();
        this._settingService = new SettingService();
        this._notificationService = new NotificationsService();
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

    public get notificationsService(): NotificationsService
    {
        return this._notificationService;
    }
}
