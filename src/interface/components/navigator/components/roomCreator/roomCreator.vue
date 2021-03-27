<template src="./roomCreator.template.html"></template>

<script lang="ts">
import { IMessageEvent } from "nitro-renderer/src/core/communication/messages/IMessageEvent";
import { RoomCreatedEvent } from "nitro-renderer/src/nitro/communication/messages/incoming/room/engine/RoomCreatedEvent";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { HabboClubLevelEnum } from "nitro-renderer/src/nitro/session/HabboClubLevelEnum";
import { Component, Vue } from "vue-property-decorator";
import { RoomLayout } from "./RoomLayout";

@Component
export default class RoomCreator extends Vue {
	private _roomCreateListener: IMessageEvent = null;

	public data() {
		return {
			form: {
				name: null,
				desc: null,
				layout: null,
			},
			MAX_VISITOR_STEPPER: 10,
			MAX_VISITOR_INCREMENTOR: 5,
			layouts: [],
			maxVisitors: [],
			tradeSettings: [],
		};
	}

	public mounted(): void {
		this.setRoomLayouts();
		this.setMaxVisitors(50);
		this.setTradeSettings();

		this._roomCreateListener = new RoomCreatedEvent(
			this.onRoomCreatedEvent.bind(this)
		);

		Nitro.instance.communication.registerMessageEvent(
			this._roomCreateListener
		);
	}

	private onRoomCreatedEvent(event: RoomCreatedEvent): void {
		this.hideCreator();
	}

	private setRoomLayouts(): void {
		this.$data.layouts = [
			new RoomLayout(HabboClubLevelEnum._Str_3159, 104, "a"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 94, "b"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 36, "c"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 84, "d"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 80, "e"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 80, "f"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 416, "i"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 320, "j"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 448, "k"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 352, "l"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 384, "m"),
			new RoomLayout(HabboClubLevelEnum._Str_3159, 372, "n"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 80, "g"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 74, "h"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 416, "o"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 352, "p"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 304, "q"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 336, "r"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 748, "u"),
			new RoomLayout(HabboClubLevelEnum._Str_2964, 438, "v"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 540, "t"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 512, "w"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 396, "x"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 440, "y"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 456, "z"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 208, "0"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 1009, "1"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 1044, "2"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 183, "3"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 254, "4"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 1024, "5"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 801, "6"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 354, "7"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 888, "8"),
			new RoomLayout(HabboClubLevelEnum._Str_2575, 926, "9"),
		];

		this.$data.form.layout = this.$data.layouts[0].name;
	}

	private setMaxVisitors(count: number): void {
		this.$data.maxVisitors = [];

		let i = this.$data.MAX_VISITOR_STEPPER;

		while (i <= count) {
			this.$data.maxVisitors.push(i);

			i += this.$data.MAX_VISITOR_INCREMENTOR;
		}
	}

	private setTradeSettings(): void {
		this.$data.tradeSettings = [];

		this.$data.tradeSettings.push(
			...[
				"${navigator.roomsettings.trade_not_allowed}",
				"${navigator.roomsettings.trade_not_with_Controller}",
				"${navigator.roomsettings.trade_allowed}",
			]
		);
	}

	public setRoomLayout(name: string): void {
		console.log("setting");
		this.$data.form.layout = name;
	}

	public getRoomLayoutImageUrl(name: string): string {
		let imageUrl = Nitro.instance.getConfiguration<string>("images.url");

		imageUrl += `/navigator/models/model_${name}.png`;

		return imageUrl;
	}

	public hideCreator(): void {
		this.$services.navigatorService.toggleRoomCreator();
	}
}
</script>
