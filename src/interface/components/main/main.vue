<template src="./main.component.html"></template>

<script lang="ts">
import { Component, Prop, Ref, Vue } from "vue-property-decorator";

import { ILinkEventTracker } from "nitro-renderer/src/core/events/ILinkEventTracker";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { RoomBackgroundColorEvent } from "nitro-renderer/src/nitro/room/events/RoomBackgroundColorEvent";
import { RoomEngineDimmerStateEvent } from "nitro-renderer/src/nitro/room/events/RoomEngineDimmerStateEvent";
import { RoomEngineEvent } from "nitro-renderer/src/nitro/room/events/RoomEngineEvent";
import { RoomEngineObjectEvent } from "nitro-renderer/src/nitro/room/events/RoomEngineObjectEvent";
import { RoomEngineTriggerWidgetEvent } from "nitro-renderer/src/nitro/room/events/RoomEngineTriggerWidgetEvent";
import { RoomObjectHSLColorEnabledEvent } from "nitro-renderer/src/nitro/room/events/RoomObjectHSLColorEnabledEvent";
import { RoomObjectWidgetRequestEvent } from "nitro-renderer/src/nitro/room/events/RoomObjectWidgetRequestEvent";
import { RoomZoomEvent } from "nitro-renderer/src/nitro/room/events/RoomZoomEvent";
import { RoomSessionChatEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionChatEvent";
import { RoomSessionDanceEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionDanceEvent";
import { RoomSessionDimmerPresetsEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionDimmerPresetsEvent";
import { RoomSessionDoorbellEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionDoorbellEvent";
import { RoomSessionErrorMessageEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionErrorMessageEvent";
import { RoomSessionEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionEvent";
import { RoomSessionFriendRequestEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionFriendRequestEvent";
import { RoomSessionPresentEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionPresentEvent";
import { RoomSessionUserBadgesEvent } from "nitro-renderer/src/nitro/session/events/RoomSessionUserBadgesEvent";
import { RoomWidgetEnum } from "nitro-renderer/src/nitro/ui/widget/enums/RoomWidgetEnum";
import { HabboWebTools } from "nitro-renderer/src/nitro/utils/HabboWebTools";
import { RoomId } from "nitro-renderer/src/room/utils/RoomId";
import Room from "../room/room.vue";
import Navigator from "../navigator/components/main/main.vue";
import { Services } from "../../services/Services";
import ChatInput from "../room/widgets/ChatInput/ChatInput.vue";
@Component({
	components: {
		Room,
		Navigator,
	},
})
export default class App extends Vue implements ILinkEventTracker {
	$refs!: {
		room: Room;
	};

	private _landingViewVisible: boolean = true;

	public mounted(): void {
		this.onRoomEngineEvent = this.onRoomEngineEvent.bind(this);
		this.onInterstitialEvent = this.onInterstitialEvent.bind(this);
		this.onRoomEngineObjectEvent = this.onRoomEngineObjectEvent.bind(this);
		this.onRoomSessionEvent = this.onRoomSessionEvent.bind(this);
		this.onRoomErrorEvent = this.onRoomErrorEvent.bind(this);
		Nitro.instance.addLinkEventTracker(this);

		this.init();

		Nitro.instance.communication.connection.onReady();
	}

	public init(): void {
		if (Nitro.instance.roomEngine.events) {
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineEvent.INITIALIZED,
				this.onRoomEngineEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineEvent.DISPOSED,
				this.onRoomEngineEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineEvent.ENGINE_INITIALIZED,
				this.onInterstitialEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineEvent.OBJECTS_INITIALIZED,
				this.onInterstitialEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineEvent.NORMAL_MODE,
				this.onInterstitialEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineEvent.GAME_MODE,
				this.onInterstitialEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomZoomEvent.ROOM_ZOOM,
				this.onRoomEngineEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomObjectHSLColorEnabledEvent.ROOM_BACKGROUND_COLOR,
				this.onRoomEngineEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomBackgroundColorEvent.ROOM_COLOR,
				this.onRoomEngineEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineDimmerStateEvent.ROOM_COLOR,
				this.onRoomEngineEvent
			);

			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.SELECTED,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.DESELECTED,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.ADDED,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.REMOVED,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.PLACED,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.REQUEST_MOVE,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.REQUEST_ROTATE,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.MOUSE_ENTER,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineObjectEvent.MOUSE_LEAVE,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.OPEN_WIDGET,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.CLOSE_WIDGET,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_INTERNAL_LINK,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_ROOM_LINK,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_TROPHY,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_CREDITFURNI,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomObjectWidgetRequestEvent.OPEN_FURNI_CONTEXT_MENU,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_STICKIE,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_DIMMER,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_BACKGROUND_COLOR,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_FRIEND_FURNITURE_ENGRAVING,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_MANNEQUIN,
				this.onRoomEngineObjectEvent
			);
			Nitro.instance.roomEngine.events.addEventListener(
				RoomEngineTriggerWidgetEvent.REQUEST_PRESENT,
				this.onRoomEngineObjectEvent
			);
		}

		if (Nitro.instance.roomSessionManager.events) {
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionEvent.CREATED,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionEvent.STARTED,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionEvent.ROOM_DATA,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionEvent.ENDED,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionChatEvent.CHAT_EVENT,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionChatEvent.FLOOD_EVENT,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionDanceEvent.RSDE_DANCE,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionUserBadgesEvent.RSUBE_BADGES,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionDoorbellEvent.DOORBELL,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionDoorbellEvent.RSDE_REJECTED,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionDoorbellEvent.RSDE_ACCEPTED,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionDimmerPresetsEvent.RSDPE_PRESETS,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionFriendRequestEvent.RSFRE_FRIEND_REQUEST,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionPresentEvent.RSPE_PRESENT_OPENED,
				this.onRoomSessionEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_KICKED,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_PETS_FORBIDDEN_IN_HOTEL,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_PETS_FORBIDDEN_IN_FLAT,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_MAX_PETS,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_MAX_NUMBER_OF_OWN_PETS,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_NO_FREE_TILES_FOR_PET,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_SELECTED_TILE_NOT_FREE_FOR_PET,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_BOTS_FORBIDDEN_IN_HOTEL,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_BOTS_FORBIDDEN_IN_FLAT,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_BOT_LIMIT_REACHED,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_SELECTED_TILE_NOT_FREE_FOR_BOT,
				this.onRoomErrorEvent
			);
			Nitro.instance.roomSessionManager.events.addEventListener(
				RoomSessionErrorMessageEvent.RSEME_BOT_NAME_NOT_ACCEPTED,
				this.onRoomErrorEvent
			);
		}
	}

	private onRoomEngineEvent(event: RoomEngineEvent): void {
		if (!event) return;

		if (RoomId.isRoomPreviewerId(event.roomId)) return;

		const session = Nitro.instance.roomSessionManager.getSession(
			event.roomId
		);

		if (!session) return;

		switch (event.type) {
			case RoomEngineEvent.INITIALIZED:
				if (this.$refs.room) {
					this.$refs.room.prepareRoom(session);

					Nitro.instance.roomEngine.setActiveRoomId(event.roomId);

					if (!this.$refs.room.roomSession.isSpectator) {
						this.$refs.room.createWidget(
							RoomWidgetEnum.CHAT_INPUT_WIDGET,
							ChatInput
						);
					}

					/*
          this.$refs.room.createWidget(
            RoomWidgetEnum.CHAT_WIDGET,
            RoomChatComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.INFOSTAND,
            RoomInfoStandMainComponent
          );
          this.$refs.room.createWidget(RoomWidgetEnum.LOCATION_WIDGET, null);
          this.$refs.room.createWidget(RoomWidgetEnum.INTERNAL_LINK, null);
          this.$refs.room.createWidget(RoomWidgetEnum.ROOM_LINK, null);
          this.$refs.room.createWidget(
            RoomWidgetEnum.CUSTOM_STACK_HEIGHT,
            CustomStackHeightComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.ROOM_DIMMER,
            DimmerFurniComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FURNI_STICKIE_WIDGET,
            StickieFurniComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.DOORBELL,
            DoorbellWidgetComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FURNI_TROPHY_WIDGET,
            FurnitureWidgetTrophyComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FURNI_CREDIT_WIDGET,
            FurnitureWidgetCreditComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FURNITURE_CONTEXT_MENU,
            FurnitureContextMenuWidget
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.ROOM_BACKGROUND_COLOR,
            BackgroundColorFurniWidget
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FRIEND_FURNI_CONFIRM,
            FriendsFurniConfirmWidget
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FRIEND_FURNI_ENGRAVING,
            FriendFurniEngravingWidget
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.ROOM_TOOLS,
            RoomToolsMainComponent
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.MANNEQUIN,
            MannequinWidget
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FURNI_PRESENT_WIDGET,
            PresentFurniWidget
          );
          this.$refs.room.createWidget(
            RoomWidgetEnum.FRIEND_REQUEST,
            FriendRequestMainComponent
          );

          if (!this.$refs.room.roomSession.isSpectator) {
            this.$refs.room.createWidget(
              RoomWidgetEnum.CHAT_INPUT_WIDGET,
              RoomChatInputComponent
            );
            this.$refs.room.createWidget(
              RoomWidgetEnum.AVATAR_INFO,
              RoomAvatarInfoComponent
            );
            this.$refs.room.createWidget(
              RoomWidgetEnum.FURNI_CHOOSER,
              ChooserWidgetFurniComponent
            );
            this.$refs.room.createWidget(
              RoomWidgetEnum.USER_CHOOSER,
              ChooserWidgetUserComponent
            );
          }
          */
				}
				return;
			case RoomEngineEvent.DISPOSED:
				if (this.$refs.room) this.$refs.room.endRoom();
				return;
			case RoomZoomEvent.ROOM_ZOOM: {
				const zoomEvent = event as RoomZoomEvent;

				let zoomLevel =
					zoomEvent.level < 1
						? 0.5
						: 1 << (Math.floor(zoomEvent.level) - 1);

				if (zoomEvent.forceFlip || zoomEvent.asDelta)
					zoomLevel = zoomEvent.level;

				if (this.$refs.room)
					Nitro.instance.roomEngine.setRoomInstanceRenderingCanvasScale(
						this.$refs.room.roomSession.roomId,
						this.$refs.room.getFirstCanvasId(),
						zoomLevel,
						null,
						null,
						false,
						zoomEvent.asDelta
					);

				return;
			}
			case RoomBackgroundColorEvent.ROOM_COLOR:
				if (this.$refs.room) {
					const colorEvent = event as RoomBackgroundColorEvent;

					if (colorEvent._Str_11464) {
						this.$refs.room.setRoomColorizerColor(0xff0000, 0xff);
					} else {
						this.$refs.room.setRoomColorizerColor(
							colorEvent.color,
							colorEvent._Str_5123
						);
					}
				}
				return;
			case RoomEngineDimmerStateEvent.ROOM_COLOR:
				if (this.$refs.room) this.$refs.room._Str_2485(event);
				return;
			case RoomObjectHSLColorEnabledEvent.ROOM_BACKGROUND_COLOR:
				if (this.$refs.room) {
					const hslColorEvent = event as RoomObjectHSLColorEnabledEvent;

					if (hslColorEvent.enable)
						this.$refs.room.setRoomBackgroundColor(
							hslColorEvent.hue,
							hslColorEvent.saturation,
							hslColorEvent.lightness
						);
					else this.$refs.room.setRoomBackgroundColor(0, 0, 0);
				}
				return;
		}
	}

	private onInterstitialEvent(event: RoomEngineEvent): void {
		if (!event) return;

		if (
			event.type !== RoomEngineEvent.GAME_MODE &&
			event.type !== RoomEngineEvent.NORMAL_MODE
		)
			return;

		this.$refs.room && this.$refs.room.onRoomEngineEvent(event);
	}

	public onRoomEngineObjectEvent(event: RoomEngineObjectEvent): void {
		this.$refs.room && this.$refs.room.onRoomEngineObjectEvent(event);
	}

	private onRoomErrorEvent(event: RoomSessionEvent): void {
		if (!event) return;

		let errorMessage: string;
		let errorTitle = "${error.title}";

		switch (event.type) {
			case RoomSessionErrorMessageEvent.RSEME_MAX_PETS:
				errorMessage = "${room.error.max_pets}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_MAX_NUMBER_OF_OWN_PETS:
				errorMessage = "${room.error.max_own_pets}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_KICKED:
				errorMessage = "${room.error.kicked}";
				errorTitle = "${generic.alert.title}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_PETS_FORBIDDEN_IN_HOTEL:
				errorMessage = "${room.error.pets.forbidden_in_hotel}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_PETS_FORBIDDEN_IN_FLAT:
				errorMessage = "${room.error.pets.forbidden_in_flat}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_NO_FREE_TILES_FOR_PET:
				errorMessage = "${room.error.pets.no_free_tiles}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_SELECTED_TILE_NOT_FREE_FOR_PET:
				errorMessage = "${room.error.pets.selected_tile_not_free}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_BOTS_FORBIDDEN_IN_HOTEL:
				errorMessage = "${room.error.bots.forbidden_in_hotel}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_BOTS_FORBIDDEN_IN_FLAT:
				errorMessage = "${room.error.bots.forbidden_in_flat}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_BOT_LIMIT_REACHED:
				errorMessage = "${room.error.max_bots}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_SELECTED_TILE_NOT_FREE_FOR_BOT:
				errorMessage = "${room.error.bots.selected_tile_not_free}";
				break;
			case RoomSessionErrorMessageEvent.RSEME_BOT_NAME_NOT_ACCEPTED:
				errorMessage = "${room.error.bots.name.not.accepted}";
				break;
			default:
				return;
		}

		//this._notificationService.alert(errorMessage, errorTitle);
	}

	private onRoomSessionEvent(event: RoomSessionEvent): void {
		if (!event) return;

		switch (event.type) {
			case RoomSessionEvent.CREATED:
				this._landingViewVisible = false;

				Nitro.instance.roomSessionManager.startSession(event.session);
				return;
			case RoomSessionEvent.STARTED:
				return;
			case RoomSessionEvent.ROOM_DATA:
				return;
			case RoomSessionEvent.ENDED:
				if (this.$refs.room) this.$refs.room.endRoom();

				this._landingViewVisible = event.openLandingView;

				return;
			default:
				this.$refs.room && this.$refs.room.processEvent(event);
				return;
		}
	}

	public linkReceived(link: string): void {
		const parts = link.split("/");

		if (parts.length < 2) return;

		switch (parts[1]) {
			case "open":
				if (parts.length > 2) {
					switch (parts[2]) {
						case "credits":
							//HabboWebTools.openWebPageAndMinimizeClient(this._windowManager.getProperty(ExternalVariables.WEB_SHOP_RELATIVE_URL));
							break;
						default: {
							const name = parts[2];
							HabboWebTools.openHabblet(name);
						}
					}
				}
				return;
		}
	}

	public get eventUrlPrefix(): string {
		return "habblet";
	}
}
</script>
