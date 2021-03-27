<template src="./list.template.html"></template>

<script lang="ts">
import { RoomDataParser } from "nitro-renderer/src/nitro/communication/messages/parser/room/data/RoomDataParser";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class ListView extends Vue {
	@Prop() private room: RoomDataParser;

	public data() {
		return {
			colour: null,
		};
	}

	public mounted(): void {
		this.entryBg();
	}

	@Watch("room")
	public updateRoom(old, newv): void {
		if (old !== newv) {
			this.entryBg();
		}
	}

	public visit(): void {
		if (this.room.ownerId !== Nitro.instance.sessionDataManager.userId) {
			if (this.room.habboGroupId !== 0) {
				this.$services.navigatorService.goToPrivateRoom(
					this.room.roomId
				);

				return;
			}

			switch (this.room.doorMode) {
				case RoomDataParser.DOORBELL_STATE:
					this.$services.navigatorService.openRoomDoorbell(this.room);
					return;
				case RoomDataParser.PASSWORD_STATE:
					this.$services.navigatorService.openRoomPassword(this.room);
					return;
			}
		}

		this.$services.navigatorService.goToRoom(this.room.roomId);
	}

	public entryBg(): void {
		const num: number =
			100 * (this.room.userCount / this.room.maxUserCount);

		this.$data.colour = "#999999";

		if (num >= 92) {
			this.$data.colour = "#711410";
		} else if (num >= 80) {
			this.$data.colour = "#ed8338";
		} else if (num >= 50) {
			this.$data.colour = "#e4bf1e";
		} else if (num > 0) {
			this.$data.colour = "#65ac56";
		}
	}
}
</script>
