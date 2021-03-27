<template>
	<div class="room-chat-input">
		<nitro-border type="1" class="chat-input-container">
			<img src="/assets/images/generic/chat/chat-style.png" />
			<input
				ref="chatInputView"
				type="text"
				class="chat-input"
				@keydown="onKeyDownEvent"
				v-model="inputValue"
			/>
			test
		</nitro-border>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { RoomWidgetFloodControlEvent } from "../events/RoomWidgetFloodControlEvent";
import { RoomWidgetChatInputContentUpdateEvent } from "../events/RoomWidgetChatInputContentUpdateEvent";
import { RoomWidgetRoomObjectUpdateEvent } from "../events/RoomWidgetRoomObjectUpdateEvent";
import { RoomWidgetUpdateInfostandUserEvent } from "../events/RoomWidgetUpdateInfostandUserEvent";
import { IEventDispatcher } from "nitro-renderer/src/core/events/IEventDispatcher";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { RoomWidget } from "../RoomWidget";
import { RoomWidgetChatTypingMessage } from "../messages/RoomWidgetChatTypingMessage";
import { RoomWidgetChatMessage } from "../messages/RoomWidgetChatMessage";

@Component
export default class ChatInput extends RoomWidget {
	public selectedUsername: string = "";
	public floodBlocked: boolean = false;
	public floodBlockedSeconds: number = 0;
	public lastContent: string = "";
	public isTyping: boolean = false;
	public typingStartedSent: boolean = false;
	public typingTimer: ReturnType<typeof setTimeout> = null;
	public idleTimer: ReturnType<typeof setTimeout> = null;
	public floodTimer: ReturnType<typeof setTimeout> = null;
	public floodInterval: ReturnType<typeof setInterval> = null;
	public currentStyle: number = -1;
	public needsStyleUpdate: boolean = false;

	public inputValue: string = "";

	private _chatModeIdWhisper: string = null;
	private _chatModeIdShout: string = null;
	private _chatModeIdSpeak: string = null;
	private _maxChatLength: number = 0;

	$refs!: {
		chatInputView: HTMLInputElement;
	};

	public mounted(): void {
		this._chatModeIdWhisper = Nitro.instance.getLocalization(
			"widgets.chatinput.mode.whisper"
		);
		this._chatModeIdShout = Nitro.instance.getLocalization(
			"widgets.chatinput.mode.shout"
		);
		this._chatModeIdSpeak = Nitro.instance.getLocalization(
			"widgets.chatinput.mode.speak"
		);
		this._maxChatLength = Nitro.instance.getConfiguration<number>(
			"chat.input.maxlength",
			100
		);
		this.currentStyle = Nitro.instance.sessionDataManager.chatStyle;
	}

	public registerUpdateEvents(eventDispatcher: IEventDispatcher): void {
		if (!eventDispatcher) return;

		eventDispatcher.addEventListener(
			RoomWidgetRoomObjectUpdateEvent.OBJECT_DESELECTED,
			this.onRoomWidgetRoomObjectUpdateEvent
		);
		eventDispatcher.addEventListener(
			RoomWidgetUpdateInfostandUserEvent.PEER,
			this.onRoomWidgetUpdateInfostandUserEvent
		);
		eventDispatcher.addEventListener(
			RoomWidgetChatInputContentUpdateEvent.RWWCIDE_CHAT_INPUT_CONTENT,
			this.onRoomWidgetChatInputContentUpdateEvent
		);
		eventDispatcher.addEventListener(
			RoomWidgetFloodControlEvent.RWFCE_FLOOD_CONTROL,
			this.onRoomWidgetFloodControlEvent
		);

		super.registerUpdateEvents(eventDispatcher);
	}

	private onRoomWidgetRoomObjectUpdateEvent(
		event: RoomWidgetRoomObjectUpdateEvent
	): void {
		this.selectedUsername = "";
	}

	private onRoomWidgetUpdateInfostandUserEvent(
		event: RoomWidgetUpdateInfostandUserEvent
	): void {
		if (!event) return;

		this.selectedUsername = event.name;
	}

	private onRoomWidgetChatInputContentUpdateEvent(
		event: RoomWidgetChatInputContentUpdateEvent
	): void {
		if (!event) return;

		switch (event._Str_23621) {
			case RoomWidgetChatInputContentUpdateEvent.WHISPER: {
				const localization = Nitro.instance.getLocalization(
					"widgets.chatinput.mode.whisper"
				);

				this.changeInputValue(
					localization + " " + event.userName + " "
				);
				return;
			}
			case RoomWidgetChatInputContentUpdateEvent.SHOUT:
				return;
		}
	}

	private changeInputValue(value: string): void {
		this.inputValue = value;
	}

	private onRoomWidgetFloodControlEvent(
		event: RoomWidgetFloodControlEvent
	): void {
		if (!event) return;

		this.floodBlocked = true;
		this.floodBlockedSeconds = event.seconds;

		this.changeInputValue(
			Nitro.instance.getLocalizationWithParameter(
				"chat.input.alert.flood",
				"time",
				this.floodBlockedSeconds.toString()
			)
		);

		this.startFloodInterval();
	}

	private onKeyDownEvent(event: KeyboardEvent): void {
		if (!event) return;

		if (this.anotherInputHasFocus()) return;

		const input = this.$refs.chatInputView;

		if (document.activeElement !== input) this.setInputFocus();

		const key = event.keyCode;
		const shiftKey = event.shiftKey;

		switch (key) {
			case 32: // SPACE
				this.checkSpecialKeywordForInput();
				return;
			case 13: // ENTER
				this.sendChatFromInputField(shiftKey);
				return;
			case 8: // BACKSPACE
				if (this.$refs.chatInputView) {
					const value = this.$refs.chatInputView.value;
					const parts = value.split(" ");

					if (
						parts[0] === this._chatModeIdWhisper &&
						parts.length === 3 &&
						parts[2] === ""
					) {
						this.changeInputValue("");

						this.lastContent = "";
					}
				}
				return;
			default:
				return;
		}
	}

	private anotherInputHasFocus(): boolean {
		const activeElement = document.activeElement;

		if (!activeElement) return false;

		if (
			this.$refs.chatInputView &&
			this.$refs.chatInputView === activeElement
		)
			return false;

		if (
			!(activeElement instanceof HTMLInputElement) &&
			!(activeElement instanceof HTMLTextAreaElement)
		)
			return false;

		return true;
	}

	private setInputFocus(): void {
		const input = this.$refs.chatInputView;

		if (!input) return;

		input.focus();

		input.setSelectionRange(input.value.length * 2, input.value.length * 2);
	}

	private checkSpecialKeywordForInput(): void {
		const inputView = this.$refs.chatInputView || null;

		if (!inputView || inputView.value === "") return;

		const text = inputView.value;
		const selectedUsername = this.selectedUsername;

		if (text !== this._chatModeIdWhisper || selectedUsername.length === 0)
			return;

		this.changeInputValue(`${inputView.value} ${this.selectedUsername}`);
	}

	private startIdleTimer(): void {
		this.resetIdleTimer();

		this.idleTimer = setTimeout(this.onIdleTimerComplete.bind(this), 10000);
	}

	private resetIdleTimer(): void {
		if (this.idleTimer) {
			clearTimeout(this.idleTimer);

			this.idleTimer = null;
		}
	}

	private onIdleTimerComplete(): void {
		if (this.isTyping) this.typingStartedSent = false;

		this.isTyping = false;

		this.sendTypingMessage();
	}

	private startTypingTimer(): void {
		this.resetTypingTimer();

		this.typingTimer = setTimeout(
			this.onTypingTimerComplete.bind(this),
			1000
		);
	}

	private resetTypingTimer(): void {
		if (this.typingTimer) {
			clearTimeout(this.typingTimer);

			this.typingTimer = null;
		}
	}

	private sendChatFromInputField(shiftKey: boolean = false): void {
		if (!this.$refs.chatInputView || this.$refs.chatInputView.value === "")
			return;

		let chatType = shiftKey
			? RoomWidgetChatMessage.CHAT_SHOUT
			: RoomWidgetChatMessage.CHAT_DEFAULT;
		let text = this.$refs.chatInputView.value;

		const parts = text.split(" ");

		let recipientName = "";
		let append = "";

		switch (parts[0]) {
			case this._chatModeIdWhisper:
				chatType = RoomWidgetChatMessage.CHAT_WHISPER;
				recipientName = parts[1];
				append = this._chatModeIdWhisper + " " + recipientName + " ";

				parts.shift();
				parts.shift();
				break;
			case this._chatModeIdShout:
				chatType = RoomWidgetChatMessage.CHAT_SHOUT;

				parts.shift();
				break;
			case this._chatModeIdSpeak:
				chatType = RoomWidgetChatMessage.CHAT_DEFAULT;

				parts.shift();
				break;
		}

		text = parts.join(" ");

		if (this.typingTimer) this.resetTypingTimer();

		if (this.idleTimer) this.resetIdleTimer();

		if (text.length <= this._maxChatLength) {
			if (this.needsStyleUpdate) {
				Nitro.instance.sessionDataManager.sendChatStyleUpdate(
					this.currentStyle
				);

				this.needsStyleUpdate = false;
			}

			this.sendChat(text, chatType, recipientName, this.currentStyle);
		}

		this.isTyping = false;

		if (this.typingStartedSent) this.sendTypingMessage();

		this.typingStartedSent = false;

		this.changeInputValue(append);

		this.lastContent = append;
	}

	public sendChat(
		text: string,
		chatType: number,
		recipientName: string = "",
		styleId: number = 0
	): void {
		if (this.floodBlocked || !this.messageListener) return;

		this.changeInputValue("");

		this.messageListener.processWidgetMessage(
			new RoomWidgetChatMessage(
				RoomWidgetChatMessage.MESSAGE_CHAT,
				text,
				chatType,
				recipientName,
				styleId
			)
		);
	}

	private sendTypingMessage(): void {
		if (this.floodBlocked || !this.messageListener) return;

		this.messageListener.processWidgetMessage(
			new RoomWidgetChatTypingMessage(this.isTyping)
		);
	}

	private onTypingTimerComplete(): void {
		if (this.isTyping) this.typingStartedSent = true;

		this.sendTypingMessage();
	}

	private startFloodInterval(): void {
		this.resetFloodInterval();

		this.floodInterval = setInterval(
			this.decreaseFloodBlockSeconds.bind(this),
			1000
		);
	}

	private resetFloodInterval(): void {
		if (this.floodInterval) {
			clearInterval(this.floodInterval);

			this.floodInterval = null;
		}
	}

	private decreaseFloodBlockSeconds(): void {
		if (!this.floodBlockedSeconds) {
			this.resetFloodInterval();

			this.floodBlocked = false;

			this.changeInputValue("");

			return;
		}

		this.floodBlockedSeconds = this.floodBlockedSeconds - 1;

		this.changeInputValue(
			Nitro.instance.getLocalizationWithParameter(
				"chat.input.alert.flood",
				"time",
				this.floodBlockedSeconds.toString()
			)
		);
	}
}
</script>
