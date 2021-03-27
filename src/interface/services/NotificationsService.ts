import { IMessageEvent } from 'nitro-renderer/src/core/communication/messages/IMessageEvent';
import { ModeratorMessageEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/moderation/ModeratorMessageEvent';
import { HabboBroadcastMessageEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/notifications/HabboBroadcastMessageEvent';
import { HotelWillShutdownEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/notifications/HotelWillShutdownEvent';
import { MOTDNotificationEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/notifications/MOTDNotificationEvent';
import { NotificationDialogMessageEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/notifications/NotificationDialogMessageEvent';
import { Nitro } from 'nitro-renderer/src/nitro/Nitro';
import Vue from 'vue';

export class NotificationsService
{
    private _messages: IMessageEvent[];

    private _states = Vue.observable({
        notificationDialogs: []
     });

    constructor()
    {
        this.registerMessages();
    }

    private registerMessages(): void
    {
        if(this._messages) this.unregisterMessages();

        this._messages = [
            new HabboBroadcastMessageEvent(this.onHabboBroadcastMessageEvent.bind(this)),
            new ModeratorMessageEvent(this.onModeratorMessageEvent.bind(this)),
            new MOTDNotificationEvent(this.onMOTDNotificationEvent.bind(this)),
            new NotificationDialogMessageEvent(this.onNotificationDialogMessageEvent.bind(this)),
            new HotelWillShutdownEvent(this.onHotelWillShutdownEvent.bind(this)),
        ];

        for(const message of this._messages) Nitro.instance.communication.registerMessageEvent(message);

    }

    private unregisterMessages(): void
    {
        for (const message of this._messages) Nitro.instance.communication.removeMessageEvent(message);

        this._messages = [];
    }

    private onHabboBroadcastMessageEvent(event: HabboBroadcastMessageEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        //this._ngZone.run(() => this.alert(parser.message));
    }

    private onNotificationDialogMessageEvent(event: NotificationDialogMessageEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        this.displayNotification(parser.type, parser.parameters);
    }

    private onModeratorMessageEvent(event: ModeratorMessageEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        //this._ngZone.run(() => this.alertWithLink(parser.message, parser.link));
    }

    private onMOTDNotificationEvent(event: MOTDNotificationEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        //this._ngZone.run(() => this.alertWithScrollableMessages(parser.messages));
    }

    private onHotelWillShutdownEvent(event: HotelWillShutdownEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        const message = Nitro.instance.localization.getValueWithParameter('opening.hours.shutdown', 'm', parser.minutes.toString());

        //this._ngZone.run(() => this.alert(message));
    }

    public displayNotification(type: string, parameters: Map<string, string>): NotificationDialogComponent
    {
        this._states.notificationDialogs.push({ type, parameters });
    }


    public get states()
    {
        return this._states;
    }

    public get notificationDiaglogs(): any[]
    {
        return this._states.notificationDialogs;
    }
}
