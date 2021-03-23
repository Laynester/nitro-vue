<template src="./border.template.html"></template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { DynamicStyle } from "../../DynamicStyle";

@Component
export default class Border extends Vue {
	$refs: {
		borderContainer: HTMLElement;
	};

	@Prop() private type: number;

	@Prop() private colour: string;

	public mounted(): void {
		DynamicStyle.getInstance().addElement(
			this.$refs.borderContainer,
			this.borderStyleString
		);
	}

	public beforeDestroy(): void {
		DynamicStyle.getInstance().removeElement(this.$refs.borderContainer);
	}

	public get borderStyleString(): string[] {
		return [
			`border|${this.type}`,
			`borders/border-${this.type}.png`,
			this.colour,
		];
	}
}
</script>
