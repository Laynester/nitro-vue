<template>
	<div class="room-component" ref="roomWidgets">
		<div ref="roomCanvas" class="room-view" />
	</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { AdjustmentFilter } from "@pixi/filter-adjustment";
import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import { IConnection } from "nitro-renderer/src/core/communication/connections/IConnection";
import { EventDispatcher } from "nitro-renderer/src/core/events/EventDispatcher";
import { IEventDispatcher } from "nitro-renderer/src/core/events/IEventDispatcher";
import { NitroEvent } from "nitro-renderer/src/core/events/NitroEvent";
import { IAvatarRenderManager } from "nitro-renderer/src/nitro/avatar/IAvatarRenderManager";
import { LegacyExternalInterface } from "nitro-renderer/src/nitro/externalInterface/LegacyExternalInterface";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { RoomEngineEvent } from "nitro-renderer/src/nitro/room/events/RoomEngineEvent";
import { RoomEngineObjectEvent } from "nitro-renderer/src/nitro/room/events/RoomEngineObjectEvent";
import { RoomEngineTriggerWidgetEvent } from "nitro-renderer/src/nitro/room/events/RoomEngineTriggerWidgetEvent";
import { RoomZoomEvent } from "nitro-renderer/src/nitro/room/events/RoomZoomEvent";
import { IRoomEngine } from "nitro-renderer/src/nitro/room/IRoomEngine";
import { RoomObjectCategory } from "nitro-renderer/src/nitro/room/object/RoomObjectCategory";
import { RoomObjectOperationType } from "nitro-renderer/src/nitro/room/object/RoomObjectOperationType";
import { RoomObjectVariable } from "nitro-renderer/src/nitro/room/object/RoomObjectVariable";
import { RoomVariableEnum } from "nitro-renderer/src/nitro/room/RoomVariableEnum";
import { RoomControllerLevel } from "nitro-renderer/src/nitro/session/enum/RoomControllerLevel";
import { IRoomSession } from "nitro-renderer/src/nitro/session/IRoomSession";
import { IRoomSessionManager } from "nitro-renderer/src/nitro/session/IRoomSessionManager";
import { ISessionDataManager } from "nitro-renderer/src/nitro/session/ISessionDataManager";
import { IRoomWidgetHandler } from "nitro-renderer/src/nitro/ui/IRoomWidgetHandler";
import { IRoomWidgetHandlerContainer } from "nitro-renderer/src/nitro/ui/IRoomWidgetHandlerContainer";
import { MouseEventType } from "nitro-renderer/src/nitro/ui/MouseEventType";
import { TouchEventType } from "nitro-renderer/src/nitro/ui/TouchEventType";
import { RoomWidgetEnum } from "nitro-renderer/src/nitro/ui/widget/enums/RoomWidgetEnum";
import { RoomWidgetUpdateEvent } from "nitro-renderer/src/nitro/ui/widget/events/RoomWidgetUpdateEvent";
import { IRoomWidget } from "nitro-renderer/src/nitro/ui/widget/IRoomWidget";
import { IRoomWidgetMessageListener } from "nitro-renderer/src/nitro/ui/widget/IRoomWidgetMessageListener";
import { RoomWidgetMessage } from "nitro-renderer/src/nitro/ui/widget/messages/RoomWidgetMessage";
import { IRoomObject } from "nitro-renderer/src/room/object/IRoomObject";
import { ColorConverter } from "nitro-renderer/src/room/utils/ColorConverter";
import { RoomGeometry } from "nitro-renderer/src/room/utils/RoomGeometry";
import { RoomId } from "nitro-renderer/src/room/utils/RoomId";
import { Vector3d } from "nitro-renderer/src/room/utils/Vector3d";
import { RoomObjectType } from "nitro-renderer/src/nitro/room/object/RoomObjectType";
import { ChatInputHandler } from "./widgets/handlers/ChatInputHandler";
import { ChatWidgetHandler } from "./widgets/handlers/ChatWidgetHandler";
import { RoomWidgetRoomViewUpdateEvent } from "./widgets/events/RoomWidgetRoomViewUpdateEvent";

@Component({})
export default class Room
	extends Vue
	implements IRoomWidgetHandlerContainer, IRoomWidgetMessageListener {
	private COLOR_ADJUSTMENT: AdjustmentFilter;

	private _roomSession: IRoomSession;

	private _events: IEventDispatcher;
	private _handlers: IRoomWidgetHandler[];
	private _widgets: Map<string, Element>;
	private _widgetHandlerMessageMap: Map<string, IRoomWidgetHandler[]>;
	private _widgetHandlerEventMap: Map<string, IRoomWidgetHandler[]>;

	private _roomColorAdjustor: AdjustmentFilter = null;
	private _roomBackground: Sprite = null;
	private _roomBackgroundColor: number = 0;
	private _roomColorizerColor: number = 0;
	private _roomScale: number = 1;

	private _resizeTimer: ReturnType<typeof setTimeout> = null;
	private _didMouseMove: boolean = false;
	private _lastClick: number = 0;
	private _clickCount: number = 0;
	private _lastMouseMove: number = 0;
	private _isMouseMove: boolean = false;
	private _scrollCount: number = 0;
	private _lastScrollTime: number = 0;

	$refs!: {
		roomCanvas: HTMLElement;
		roomWidgets: HTMLElement;
	};

	public mounted() {
		this.processEvent = this.processEvent.bind(this);
		this.COLOR_ADJUSTMENT = new AdjustmentFilter();
		this._events = new EventDispatcher();
		this._handlers = [];
		this._widgets = new Map();
		this._widgetHandlerMessageMap = new Map();
		this._widgetHandlerEventMap = new Map();
	}

	public beforeDestroy() {
		this.endRoom();

		this._events.dispose();
	}

	public prepareRoom(session: IRoomSession): void {
		if (!session) return;

		const canvasId = this.getFirstCanvasId();
		const width = Nitro.instance.width;
		const height = Nitro.instance.height;
		const scale = RoomGeometry.SCALE_ZOOMED_IN;

		const displayObject = Nitro.instance.roomEngine.getRoomInstanceDisplay(
			session.roomId,
			canvasId,
			width,
			height,
			scale
		) as Sprite;

		if (!displayObject) return;

		const geometry = Nitro.instance.roomEngine.getRoomInstanceGeometry(
			session.roomId,
			canvasId
		) as RoomGeometry;

		if (geometry) {
			const minX =
				Nitro.instance.roomEngine.getRoomInstanceVariable<number>(
					session.roomId,
					RoomVariableEnum.ROOM_MIN_X
				) || 0;
			const maxX =
				Nitro.instance.roomEngine.getRoomInstanceVariable<number>(
					session.roomId,
					RoomVariableEnum.ROOM_MAX_X
				) || 0;
			const minY =
				Nitro.instance.roomEngine.getRoomInstanceVariable<number>(
					session.roomId,
					RoomVariableEnum.ROOM_MIN_Y
				) || 0;
			const maxY =
				Nitro.instance.roomEngine.getRoomInstanceVariable<number>(
					session.roomId,
					RoomVariableEnum.ROOM_MAX_Y
				) || 0;

			let x = (minX + maxX) / 2;
			let y = (minY + maxY) / 2;

			const offset = 20;

			x = x + (offset - 1);
			y = y + (offset - 1);

			const z =
				Math.sqrt(offset * offset + offset * offset) *
				Math.tan((30 / 180) * Math.PI);

			geometry.location = new Vector3d(x, y, z);
		}

		const stage = Nitro.instance.stage;

		if (!stage) return;

		stage.addChild(displayObject);

		this._roomSession = session;

		this.insertCanvas();

		this.onWindowResizeEvent(null);

		Nitro.instance.ticker.add(this.update, this);
	}

	public endRoom(): void {
		if (!this._roomSession) return;

		Nitro.instance.ticker.remove(this.update, this);

		if (this._resizeTimer) {
			clearTimeout(this._resizeTimer);

			this._resizeTimer = null;
		}

		for (const widget of this._widgets.values()) {
			if (!widget) continue;

			widget.remove();
		}

		for (const handler of this._handlers) handler && handler.dispose();

		this._roomColorAdjustor = null;
		this._roomBackground = null;
		this._roomBackgroundColor = 0;
		this._roomColorizerColor = 0;
		this._roomScale = 1;

		this.COLOR_ADJUSTMENT.red = 1;
		this.COLOR_ADJUSTMENT.green = 1;
		this.COLOR_ADJUSTMENT.blue = 1;

		this._handlers = [];
		this._widgets.clear();
		this._widgetHandlerMessageMap.clear();
		this._widgetHandlerEventMap.clear();
		this._events.removeAllListeners();
		this._roomSession = null;

		this.removeCanvas();

		LegacyExternalInterface.call("logDebug", "Navigator: exiting room");
	}

	private insertCanvas(): void {
		const canvas = Nitro.instance.renderer.view;

		if (!canvas) return;

		canvas.onclick = this.onMouseEvent.bind(this);
		canvas.onmousemove = this.onMouseEvent.bind(this);
		canvas.onmousedown = this.onMouseEvent.bind(this);
		canvas.onmouseup = this.onMouseEvent.bind(this);

		canvas.ontouchstart = this.onTouchEvent.bind(this);
		canvas.ontouchmove = this.onTouchEvent.bind(this);
		canvas.ontouchend = this.onTouchEvent.bind(this);
		canvas.ontouchcancel = this.onTouchEvent.bind(this);

		window.onresize = this.onWindowResizeEvent.bind(this);
		window.onmousewheel = this.onWindowMouseWheelEvent.bind(this);

		this.$refs.roomCanvas.appendChild(canvas);
	}

	private removeCanvas(): void {
		const canvas = Nitro.instance.renderer.view;

		if (!canvas) return;

		canvas.onclick = null;
		canvas.onmousemove = null;
		canvas.onmousedown = null;
		canvas.onmouseup = null;

		canvas.ontouchstart = null;
		canvas.ontouchmove = null;
		canvas.ontouchend = null;
		canvas.ontouchcancel = null;

		window.onresize = null;
		window.onmousewheel = null;

		if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
	}

	private onMouseEvent(event: MouseEvent): void {
		if (!event || !this._roomSession) return;

		const x = event.clientX;
		const y = event.clientY;

		let eventType = event.type;

		if (eventType === MouseEventType.MOUSE_CLICK) {
			if (this._lastClick) {
				this._clickCount = 1;

				if (this._lastClick >= Date.now() - 300) this._clickCount++;
			}

			this._lastClick = Date.now();

			if (this._clickCount === 2) {
				if (!this._didMouseMove)
					eventType = MouseEventType.DOUBLE_CLICK;

				this._clickCount = 0;
				this._lastClick = null;
			}
		}

		switch (eventType) {
			case MouseEventType.MOUSE_CLICK:
				break;
			case MouseEventType.DOUBLE_CLICK:
				break;
			case MouseEventType.MOUSE_MOVE:
				this._didMouseMove = true;
				break;
			case MouseEventType.MOUSE_DOWN:
				this._didMouseMove = false;
				break;
			case MouseEventType.MOUSE_UP:
				break;
			default:
				return;
		}

		Nitro.instance.roomEngine.setActiveRoomId(this._roomSession.roomId);
		Nitro.instance.roomEngine.dispatchMouseEvent(
			this.getFirstCanvasId(),
			x,
			y,
			eventType,
			event.altKey,
			event.ctrlKey || event.metaKey,
			event.shiftKey,
			false
		);
	}

	private onTouchEvent(event: TouchEvent): void {
		if (!event || !this._roomSession) return;

		let eventType = event.type;

		if (eventType === TouchEventType.TOUCH_END && !this._didMouseMove) {
			eventType = MouseEventType.MOUSE_CLICK;

			if (this._lastClick) {
				this._clickCount = 1;

				if (this._lastClick >= Date.now() - 300) this._clickCount++;
			}

			this._lastClick = Date.now();

			if (this._clickCount === 2) {
				eventType = MouseEventType.DOUBLE_CLICK;

				this._clickCount = 0;
				this._lastClick = null;
			}
		}

		switch (eventType) {
			case MouseEventType.MOUSE_CLICK:
				break;
			case MouseEventType.DOUBLE_CLICK:
				break;
			case TouchEventType.TOUCH_START:
				eventType = MouseEventType.MOUSE_DOWN;

				this._didMouseMove = false;
				break;
			case TouchEventType.TOUCH_MOVE:
				eventType = MouseEventType.MOUSE_MOVE;

				this._didMouseMove = true;
				break;
			default:
				return;
		}

		let x = 0;
		let y = 0;

		if (event.touches[0]) {
			x = event.touches[0].clientX;
			y = event.touches[0].clientY;
		} else if (event.changedTouches[0]) {
			x = event.changedTouches[0].clientX;
			y = event.changedTouches[0].clientY;
		}

		Nitro.instance.roomEngine.setActiveRoomId(this._roomSession.roomId);
		Nitro.instance.roomEngine.dispatchMouseEvent(
			this.getFirstCanvasId(),
			x,
			y,
			eventType,
			event.altKey,
			event.ctrlKey || event.metaKey,
			event.shiftKey,
			false
		);
	}

	private onWindowResizeEvent(event: UIEvent): void {
		if (!this._roomSession) return;

		if (this._resizeTimer) clearTimeout(this._resizeTimer);

		this._resizeTimer = setTimeout(() => {
			Nitro.instance.renderer.resize(
				window.innerWidth,
				window.innerHeight
			);

			Nitro.instance.roomEngine.initializeRoomInstanceRenderingCanvas(
				this._roomSession.roomId,
				this.getFirstCanvasId(),
				Nitro.instance.width,
				Nitro.instance.height
			);
			/*

			this._events.dispatchEvent(
				new RoomWidgetRoomViewUpdateEvent(
					RoomWidgetRoomViewUpdateEvent.SIZE_CHANGED,
					this.getRoomViewRect()
				)
			);

			*/

			this.setRoomBackground();

			Nitro.instance.render();
		}, 1);
	}

	private onWindowMouseWheelEvent(event: WheelEvent): void {
		if (!event || !this._roomSession) return;

		if (event.target !== Nitro.instance.renderer.view) return;

		//@ts-ignore
		const deltaY = -(1 / 40) * (event.wheelDeltaY || event.deltaY);
		const direction = deltaY < 0 ? 1 : -1;

		if (this._lastScrollTime) {
			if (this._lastScrollTime < Date.now() - 300) this._scrollCount = 0;

			this._scrollCount++;
		}

		this._lastScrollTime = Date.now();

		if (this._scrollCount !== 15) return;

		this._scrollCount = 0;
		this._lastScrollTime = null;

		let scale = this._roomScale;

		switch (direction) {
			case 1:
				if (scale >= 0.5) scale += 0.5;
				break;
			case -1:
				if (scale <= 1) scale = 0.5;
				else scale -= 0.5;
				break;
		}

		this._roomScale = scale;

		Nitro.instance.roomEngine.events.dispatchEvent(
			new RoomZoomEvent(this._roomSession.roomId, scale, false)
		);
	}

	public update(): void {}

	public createWidget(type: string, component: any): void {
		const existing = this._widgets.get(type);

		if (existing) return;

		let widgetHandler: IRoomWidgetHandler = null;

		let sendSizeUpdate = false;
		switch (type) {
			case RoomWidgetEnum.CHAT_INPUT_WIDGET:
				sendSizeUpdate = true;
				widgetHandler = new ChatInputHandler();
				break;
			case RoomWidgetEnum.CHAT_WIDGET: {
				sendSizeUpdate = true;

				const handler = new ChatWidgetHandler();

				handler.connection = Nitro.instance.communication.connection;

				widgetHandler = handler;
				break;
			}
		}
		if (widgetHandler) {
			const messageTypes = widgetHandler.messageTypes;

			if (messageTypes && messageTypes.length) {
				for (const name of messageTypes) {
					if (!name) continue;

					let messages = this._widgetHandlerMessageMap.get(name);

					if (!messages) {
						messages = [];

						this._widgetHandlerMessageMap.set(name, messages);
					}

					messages.push(widgetHandler);
				}
			}

			const eventTypes = widgetHandler.eventTypes;

			eventTypes.push(
				RoomEngineTriggerWidgetEvent.OPEN_WIDGET,
				RoomEngineTriggerWidgetEvent.CLOSE_WIDGET
			);

			if (eventTypes && eventTypes.length) {
				for (const name of eventTypes) {
					if (!name) continue;

					let events = this._widgetHandlerEventMap.get(name);

					if (!events) {
						events = [];

						this._widgetHandlerEventMap.set(name, events);
					}

					events.push(widgetHandler);
				}
			}

			this._handlers.push(widgetHandler);

			if (component) {
				let widgetRef: any = null;
				let widget: IRoomWidget = null;

				let componentClass = Vue.extend(component);

				let inst = new componentClass();

				inst.$mount();

				widgetRef = this.$refs.roomWidgets.appendChild(inst.$el);

				widget = (inst as unknown) as IRoomWidget;

				if (!widget) return;

				widget.widgetHandler = widgetHandler;

				widget.messageListener = this;

				widget.registerUpdateEvents(this._events);

				this._widgets.set(type, widgetRef);
			}

			widgetHandler.container = this;
		}

		if (sendSizeUpdate)
			this._events.dispatchEvent(
				new RoomWidgetRoomViewUpdateEvent(
					RoomWidgetRoomViewUpdateEvent.SIZE_CHANGED,
					this.getRoomViewRect()
				)
			);
		/*
    const existing = this._widgets.get(type);

    if (existing) return;

    let widgetHandler: IRoomWidgetHandler = null;

    let sendSizeUpdate = false;

    switch (type) {
      case RoomWidgetEnum.CHAT_WIDGET: {
        sendSizeUpdate = true;

        const handler = new ChatWidgetHandler(this._chatHistoryService);

        handler.connection = Nitro.instance.communication.connection;

        widgetHandler = handler;
        break;
      }
      case RoomWidgetEnum.CHAT_INPUT_WIDGET:
        sendSizeUpdate = true;
        widgetHandler = new ChatInputWidgetHandler();
        break;
      case RoomWidgetEnum.AVATAR_INFO:
        widgetHandler = new AvatarInfoWidgetHandler();
        break;
      case RoomWidgetEnum.INFOSTAND:
        widgetHandler = new InfoStandWidgetHandler();
        break;
      case RoomWidgetEnum.LOCATION_WIDGET:
        widgetHandler = new ObjectLocationRequestHandler();
        break;
      case RoomWidgetEnum.INTERNAL_LINK:
        widgetHandler = new FurnitureInternalLinkHandler();
        break;
      case RoomWidgetEnum.ROOM_LINK:
        widgetHandler = new FurnitureRoomLinkHandler();
        break;
      case RoomWidgetEnum.ROOM_DIMMER:
        widgetHandler = new FurnitureDimmerWidgetHandler();
        break;
      case RoomWidgetEnum.CUSTOM_STACK_HEIGHT:
        widgetHandler = new FurnitureCustomStackHeightWidgetHandler();
        break;
      case RoomWidgetEnum.FURNI_CHOOSER:
        widgetHandler = new FurniChooserWidgetHandler();
        break;
      case RoomWidgetEnum.USER_CHOOSER:
        widgetHandler = new UserChooserWidgetHandler();
        break;
      case RoomWidgetEnum.FURNI_STICKIE_WIDGET:
        widgetHandler = new FurnitureStickieHandler();
        break;
      case RoomWidgetEnum.DOORBELL:
        widgetHandler = new DoorbellWidgetHandler();
        break;
      case RoomWidgetEnum.FURNI_TROPHY_WIDGET:
        widgetHandler = new FurnitureTrophyWidgetHandler();
        break;
      case RoomWidgetEnum.FURNI_CREDIT_WIDGET:
        widgetHandler = new FurnitureCreditWidgetHandler();
        break;
      case RoomWidgetEnum.FURNITURE_CONTEXT_MENU:
        widgetHandler = new FurnitureContextMenuWidgetHandler();
        break;
      case RoomWidgetEnum.MANNEQUIN:
        widgetHandler = new FurnitureMannequinWidgetHandler();
        break;
      case RoomWidgetEnum.ROOM_BACKGROUND_COLOR:
        widgetHandler = new FurnitureBackgroundColorWidgetHandler();
        break;
      case RoomWidgetEnum.FRIEND_FURNI_CONFIRM:
        widgetHandler = new FriendFurniConfirmWidgetHandler();
        break;
      case RoomWidgetEnum.FRIEND_FURNI_ENGRAVING:
        widgetHandler = new FriendFurniEngravingWidgetHandler();
        break;
      case RoomWidgetEnum.ROOM_TOOLS:
        widgetHandler = new RoomToolsWidgetHandler();
        break;
      case RoomWidgetEnum.FURNI_PRESENT_WIDGET:
        widgetHandler = new FurniturePresentWidgetHandler();
        break;
      case RoomWidgetEnum.FRIEND_REQUEST:
        widgetHandler = new FriendRequestHandler();
        break;
    }

    if (widgetHandler) {
      const messageTypes = widgetHandler.messageTypes;

      if (messageTypes && messageTypes.length) {
        for (const name of messageTypes) {
          if (!name) continue;

          let messages = this._widgetHandlerMessageMap.get(name);

          if (!messages) {
            messages = [];

            this._widgetHandlerMessageMap.set(name, messages);
          }

          messages.push(widgetHandler);
        }
      }

      const eventTypes = widgetHandler.eventTypes;

      eventTypes.push(
        RoomEngineTriggerWidgetEvent.OPEN_WIDGET,
        RoomEngineTriggerWidgetEvent.CLOSE_WIDGET
      );

      if (eventTypes && eventTypes.length) {
        for (const name of eventTypes) {
          if (!name) continue;

          let events = this._widgetHandlerEventMap.get(name);

          if (!events) {
            events = [];

            this._widgetHandlerEventMap.set(name, events);
          }

          events.push(widgetHandler);
        }
      }

      this._handlers.push(widgetHandler);

      if (component) {
        let widgetRef: ComponentRef<IRoomWidget> = null;
        let widget: IRoomWidget = null;

        this._ngZone.run(() => {
          const componentFactory = this._componentFactoryResolver.resolveComponentFactory(
            component
          );

          widgetRef = this.widgetContainer.createComponent(componentFactory);
          widget = widgetRef.instance as IRoomWidget;
        });

        if (!widget) return;

        widget.widgetHandler = widgetHandler;
        widget.messageListener = this;

        widget.registerUpdateEvents(this._events);

        this._widgets.set(type, widgetRef);
      }

      widgetHandler.container = this;
    }

    if (sendSizeUpdate)
      this._events.dispatchEvent(
        new RoomWidgetRoomViewUpdateEvent(
          RoomWidgetRoomViewUpdateEvent.SIZE_CHANGED,
          this.getRoomViewRect()
        )
      );
      */
	}

	public processEvent(event: NitroEvent): void {
		if (!event || !this._widgetHandlerEventMap) return;

		const events = this._widgetHandlerEventMap.get(event.type);

		if (!events) return;

		let dispatchEvent = false;

		for (const existing of events) {
			if (!existing) continue;

			dispatchEvent = true;

			if (
				event.type === RoomEngineTriggerWidgetEvent.OPEN_WIDGET ||
				event.type === RoomEngineTriggerWidgetEvent.CLOSE_WIDGET
			) {
				if (event instanceof RoomEngineTriggerWidgetEvent) {
					dispatchEvent = existing.type === event.widget;
				}
			}

			if (dispatchEvent) existing.processEvent(event);
		}
	}

	public processWidgetMessage(
		message: RoomWidgetMessage
	): RoomWidgetUpdateEvent {
		if (!message || !message.type) return null;

		const handlers = this._widgetHandlerMessageMap.get(message.type);

		if (!handlers || !handlers.length) return null;

		for (const handler of handlers) {
			if (!handler) continue;

			const update = handler.processWidgetMessage(message);

			if (!update) continue;

			return update;
		}

		return null;
	}

	public onRoomEngineEvent(event: RoomEngineEvent): void {
		if (!event) return;

		switch (event.type) {
			case RoomEngineEvent.NORMAL_MODE:
				/*
				this._events.dispatchEvent(
					new RoomWidgetRoomEngineUpdateEvent(
						RoomWidgetRoomEngineUpdateEvent.RWREUE_NORMAL_MODE,
						event.roomId
					)
				);
				*/
				return;
			case RoomEngineEvent.GAME_MODE:
				/*
				this._events.dispatchEvent(
					new RoomWidgetRoomEngineUpdateEvent(
						RoomWidgetRoomEngineUpdateEvent.RWREUE_GAME_MODE,
						event.roomId
					)
				);
				*/
				return;
		}
	}

	public onRoomEngineObjectEvent(event: RoomEngineObjectEvent): void {
		if (!event) return;

		const objectId = event.objectId;
		const category = event.category;

		let updateEvent: any = null;
		/*

		
		*/
	}

	private isFurnitureSelectionDisabled(k: RoomEngineObjectEvent): boolean {
		let result = false;

		const roomObject = Nitro.instance.roomEngine.getRoomObject(
			k.roomId,
			k.objectId,
			k.category
		);

		if (roomObject) {
			const selectionDisabled =
				roomObject.model.getValue<number>(
					RoomObjectVariable.FURNITURE_SELECTION_DISABLED
				) === 1;

			if (selectionDisabled) {
				result = true;

				if (Nitro.instance.sessionDataManager.isModerator)
					result = false;
			}
		}

		return result;
	}

	public checkFurniManipulationRights(
		roomId: number,
		objectId: number,
		category: number
	): boolean {
		return (
			this._roomSession.controllerLevel >= RoomControllerLevel.GUEST ||
			Nitro.instance.sessionDataManager.isModerator ||
			this.isOwnerOfFurniture(
				Nitro.instance.roomEngine.getRoomObject(
					roomId,
					objectId,
					category
				)
			)
		);
	}

	public isOwnerOfFurniture(roomObject: IRoomObject): boolean {
		if (!roomObject || !roomObject.model) return false;

		const userId = Nitro.instance.sessionDataManager.userId;
		const objectOwnerId = roomObject.model.getValue<number>(
			RoomObjectVariable.FURNITURE_OWNER_ID
		);

		return userId === objectOwnerId;
	}

	public _Str_2485(event: NitroEvent): void {
		if (!event || !this._widgetHandlerEventMap) return;

		const events = this._widgetHandlerEventMap.get(event.type);

		if (events && events.length) {
			let processEvent = true;

			for (const widgetEvent of events) {
				if (
					event.type === RoomEngineTriggerWidgetEvent.OPEN_WIDGET ||
					RoomEngineTriggerWidgetEvent.CLOSE_WIDGET
				) {
					if (event instanceof RoomEngineTriggerWidgetEvent) {
						processEvent = widgetEvent.type === event.widget;
					}
				}

				if (processEvent) widgetEvent.processEvent(event);
			}
		}
	}

	private getRoomBackground(): Sprite {
		if (this._roomBackground) return this._roomBackground;

		const canvas = this.roomEngine.getRoomInstanceRenderingCanvas(
			this.roomSession.roomId,
			this.getFirstCanvasId()
		);

		if (!canvas) return null;

		const displayObject = canvas.master as Container;
		const background = new Sprite(Texture.WHITE);

		displayObject.addChildAt(background, 0);

		this._roomBackground = background;

		return this._roomBackground;
	}

	private getRoomColorizer(): AdjustmentFilter {
		if (this._roomColorAdjustor) return this._roomColorAdjustor;

		const canvas = this.roomEngine.getRoomInstanceRenderingCanvas(
			this.roomSession.roomId,
			this.getFirstCanvasId()
		);

		if (!canvas) return null;

		const display = canvas.master;

		if (!display) return null;

		this._roomColorAdjustor = this.COLOR_ADJUSTMENT;

		display.filters = [this._roomColorAdjustor];

		return this._roomColorAdjustor;
	}

	public setRoomBackgroundColor(
		hue: number,
		saturation: number,
		lightness: number
	): void {
		this._roomBackgroundColor = ColorConverter._Str_13949(
			((hue & 0xff) << 16) +
				((saturation & 0xff) << 8) +
				(lightness & 0xff)
		);

		const background = this.getRoomBackground();

		if (!background) return;

		if (!hue && !saturation && !lightness) {
			background.visible = false;
		} else {
			background.visible = true;

			this.setRoomBackground();
		}
	}

	public setRoomColorizerColor(color: number, brightness: number): void {
		this._roomColorizerColor = ColorConverter._Str_13949(
			(ColorConverter._Str_22130(color) & 0xffff00) + brightness
		);

		this.setRoomColorizer();
	}

	private setRoomBackground(): void {
		const background = this.getRoomBackground();

		if (!background) return;

		background.tint = this._roomBackgroundColor;
		background.width = Nitro.instance.width;
		background.height = Nitro.instance.height;
	}

	private setRoomColorizer(): void {
		const colorMatrix = this.getRoomColorizer();

		if (!colorMatrix) return;

		const r = (this._roomColorizerColor >> 16) & 0xff;
		const g = (this._roomColorizerColor >> 8) & 0xff;
		const b = this._roomColorizerColor & 0xff;

		colorMatrix.red = r / 255;
		colorMatrix.green = g / 255;
		colorMatrix.blue = b / 255;
	}

	public getFirstCanvasId(): number {
		return 1;
	}

	public getRoomViewRect(): Rectangle {
		const bounds = this.$refs.roomCanvas.getBoundingClientRect();

		return new Rectangle(
			bounds.x || 0,
			bounds.y || 0,
			bounds.width || 0,
			bounds.height || 0
		);
	}

	public get events(): IEventDispatcher {
		return this._events;
	}

	public get connection(): IConnection {
		return Nitro.instance.communication.connection;
	}

	public get roomEngine(): IRoomEngine {
		return Nitro.instance.roomEngine;
	}

	public get avatarRenderManager(): IAvatarRenderManager {
		return Nitro.instance.avatar;
	}

	public get roomSessionManager(): IRoomSessionManager {
		return Nitro.instance.roomSessionManager;
	}

	public get sessionDataManager(): ISessionDataManager {
		return Nitro.instance.sessionDataManager;
	}

	public get roomSession(): IRoomSession {
		return this._roomSession;
	}
}
</script>
