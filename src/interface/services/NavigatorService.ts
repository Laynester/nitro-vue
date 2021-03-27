import { IMessageEvent } from 'nitro-renderer/src/core/communication/messages/IMessageEvent';
import { ILinkEventTracker } from 'nitro-renderer/src/core/events/ILinkEventTracker';
import { GenericErrorEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/generic/GenericErrorEvent';
import { NavigatorCategoriesEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorCategoriesEvent';
import { NavigatorCollapsedEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorCollapsedEvent';
import { NavigatorEventCategoriesEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorEventCategoriesEvent';
import { NavigatorHomeRoomEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorHomeRoomEvent';
import { NavigatorLiftedEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorLiftedEvent';
import { NavigatorMetadataEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorMetadataEvent';
import { NavigatorOpenRoomCreatorEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorOpenRoomCreatorEvent';
import { NavigatorSearchesEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorSearchesEvent';
import { NavigatorSearchEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorSearchEvent';
import { NavigatorSettingsEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/navigator/NavigatorSettingsEvent';
import { RoomDoorbellAcceptedEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/access/doorbell/RoomDoorbellAcceptedEvent';
import { RoomDoorbellEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/access/doorbell/RoomDoorbellEvent';
import { RoomDoorbellRejectedEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/access/doorbell/RoomDoorbellRejectedEvent';
import { RoomEnterErrorEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/access/RoomEnterErrorEvent';
import { RoomForwardEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/access/RoomForwardEvent';
import { RoomInfoEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/data/RoomInfoEvent';
import { RoomInfoOwnerEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/data/RoomInfoOwnerEvent';
import { RoomScoreEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/data/RoomScoreEvent';
import { RoomSettingsUpdatedEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/data/RoomSettingsUpdatedEvent';
import { RoomCreatedEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/room/engine/RoomCreatedEvent';
import { UserInfoEvent } from 'nitro-renderer/src/nitro/communication/messages/incoming/user/data/UserInfoEvent';
import { DesktopViewComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/desktop/DesktopViewComposer';
import { ConvertGlobalRoomIdMessageComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/navigator/ConvertGlobalRoomIdComposer';
import { NavigatorCategoriesComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/navigator/NavigatorCategoriesComposer';
import { NavigatorInitComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/navigator/NavigatorInitComposer';
import { NavigatorSearchComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/navigator/NavigatorSearchComposer';
import { NavigatorSettingsComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/navigator/NavigatorSettingsComposer';
import { RoomInfoComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/room/data/RoomInfoComposer';
import { NavigatorTopLevelContext } from 'nitro-renderer/src/nitro/communication/messages/parser/navigator/utils/NavigatorTopLevelContext';
import { RoomEnterErrorParser } from 'nitro-renderer/src/nitro/communication/messages/parser/room/access/RoomEnterErrorParser';
import { RoomDataParser } from 'nitro-renderer/src/nitro/communication/messages/parser/room/data/RoomDataParser';
import { ToolbarIconEnum } from 'nitro-renderer/src/nitro/enums/ToolbarIconEnum';
import { NitroToolbarEvent } from 'nitro-renderer/src/nitro/events/NitroToolbarEvent';
import { LegacyExternalInterface } from 'nitro-renderer/src/nitro/externalInterface/LegacyExternalInterface';
import { Nitro } from 'nitro-renderer/src/nitro/Nitro';
import { RoomSessionEvent } from 'nitro-renderer/src/nitro/session/events/RoomSessionEvent';
import { HabboWebTools } from 'nitro-renderer/src/nitro/utils/HabboWebTools';
import Vue from 'vue';
import { NavigatorData } from '../components/navigator/common/NavigatorData';
import { Services } from './Services';

export class NavigatorService implements ILinkEventTracker
{
    private static MAX_VISITOR_STEPPER: number = 10;
    private static MAX_VISITOR_INCREMENTOR: number = 5;

    public static SEARCH_FILTERS: any = [
        {
            name: 'anything',
            query: null
        },
        {
            name: 'room.name',
            query: 'roomname'
        },
        {
            name: 'owner',
            query: 'owner'
        },
        {
            name: 'tag',
            query: 'tag'
        },
        {
            name: 'group',
            query: 'group'
        }
    ];


    private _messages: IMessageEvent[] = [];

    private _states:any = Vue.observable({
        counter: 0,
        topLevelContexts: [],
        topLevelContext: [],
        categories: [],
        filter: null,
        lastSearchResults: [],
        lastSearch: '',
        data: null,
        tradeSettings: [],
        homeRoomId: -1,
        isSearching: false,
        isLoaded: false,
        isLoading: false,
        roomCreator: false,
    });

    constructor()
    {
        this._states.filter = NavigatorService.SEARCH_FILTERS[0];

        this._states.data = new NavigatorData();

        this.onRoomSessionEvent = this.onRoomSessionEvent.bind(this);

        this.setTradeSettings();

        this.registerMessages();

        Nitro.instance.addLinkEventTracker(this);

        if(LegacyExternalInterface.available)
        {
            LegacyExternalInterface.addCallback(HabboWebTools.OPENROOM, this.enterRoomWebRequest);
        }

    }

    private registerMessages(): void
    {
        Nitro.instance.roomSessionManager.events.addEventListener(RoomSessionEvent.CREATED, this.onRoomSessionEvent);

            this._messages = [
                new UserInfoEvent(this.onUserInfoEvent.bind(this)),
                new RoomForwardEvent(this.onRoomForwardEvent.bind(this)),
                new RoomInfoOwnerEvent(this.onRoomInfoOwnerEvent.bind(this)),
                new RoomInfoEvent(this.onRoomInfoEvent.bind(this)),
                new RoomEnterErrorEvent(this.onRoomEnterErrorEvent.bind(this)),
                new RoomCreatedEvent(this.onRoomCreatedEvent.bind(this)),
                new RoomDoorbellEvent(this.onRoomDoorbellEvent.bind(this)),
                new RoomDoorbellAcceptedEvent(this.onRoomDoorbellAcceptedEvent.bind(this)),
                new RoomScoreEvent(this.onRoomScoreEvent.bind(this)),
                new RoomSettingsUpdatedEvent(this.onRoomSettingsUpdatedEvent.bind(this)),
                new GenericErrorEvent(this.onGenericErrorEvent.bind(this)),
                new RoomDoorbellRejectedEvent(this.onRoomDoorbellRejectedEvent.bind(this)),
                new NavigatorCategoriesEvent(this.onNavigatorCategoriesEvent.bind(this)),
                new NavigatorCollapsedEvent(this.onNavigatorCollapsedEvent.bind(this)),
                new NavigatorEventCategoriesEvent(this.onNavigatorEventCategoriesEvent.bind(this)),
                new NavigatorLiftedEvent(this.onNavigatorLiftedEvent.bind(this)),
                new NavigatorMetadataEvent(this.onNavigatorMetadataEvent.bind(this)),
                new NavigatorOpenRoomCreatorEvent(this.onNavigatorOpenRoomCreatorEvent.bind(this)),
                new NavigatorSearchesEvent(this.onNavigatorSearchesEvent.bind(this)),
                new NavigatorSearchEvent(this.onNavigatorSearchEvent.bind(this)),
                new NavigatorSettingsEvent(this.onNavigatorSettingsEvent.bind(this)),
                new NavigatorHomeRoomEvent(this.onNavigatorHomeRoomEvent.bind(this)),

            ];

            for(const message of this._messages) Nitro.instance.communication.registerMessageEvent(message);
    }

    private onRoomSessionEvent(event: RoomSessionEvent): void
    {
        if(!event) return;

        switch(event.type)
        {
            case RoomSessionEvent.CREATED:
                Services.instance().settingService.hideNavigator();
                return;
        }
    }


    private onUserInfoEvent(event: UserInfoEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        Nitro.instance.communication.connection.send(new NavigatorCategoriesComposer());
        Nitro.instance.communication.connection.send(new NavigatorSettingsComposer());
    }

    private onRoomForwardEvent(event: RoomForwardEvent): void
    {
        if(!(event instanceof RoomForwardEvent)) return;

        const parser = event.getParser();

        if(!parser) return;

        Nitro.instance.communication.connection.send(new RoomInfoComposer(parser.roomId, false, true));
    }

    private onRoomInfoOwnerEvent(event: RoomInfoOwnerEvent): void
    {
        if(!(event instanceof RoomInfoOwnerEvent)) return;

        const parser = event.getParser();

        if (!parser) return;

        this._states.data.currentRoomOwner = false;
        this._states.data.currentRoomOwner = parser.isOwner;
        this._states.data.currentRoomId = parser.roomId;

        Nitro.instance.communication.connection.send(new RoomInfoComposer(parser.roomId, true, false));

        LegacyExternalInterface.call('legacyTrack', 'navigator', 'private', [ parser.roomId ]);
    }

    private onRoomInfoEvent(event: RoomInfoEvent): void
    {
        if(!(event instanceof RoomInfoEvent)) return;

        const parser = event.getParser();

        if(!parser) return;

        if(parser.roomEnter)
            {
                this._states.data.enteredGuestRoom = parser.data;
                this._states.data.staffPick        = parser.data.roomPicker;

                const isCreatedRoom = (this._states.data.createdRoomId === parser.data.roomId);

                if(!isCreatedRoom && parser.data.displayRoomEntryAd)
                {
                    // display ad
                }

                this._states.data.createdRoomId = 0;
            }
            else
            {
                if(parser.roomForward)
                {
                    if((parser.data.ownerName !== Nitro.instance.sessionDataManager.userName) && !parser.isGroupMember)
                    {
                        switch(parser.data.doorMode)
                        {
                            case RoomDataParser.DOORBELL_STATE:
                                //this.openRoomDoorbell(parser.data);
                                return;
                            case RoomDataParser.PASSWORD_STATE:
                                //this.openRoomPassword(parser.data);
                                return;
                        }
                    }

                    this.goToRoom(parser.data.roomId);
                }
                else
                {
                    this._states.data.enteredGuestRoom = parser.data;
                    this._states.data.staffPick        = parser.data.roomPicker;
                }
            }
    }

    private onRoomEnterErrorEvent(event: RoomEnterErrorEvent): void
    {
        if(!(event instanceof RoomEnterErrorEvent)) return;

        const parser = event.getParser();

        if(!parser) return;

        switch(parser.reason)
            {
                case RoomEnterErrorParser.FULL_ERROR:
                    //this._notificationService.alert('${navigator.guestroomfull.text}', '${navigator.guestroomfull.title}');
                    break;
                case RoomEnterErrorParser.QUEUE_ERROR:
                    //this._notificationService.alert('${room.queue.error. ' + parser.parameter + '}', '${room.queue.error.title}');
                    break;
                case RoomEnterErrorParser.BANNED:
                    //this._notificationService.alert('${navigator.banned.text}', '${navigator.banned.title}');
                    break;
                default:
                    //this._notificationService.alert('${room.queue.error.title}', '${room.queue.error.title}');
                    break;
            }

        Nitro.instance.communication.connection.send(new DesktopViewComposer());

        const toolbarEvent = new NitroToolbarEvent(NitroToolbarEvent.TOOLBAR_CLICK);

        toolbarEvent.iconName = ToolbarIconEnum.HOTEL_VIEW;

        Nitro.instance.roomEngine.events.dispatchEvent(toolbarEvent);
    }

    private onRoomCreatedEvent(event: RoomCreatedEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        this._states.data.createdRoomId    = parser.roomId;
            this._states.roomInfoShowing       = false;

        this.goToRoom(parser.roomId);
    }

    private onRoomDoorbellEvent(event: RoomDoorbellEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        if(!parser.userName || (parser.userName.length === 0))
        {
            //this._ngZone.run(() => (this._component && this._component.openRoomDoorbell(null, true)));
        }
    }

    private onRoomDoorbellAcceptedEvent(event: RoomDoorbellAcceptedEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        if(!parser.userName || (parser.userName.length === 0))
        {
            //this._ngZone.run(() => (this._component && this._component.closeRoomDoorbell()));
        }
    }

    private onRoomScoreEvent(event: RoomScoreEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        this._states.data.canRate = parser.canLike;
    }

    private onRoomSettingsUpdatedEvent(event: RoomSettingsUpdatedEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        Nitro.instance.communication.connection.send(new RoomInfoComposer(parser.roomId, false, false));
    }

    private onGenericErrorEvent(event: GenericErrorEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        switch(parser.errorCode)
        {
            case -100002:
                //this._ngZone.run(() => (this._component && this._component.openRoomPassword(null, true)));
                break;
            case 4009:
               // this._notificationService.alert('${navigator.alert.need.to.be.vip}', '${generic.alert.title}');
                break;
            case 4010:
                //this._notificationService.alert('${navigator.alert.invalid_room_name}', '${generic.alert.title}');
                break;
            case 4011:
                //this._notificationService.alert('${navigator.alert.cannot_perm_ban}', '${generic.alert.title}');
                break;
            case 4013:
                //this._notificationService.alert('${navigator.alert.room_in_maintenance}', '${generic.alert.title}');
                break;
        }
    }

    private onRoomDoorbellRejectedEvent(event: RoomDoorbellRejectedEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        if(!parser.userName || (parser.userName.length === 0))
        {
            //this._ngZone.run(() => (this._component && this._component.openRoomDoorbell(null, false, true)));
        }
    }

    private onNavigatorCategoriesEvent(event: NavigatorCategoriesEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        this._states.categories = parser.categories;
    }

    private onNavigatorCollapsedEvent(event: NavigatorCollapsedEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;
    }

    private onNavigatorEventCategoriesEvent(event: NavigatorEventCategoriesEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;
    }

    private onNavigatorLiftedEvent(event: NavigatorLiftedEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;
    }

    private onNavigatorMetadataEvent(event: NavigatorMetadataEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        this._states.topLevelContexts = parser.topLevelContexts;

            if(this._states.topLevelContexts.length > 0) this.setCurrentContext(this._states.topLevelContexts[0]);

            this.clearSearch();
    }

    private onNavigatorOpenRoomCreatorEvent(event: NavigatorOpenRoomCreatorEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        //if(!this._component) return;

        //this._component.openRoomCreator()
    }

    private onNavigatorSearchEvent(event: NavigatorSearchEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        const resultSet = parser.result;

        if(!resultSet) return;

        this.setCurrentContextByCode(resultSet.code);

            this._states.lastSearchResults = resultSet.results;
            this._states.isSearching       = false;
    }

    private onNavigatorSearchesEvent(event: NavigatorSearchesEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;
    }

    private onNavigatorSettingsEvent(event: NavigatorSettingsEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;
    }

    private onNavigatorHomeRoomEvent(event: NavigatorHomeRoomEvent): void
    {
        if(!event) return;

        const parser = event.getParser();

        if(!parser) return;

        this._states.homeRoomId = parser.homeRoomId;
    }

    public getMaxVisitors(count: number): number[]
    {
        const maxVisitors = [];

        let i = NavigatorService.MAX_VISITOR_STEPPER;

        while(i <= count)
        {
            maxVisitors.push(i);

            i += NavigatorService.MAX_VISITOR_INCREMENTOR;
        }

        return maxVisitors;
    }


    public goToRoom(roomId: number, password: string = null): void
    {
        Nitro.instance.roomSessionManager.createSession(roomId, password);
    }

    public goToPrivateRoom(roomId: number): void
    {
        Nitro.instance.communication.connection.send(new RoomInfoComposer(roomId, false, true));
    }

    private setTradeSettings(): void
    {
        this._states.tradeSettings = [];

        this._states.tradeSettings.push(...[
            '${navigator.roomsettings.trade_not_allowed}',
            '${navigator.roomsettings.trade_not_with_Controller}',
            '${navigator.roomsettings.trade_allowed}'
        ]);
    }

    public goToHomeRoom(): boolean
    {
        if(this._states.homeRoomId < 1) return false;

        this.goToRoom(this._states.homeRoomId);

        return true;
    }


    public linkReceived(k: string):void
    {
        const parts = k.split('/');

        if(parts.length < 2) return;

        switch(parts[1])
        {
            case 'goto':
                if(parts.length > 2)
                {
                    switch(parts[2])
                    {
                        case 'home':
                            this.goToHomeRoom();
                            break;
                        default: {
                            const roomId = parseInt(parts[2]);

                            if(roomId > 0) this.goToPrivateRoom(roomId);
                        }
                    }
                }
                return;
        }
    }

    public enterRoomWebRequest(k: string, _arg_2:boolean=false, _arg_3:string=null)
    {
        //this._webRoomReport = _arg_2;
        //this._webRoomReportedName = _arg_3;
        Nitro.instance.communication.connection.send(new ConvertGlobalRoomIdMessageComposer(k));
    }

    public getContextByCode(code: string): NavigatorTopLevelContext
    {
        if(!code) return null;

        for(const context of this._states.topLevelContexts)
        {
            if(!context || (context.code !== code)) continue;

            return context;
        }

        return null;
    }

    public setCurrentContext(context: NavigatorTopLevelContext, search: boolean = true): void
    {
        if(!context || (this._states.topLevelContext === context)) return;

        this._states.topLevelContext = context;
    }

    public setCurrentContextByCode(code: string, search: boolean = true): void
    {
        if(!code) return;

        const topLevelContext = this.getContextByCode(code);

        if(!topLevelContext) return;

        this.setCurrentContext(topLevelContext, search);
    }

    public setCurrentFilter(filter: any): void
    {
        if(!filter || (this._states.filter === filter)) return;

        this._states.filter = filter;
    }

    public search(value: string = null): void
    {
        if(!this._states.topLevelContext || this._states.isSearching) return;

        if(!this._states.filter) this.setCurrentFilter(NavigatorService.SEARCH_FILTERS[0]);

        const query = ((this._states.filter && this._states.filter.query) ? this._states.filter.query + ':' : '');

        let search = value;

        if(search === null) search = this._states.lastSearch;

        this._states.lastSearch = (search || '');

        this.sendSearch(this._states.topLevelContext.code, (query + this._states.lastSearch));
    }

    public clearSearch(): void
    {
        this.setCurrentFilter(NavigatorService.SEARCH_FILTERS[0]);

        this._states.lastSearch = null;

        (this._states.isLoaded && this.search());
    }

    private sendSearch(code: string, query: string): void
    {
        if(!code) return;

        this._states.isSearching = true;

        Nitro.instance.communication.connection.send(new NavigatorSearchComposer(code, query));
    }

    public get eventUrlPrefix(): string
    {
        return 'navigator';
    }

    public loadNavigator(): void
    {
        Nitro.instance.communication.connection.send(new NavigatorInitComposer());

        this._states.isLoaded = true;
    }

    public toggleRoomCreator(): void
    {
        this._states.roomCreator = !this._states.roomCreator;
    }

    public get states()
    {
        return this._states;
    }
}
