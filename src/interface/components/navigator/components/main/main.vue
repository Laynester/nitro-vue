<template src="./main.template.html"></template>

<script lang="ts">
import { NavigatorTopLevelContext } from "nitro-renderer/src/nitro/communication/messages/parser/navigator/utils/NavigatorTopLevelContext";
import { Component, Vue } from "vue-property-decorator";
import SearchResult from "../searchResult/searchResult.vue";

@Component({
	components: { SearchResult },
})
export default class NavigatorMain extends Vue {
	public beforeMount(): void {
		this.prepareNavigator();
	}

	private prepareNavigator(): void {
		if (!this.$services.navigatorService.isLoaded)
			return this.$services.navigatorService.loadNavigator();

		this.$services.navigatorService.search();
	}

	public setCurrentContext(context: NavigatorTopLevelContext): void {
		this.$services.navigatorService.setCurrentContext(context);

		this.$services.navigatorService.clearSearch();
	}

	public hideNavigator(): void {
		this.$services.settingService.toggleNavigator();
	}
}
</script>
