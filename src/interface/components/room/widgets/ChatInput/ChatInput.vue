<template>
	<div>
		hello
		<input type="text" v-model="inputValue" />
	</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { RoomWidgetFloodControlEvent } from "../events/RoomWidgetFloodControlEvent";
import { RoomWidgetChatInputContentUpdateEvent } from "../events/RoomWidgetChatInputContentUpdateEvent";
import { RoomWidgetRoomObjectUpdateEvent } from "../events/RoomWidgetRoomObjectUpdateEvent";
import { RoomWidgetUpdateInfostandUserEvent } from "../events/RoomWidgetUpdateInfostandUserEvent";
import { IEventDispatcher } from "nitro-renderer/src/core/events/IEventDispatcher";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { RoomWidget } from "../RoomWidget";

@Component
export default class ChatInput extends RoomWidget {
	public selectedUsername: string = "";

	public inputValue: string = "";

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
}
</script>
