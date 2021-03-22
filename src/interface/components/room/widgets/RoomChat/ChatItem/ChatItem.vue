<template>
	<div class="bubble-container" ref="chatContainer">hello</div>
</template>

<script lang="ts">
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { Component, Prop, Vue } from "vue-property-decorator";
import { RoomWidgetChatUpdateEvent } from "../../events/RoomWidgetChatUpdateEvent";

@Component
export default class ChatItem extends Vue {
	@Prop()
	public id: string;

	$refs!: {
		chatContainer: HTMLElement;
	};

	public chatType: number;
	public chatStyle: number;
	public senderId: number;
	public senderName: string;
	public message: string;
	public messageLinks: string[];
	public timeStamp: number;
	public senderX: number;
	public senderImageUrl: string;
	public senderColor: number;
	public senderColorString: string;
	public roomId: number;
	public userType: number;
	public petType: number;
	public senderCategory: number;
	public x: number;
	public y: number;

	public update(k: RoomWidgetChatUpdateEvent): void {
		this.chatType = k.chatType;
		this.chatStyle = k.styleId;
		this.senderId = k.userId;
		this.senderName = k.userName;
		this.senderCategory = k.userCategory;
		this.message = k.text;
		this.messageLinks = k.links;
		this.senderX = k.userX;
		this.senderImageUrl = (k.userImage && k.userImage.src) || null;
		this.senderColor = k.userColor;
		this.senderColorString =
			(this.senderColor &&
				"#" + this.senderColor.toString(16).padStart(6, "0")) ||
			null;
		this.roomId = k.roomId;
		this.userType = k.userType;
		this.petType = k.petType;
	}

	public ready(): void {
		this.makeVisible();

		this.chatContainerElement &&
			(this.chatContainerElement.style.minWidth = this.width + "px");
	}

	public makeVisible(): void {
		this.chatContainerElement &&
			(this.chatContainerElement.style.visibility = "visible");
	}

	public getX(): number {
		return this.x;
	}

	public setX(x: number): void {
		if (!this.chatContainerElement) return;

		this.x = x;

		this.chatContainerElement.style.left = x + "px";
	}

	public getY(): number {
		return this.y;
	}

	public setY(y: number): void {
		if (!this.chatContainerElement) return;

		this.y = y;

		this.chatContainerElement.style.top = y + "px";
	}

	public selectUser(): void {
		Nitro.instance.roomEngine.selectRoomObject(
			this.roomId,
			this.senderId,
			this.senderCategory
		);
	}

	public get width(): number {
		return (
			(this.chatContainerElement &&
				this.chatContainerElement.clientWidth) ||
			0
		);
	}

	public get height(): number {
		return (
			(this.chatContainerElement &&
				this.chatContainerElement.clientHeight) ||
			0
		);
	}

	public get chatContainerElement(): HTMLElement {
		return this.$refs.chatContainer || null;
	}

	public get decoratedUsername(): string {
		return this.senderName + ":";
	}
}
</script>
