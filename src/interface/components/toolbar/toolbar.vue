<template src="./toolbar.template.html"></template>

<script lang="ts">
import { DesktopViewComposer } from "nitro-renderer/src/nitro/communication/messages/outgoing/desktop/DesktopViewComposer";
import { Nitro } from "nitro-renderer/src/nitro/Nitro";
import { Component, Prop, Vue } from "vue-property-decorator";
import { Services } from "../../services/Services";
import ToolbarIcon from "./components/toolbarIcon.vue";

@Component({
	components: { ToolbarIcon },
})
export default class ToolBar extends Vue {
	@Prop() public isInRoom: boolean = false;

	public handleClick(type: string): void {
		console.log(type);
		switch (type) {
			case "home":
				this.visitHomeRoom();
				break;
			case "exit":
				this.visitDesktop();
				break;
		}
	}

	public visitHomeRoom(): void {
		Services.instance().navigatorService.goToHomeRoom();
	}

	public visitDesktop(): void {
		if (Nitro.instance.roomSessionManager.getSession(-1)) {
			Nitro.instance.communication.connection.send(
				new DesktopViewComposer()
			);

			Nitro.instance.roomSessionManager.removeSession(-1);
		}
	}
}
</script>
