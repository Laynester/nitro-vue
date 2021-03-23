<template src="./frame.template.html"></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DynamicStyle } from "../../DynamicStyle";

@Component
export default class Frame extends Vue {
	$refs: {
		frameComponent: HTMLElement;
		frameHeader: HTMLElement;
		frameHeaderText: HTMLElement;
	};

	@Prop() public title: string;

	@Prop() private titleColour: string;

	@Prop() private frameColour: string;

	@Prop() private type: number;

	public mounted(): void {
		DynamicStyle.getInstance().addElement(
			this.$refs.frameComponent,
			this.frameStyleString
		);

		if (this.title)
			DynamicStyle.getInstance().addElement(
				this.$refs.frameHeader,
				this.frameHeaderStyleString
			);

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
			`frame-header|${this.type}`,
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
			this.frameColour,
		];
	}
}
</script>
