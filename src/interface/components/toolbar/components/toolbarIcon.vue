<template src="./toolbarIcon.template.html"></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ToolbarIcon extends Vue {
	$refs: {
		selfIcon: HTMLElement;
	};

	@Prop() private type!: string;

	@Prop() private frames!: number;

	public currentFrame: number = 0;

	private ticker: ReturnType<typeof setTimeout>;

	private tickerSpeed: number = 75;

	private hovering: boolean = false;

	public mounted(): void {
		this.currentFrame = 1;
	}

	public mouseOver(event: Event): void {
		this.hovering = true;

		this.ticker = setTimeout(this.add, this.tickerSpeed);
	}

	public mouseOut(event: Event): void {
		this.hovering = false;

		this.ticker = setTimeout(this.subtract, this.tickerSpeed);
	}

	public add(): void {
		if (!this.hovering) return;

		if (this.currentFrame == this.frames) return;

		this.currentFrame += 1;

		this.ticker = setTimeout(this.add, this.tickerSpeed);
	}

	public subtract(): void {
		if (this.hovering) return;

		if (this.currentFrame == 1) return;

		this.currentFrame -= 1;

		this.ticker = setTimeout(this.subtract, this.tickerSpeed);
	}

	public click(): void {
		this.$services.settingService.handleClick(this.type);
	}

	public tooltip(): string {
		let name = "";
		switch (this.type) {
			default:
				name = this.type;
				break;
			case "home":
				name = "exitroom.home";
				break;
			case "exit":
				name = "exitroom.hotelview";
				break;
			case "console":
				name = "friendlist";
				break;
			case "messenger":
			case "messenger-unread":
				name = "messenger";
		}
		return "toolbar.icon.label." + name;
	}
}
</script>
