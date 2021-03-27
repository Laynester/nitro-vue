<template src="./searchResult.template.html"></template>

<script lang="ts">
import { NavigatorSearchResultList } from "nitro-renderer/src/nitro/communication/messages/parser/navigator/utils/NavigatorSearchResultList";
import { Component, Prop, Vue } from "vue-property-decorator";
import { NavigatorDisplayMode } from "../../common/NavigatorDisplayMode";
import List from "../searchItem/List/list.vue";

@Component({
	components: { List },
})
export default class HelloWorld extends Vue {
	@Prop() private result: NavigatorSearchResultList;

	public data(): Object {
		return {
			displayMode: this.result.mode,
			collapsed: this.result.closed,
		};
	}

	public toggleCollapsed(): void {
		this.$data.collapsed = !this.$data.collapsed;
	}

	public get resultCode(): string {
		let name = this.result.code;

		if (
			(!name || name.length == 0) &&
			this.result.data &&
			this.result.data.length > 0
		) {
			return this.result.data;
		}

		if (this.result.code.startsWith("${")) {
			name = name.substr(2, name.length - 3);
		} else {
			name = "navigator.searchcode.title." + name;
		}

		return name;
	}

	public toggleListMode(): void {
		if (this.$data.displayMode === NavigatorDisplayMode.FORCED_THUMBNAILS)
			return;

		if (this.$data.displayMode === NavigatorDisplayMode.LIST) {
			this.$data.displayMode = NavigatorDisplayMode.THUMBNAILS;

			return;
		}

		this.$data.displayMode = NavigatorDisplayMode.LIST;
	}

	public get displayComponent(): string {
		let component = "";

		switch (this.$data.displayMode) {
			case NavigatorDisplayMode.LIST:
				component = "List";
				break;
		}

		return component;
	}
}
</script>
