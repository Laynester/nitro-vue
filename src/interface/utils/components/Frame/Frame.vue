<template src="./frame.template.html"></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DynamicStyle } from "../../DynamicStyle";

@Component
export default class Frame extends Vue {
	$refs: {
		frameComponent: HTMLElement;
		handle: HTMLElement;
		frameHeader: HTMLElement;
		frameHeaderText: HTMLElement;
	};

	@Prop() public title: string;

	@Prop() private titleColour: string;

	@Prop() private frameColour: string;

	@Prop() private type: number;

	@Prop() public closeable: boolean;

	@Prop() private closeCallback: Function;

	@Prop() private resizable: boolean;

	@Prop() public center: boolean;

	private static dis: HTMLElement[];

	public data() {
		return {
			resize: false,
			draggable: {
				handle: null,
				center: false,
			},
		};
	}

	public mounted(): void {
		Frame.dis = [];

		if (this.center !== undefined)
			this.$data.draggable.center = this.center;

		if (this.resizable !== undefined) this.$data.resize = this.resizable;

		this.$data.draggable.onDragStart = (e) => {
			if (!this.title) {
				this.$refs.frameComponent.setAttribute(
					"draggable",
					false.toString()
				);
				return (this.$data.draggable.stopDragging = true);
			} else {
				this.$refs.frameComponent.setAttribute(
					"dragging",
					true.toString()
				);
			}
		};

		this.$data.draggable.onDragStop = (e) => {
			this.$refs.frameComponent.setAttribute(
				"dragging",
				false.toString()
			);
		};

		DynamicStyle.getInstance().addElement(
			this.$refs.frameComponent,
			this.frameStyleString
		);

		if (this.title) {
			DynamicStyle.getInstance().addElement(
				this.$refs.frameHeader,
				this.frameHeaderStyleString
			);

			this.$data.draggable.handle = this.$refs.handle;
			this.$refs.frameComponent.addEventListener(
				"mousedown",
				this.bringToTop
			);
		}

		if (this.titleColour)
			DynamicStyle.getInstance().addElement(
				this.$refs.frameHeaderText,
				this.frameHeaderTextString
			);
	}

	public beforeDestroy(): void {
		DynamicStyle.getInstance().removeElement(this.$refs.frameComponent);

		if (this.title)
			DynamicStyle.getInstance().removeElement(this.$refs.frameHeader);

		if (this.titleColour)
			DynamicStyle.getInstance().removeElement(
				this.$refs.frameHeaderText
			);
	}

	public closeWindow(): void {
		if (this.closeable && this.closeCallback) this.closeCallback();
	}

	public mouseDown(e): void {
		document.addEventListener("mousemove", this.mouseMove);
		document.addEventListener("mouseup", this.cancelMove);
	}

	public mouseMove(e): void {
		this.$refs.frameComponent.style.width =
			e.clientX - this.$refs.frameComponent.offsetLeft + "px";
		this.$refs.frameComponent.style.height =
			e.clientY - this.$refs.frameComponent.offsetTop + "px";
	}

	public cancelMove(e): void {
		document.removeEventListener("mousemove", this.mouseMove, false);
		document.removeEventListener("mouseup", this.cancelMove, false);
	}

	public bringToTop(e): void {
		return DynamicStyle.getInstance().bringToTop(this.$refs.frameComponent);
	}

	public get frameStyleString(): string[] {
		return [
			`frame|${this.type}`,
			`skin-${this.type}/${
				DynamicStyle.getInstance().frames[this.type][0]
			}`,
			this.frameColour,
		];
	}

	public get frameHeaderStyleString(): string[] {
		return [
			`frame-header${this.titleColour ? "-bg" : ""}|${this.type}`,
			`skin-${this.type}/${
				DynamicStyle.getInstance().frames[this.type][1]
			}`,
			this.frameColour,
		];
	}

	public get frameHeaderTextString(): string[] {
		return [
			`frame-header-text|${this.type}`,
			`skin-${this.type}/${
				DynamicStyle.getInstance().frames[this.type][2]
			}`,
			this.titleColour,
		];
	}
}
</script>
