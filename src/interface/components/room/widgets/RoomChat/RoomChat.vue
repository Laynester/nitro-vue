<template>
	<div class="room-chat" ref="roomchat"></div>
</template>

<script lang="ts">
import { IEventDispatcher } from "nitro-renderer/src/core/events/IEventDispatcher";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { RoomEnterEffect } from "nitro-renderer/src/room/utils/RoomEnterEffect";
import { Point } from "pixi.js";
import { Component } from "vue-property-decorator";
import Vue from "vue";
import { RoomWidgetChatUpdateEvent } from "../events/RoomWidgetChatUpdateEvent";
import { RoomWidgetRoomViewUpdateEvent } from "../events/RoomWidgetRoomViewUpdateEvent";
import { ChatWidgetHandler } from "../handlers/ChatWidgetHandler";
import { RoomWidget } from "../RoomWidget";
import ChatItem from "./ChatItem/ChatItem.vue";

@Component
export default class RoomChat extends RoomWidget {
	$refs!: {
		roomchat: HTMLElement;
	};

	private static TIMER_TRACKER: number = 0;
	private static CHAT_COUNTER: number = 0;

	public timerId: number = ++RoomChat.TIMER_TRACKER;
	public cameraOffset: Point = new Point();

	public chats: ChatItem[] = [];
	public tempChats: ChatItem[] = [];
	public pendingChats: RoomWidgetChatUpdateEvent[] = [];
	public processingChats: boolean = false;

	private _skipNextMove: boolean = false;

	constructor() {
		super();

		this.onChatMessage = this.onChatMessage.bind(this);
		this.onRoomViewUpdate = this.onRoomViewUpdate.bind(this);
	}

	public ngOnInit(): void {
		Nitro.instance.addWorkerEventTracker(this);

		Nitro.instance.sendWorkerEvent({
			type: "CREATE_INTERVAL",
			time: 5000,
			timerId: this.timerId,
			response: { type: "MOVE_CHATS" },
		});
	}

	public ngOnDestroy(): void {
		Nitro.instance.sendWorkerEvent({
			type: "REMOVE_INTERVAL",
			timerId: this.timerId,
		});

		Nitro.instance.removeWorkerEventTracker(this);
	}

	public registerUpdateEvents(eventDispatcher: IEventDispatcher): void {
		if (!eventDispatcher) return;

		eventDispatcher.addEventListener(
			RoomWidgetChatUpdateEvent.RWCUE_EVENT_CHAT,
			this.onChatMessage
		);
		eventDispatcher.addEventListener(
			RoomWidgetRoomViewUpdateEvent.SIZE_CHANGED,
			this.onRoomViewUpdate
		);
		eventDispatcher.addEventListener(
			RoomWidgetRoomViewUpdateEvent.POSITION_CHANGED,
			this.onRoomViewUpdate
		);
		eventDispatcher.addEventListener(
			RoomWidgetRoomViewUpdateEvent.SCALE_CHANGED,
			this.onRoomViewUpdate
		);

		super.registerUpdateEvents(eventDispatcher);
	}

	public unregisterUpdateEvents(eventDispatcher: IEventDispatcher): void {
		if (!eventDispatcher) return;

		eventDispatcher.removeEventListener(
			RoomWidgetChatUpdateEvent.RWCUE_EVENT_CHAT,
			this.onChatMessage
		);
		eventDispatcher.removeEventListener(
			RoomWidgetRoomViewUpdateEvent.SIZE_CHANGED,
			this.onRoomViewUpdate
		);
		eventDispatcher.removeEventListener(
			RoomWidgetRoomViewUpdateEvent.POSITION_CHANGED,
			this.onRoomViewUpdate
		);
		eventDispatcher.removeEventListener(
			RoomWidgetRoomViewUpdateEvent.SCALE_CHANGED,
			this.onRoomViewUpdate
		);
	}

	private updateChatViewForDimensions(width: number, height: number): void {
		const element = this.chatViewElement;

		if (!element) return;

		const percentage = Nitro.instance.getConfiguration<number>(
			"chat.viewer.height.percentage",
			0.4
		);

		element.style.height = height * percentage + "px";
	}

	private onChatMessage(k: RoomWidgetChatUpdateEvent): void {
		if (
			!k ||
			(RoomEnterEffect.isRunning() &&
				k.chatType !== RoomWidgetChatUpdateEvent.CHAT_TYPE_WHISPER)
		)
			return;

		this.pendingChats.push(k);

		this.processPendingChats();
	}

	private onRoomViewUpdate(event: RoomWidgetRoomViewUpdateEvent): void {
		if (event.positionDelta) {
			this.cameraOffset.x = this.cameraOffset.x + event.positionDelta.x;
			this.cameraOffset.y = this.cameraOffset.y + event.positionDelta.y;

			this.resetAllChatLocations();
		}

		if (event.roomViewRectangle)
			this.updateChatViewForDimensions(
				event.roomViewRectangle.width,
				event.roomViewRectangle.height
			);
	}

	private processPendingChats(skipCheck: boolean = false): void {
		if (!skipCheck) {
			if (this.processingChats) return;
		}

		this.processingChats = true;

		const pendingChat = this.pendingChats.shift();

		if (!pendingChat) {
			this.processingChats = false;

			return;
		}

		let chatRef: Element;
		let chat: ChatItem = null;

		let componentClass = Vue.extend(ChatItem);

		let inst = new componentClass();

		inst.$mount();

		inst.$props.id = this.getFreeItemId();

		chatRef = this.$refs.roomchat.appendChild(inst.$el);

		chat = inst as ChatItem;

		if (!chat) return;

		chat.update(pendingChat);

		this.addChat(chat);

		this._skipNextMove = true;
	}

	private getFreeItemId(): string {
		return "chat_item_" + RoomChat.CHAT_COUNTER;
	}

	private addChat(chat: ChatItem): void {
		if (!chat) return;

		const chatInstance = chat;

		chatInstance.senderX = chatInstance.senderX - this.cameraOffset.x;

		chatInstance.setY(
			this.chatViewElement.offsetHeight - chatInstance.height
		);

		this.resetChatItemLocation(chat);

		this.makeRoomForChat(chat);

		this.chats.push(chat);

		chatInstance.ready();

		RoomChat.CHAT_COUNTER++;

		this.processPendingChats(true);
	}

	private hideChat(chat: ChatItem): void {
		if (!chat) return;

		const chatIndex = this.chats.indexOf(chat);

		if (chatIndex >= 0) this.chats.splice(chatIndex, 1);

		this.$refs.roomchat.removeChild(chat.$el);
	}

	private moveChatUp(chat: ChatItem, nextHeight: number = 0): void {
		if (!chat) return;

		const chatInstance = chat;

		let y = chatInstance.height;

		if (nextHeight) y = nextHeight;

		chatInstance.setY(chatInstance.getY() - y);

		if (chatInstance.getY() < -(chatInstance.height * 2))
			this.hideChat(chat);
	}

	private moveAllChatsUp(): void {
		if (this._skipNextMove) {
			this._skipNextMove = false;

			return;
		}

		let i = this.chats.length - 1;

		while (i >= 0) {
			this.moveChatUp(this.chats[i], 15);

			i--;
		}
	}

	private makeRoomForChat(chat: ChatItem): void {
		if (!chat) return;

		const chatInstance = chat;

		const lastChat = this.chats[this.chats.length - 1];
		const lastChatInstance = lastChat && lastChat;

		if (!lastChatInstance) return;

		const lowestPoint =
			lastChatInstance.getY() + lastChatInstance.height - 1;
		const requiredSpace = chatInstance.height + 1;

		const spaceAvailable = this.chatViewElement.offsetHeight - lowestPoint;

		if (spaceAvailable < requiredSpace) {
			for (const chat of this.chats) {
				this.moveChatUp(chat, requiredSpace - spaceAvailable);
			}
		}
	}

	private resetAllChatLocations(): void {
		let i = this.chats.length - 1;

		while (i >= 0) {
			const chat = this.chats[i];

			if (chat) this.resetChatItemLocation(chat);

			i--;
		}
	}

	private resetChatItemLocation(chat: ChatItem): void {
		const chatInstance = chat;

		let x = chatInstance.senderX + this.cameraOffset.x;

		x = x - chatInstance.width / 2;

		chatInstance.setX(x);
	}

	public workerMessageReceived(message: { [index: string]: any }): void {
		if (!message) return;

		switch (message.type) {
			case "MOVE_CHATS":
				this.moveAllChatsUp();
				return;
		}
	}

	public get chatViewElement(): HTMLElement {
		return this.$refs.roomchat || null;
	}

	public get handler(): ChatWidgetHandler {
		return this.widgetHandler as ChatWidgetHandler;
	}
}
</script>
