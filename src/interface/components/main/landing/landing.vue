<template src="./landing.template.html"></template>

<script lang="ts">
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { Component, Vue } from "vue-property-decorator";

@Component
export default class Landing extends Vue {
	public backgroundColour: string = "#000";
	public background: string;
	public sun: string;
	public drape: string;
	public left: string;
	public right: string;
	public rightRepeat: string;

	public mounted(): void {
		this.background = Nitro.instance.core.configuration.interpolate(
			Nitro.instance.getConfiguration("hotelview.images")["background"]
		);
		this.backgroundColour = Nitro.instance.getConfiguration(
			"hotelview.images"
		)["background.colour"];
		this.sun = Nitro.instance.core.configuration.interpolate(
			Nitro.instance.getConfiguration("hotelview.images")["sun"]
		);
		this.drape = Nitro.instance.core.configuration.interpolate(
			Nitro.instance.getConfiguration("hotelview.images")["drape"]
		);
		this.left = Nitro.instance.core.configuration.interpolate(
			Nitro.instance.getConfiguration("hotelview.images")["left"]
		);
		this.right = Nitro.instance.core.configuration.interpolate(
			Nitro.instance.getConfiguration("hotelview.images")["right"]
		);
		this.rightRepeat = Nitro.instance.core.configuration.interpolate(
			Nitro.instance.getConfiguration("hotelview.images")["right.repeat"]
		);
	}
}
</script>
