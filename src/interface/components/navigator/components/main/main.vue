<template src="./main.template.html"></template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";

@Component
export default class NavigatorMain extends Vue {
	public beforeMount(): void {
		console.log(this.$services.navigatorService);
	}

	public counterAdd(): void {
		this.$services.navigatorService.counterAdd();
	}
}
</script>
