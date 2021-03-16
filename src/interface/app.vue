<template src="./app.template.html"></template>

<script lang="ts">
import "./assets/scss/app.scss";
import { Component, Vue } from "vue-property-decorator";
import Main from "./components/main/main.vue";

import { Nitro } from "@/client/nitro/Nitro";
import { NitroEvent } from "@/client/core/events/NitroEvent";
import { WebGL } from "@/client/nitro/utils/WebGL";
import { LegacyExternalInterface } from "@/client/nitro/externalInterface/LegacyExternalInterface";
import { NitroCommunicationDemoEvent } from "@/client/nitro/communication/demo/NitroCommunicationDemoEvent";
import { NitroLocalizationEvent } from "@/client/nitro/localization/NitroLocalizationEvent";
import { ConfigurationEvent } from "@/client/core/configuration/ConfigurationEvent";
import { RoomEngineEvent } from "@/client/nitro/room/events/RoomEngineEvent";

@Component({
	components: {
		Main,
	},
})
export default class App extends Vue {
	private _connectionTimeout: ReturnType<typeof setTimeout> | undefined;

	public message: string = "Getting Ready";
	public percentage: number = 0;
	public hideProgress: boolean = true;
	public isLocalizationReady: boolean = false;
	public isAvatarRenderReady: boolean = false;
	public isError: boolean = false;
	private isReady: boolean = false;

	public mounted(): void {
		console.log("here mounted");
		this.onNitroEvent = this.onNitroEvent.bind(this);
		this.init();
	}

	public init(): void {
		//@ts-ignore
		if (!window.NitroConfig) throw new Error("NitroConfig is not defined!");

		if (!WebGL.isWebGLAvailable()) {
			this.onNitroEvent(new NitroEvent(Nitro.WEBGL_UNAVAILABLE));

			return;
		}

		if (!Nitro.instance) Nitro.bootstrap();

		Nitro.instance.events.addEventListener(
			NitroCommunicationDemoEvent.CONNECTION_HANDSHAKING,
			this.onNitroEvent
		);
		Nitro.instance.events.addEventListener(
			NitroCommunicationDemoEvent.CONNECTION_HANDSHAKE_FAILED,
			this.onNitroEvent
		);
		Nitro.instance.events.addEventListener(
			NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED,
			this.onNitroEvent
		);
		Nitro.instance.events.addEventListener(
			NitroCommunicationDemoEvent.CONNECTION_ERROR,
			this.onNitroEvent
		);
		Nitro.instance.events.addEventListener(
			NitroCommunicationDemoEvent.CONNECTION_CLOSED,
			this.onNitroEvent
		);
		Nitro.instance.roomEngine.events.addEventListener(
			RoomEngineEvent.ENGINE_INITIALIZED,
			this.onNitroEvent
		);
		Nitro.instance.localization.events.addEventListener(
			NitroLocalizationEvent.LOADED,
			this.onNitroEvent
		);
		Nitro.instance.core.configuration.events.addEventListener(
			ConfigurationEvent.LOADED,
			this.onNitroEvent
		);
		Nitro.instance.core.configuration.events.addEventListener(
			ConfigurationEvent.FAILED,
			this.onNitroEvent
		);

		Nitro.instance.core.configuration.init();

		this._connectionTimeout = setTimeout(
			this.onConnectionTimeout,
			15 * 1000
		);
	}

	public beforeDestroy() {
		Nitro.instance.events.removeEventListener(
			NitroCommunicationDemoEvent.CONNECTION_HANDSHAKING,
			this.onNitroEvent
		);
		Nitro.instance.events.removeEventListener(
			NitroCommunicationDemoEvent.CONNECTION_HANDSHAKE_FAILED,
			this.onNitroEvent
		);
		Nitro.instance.events.removeEventListener(
			NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED,
			this.onNitroEvent
		);
		Nitro.instance.events.removeEventListener(
			NitroCommunicationDemoEvent.CONNECTION_ERROR,
			this.onNitroEvent
		);
		Nitro.instance.events.removeEventListener(
			NitroCommunicationDemoEvent.CONNECTION_CLOSED,
			this.onNitroEvent
		);
		Nitro.instance.localization.events.removeEventListener(
			NitroLocalizationEvent.LOADED,
			this.onNitroEvent
		);
		Nitro.instance.core.configuration.events.removeEventListener(
			ConfigurationEvent.LOADED,
			this.onNitroEvent
		);
		Nitro.instance.core.configuration.events.removeEventListener(
			ConfigurationEvent.FAILED,
			this.onNitroEvent
		);

		clearTimeout(this._connectionTimeout);
	}

	private getPreloadAssetUrls(): string[] {
		const urls: string[] = [];

		const assetUrls = Nitro.instance.getConfiguration<string[]>(
			"preload.assets.urls"
		);

		if (assetUrls && assetUrls.length) {
			for (const url of assetUrls) {
				urls.push(Nitro.instance.core.configuration.interpolate(url));
			}
		}

		return urls;
	}

	private onNitroEvent(event: NitroEvent): void {
		if (!event) return;

		switch (event.type) {
			case ConfigurationEvent.LOADED:
				Nitro.instance.localization.init();
				return;
			case ConfigurationEvent.FAILED:
				this.isError = true;
				this.message = "Configuration Failed";
				return;
			case Nitro.WEBGL_UNAVAILABLE:
				this.isError = true;
				this.message = "WebGL Required";
				return;
			case Nitro.WEBGL_CONTEXT_LOST:
				this.isError = true;
				this.message = "WebGL Context Lost - Reloading";

				setTimeout(() => location.reload(), 1500);
				return;
			case NitroCommunicationDemoEvent.CONNECTION_HANDSHAKING:
				clearTimeout(this._connectionTimeout);

				this._connectionTimeout = null;
				return;
			case NitroCommunicationDemoEvent.CONNECTION_HANDSHAKE_FAILED:
				this.isError = true;
				this.message = "Handshake Failed";
				return;
			case NitroCommunicationDemoEvent.CONNECTION_AUTHENTICATED:
				this.message = "Finishing Up";
				Nitro.instance.init();

				clearTimeout(this._connectionTimeout);

				this._connectionTimeout = null;
				return;
			case NitroCommunicationDemoEvent.CONNECTION_ERROR:
				this.isError = true;
				this.message = "Connection Error";
				return;
			case NitroCommunicationDemoEvent.CONNECTION_CLOSED:
				if (Nitro.instance.roomEngine)
					Nitro.instance.roomEngine.dispose();

				this.isError = true;
				this.message = "Connection Closed";

				LegacyExternalInterface.call(
					"disconnect",
					-1,
					"client.init.handshake.fail"
				);
				return;
			case RoomEngineEvent.ENGINE_INITIALIZED:
				this.isReady = true;
				return;
			case NitroLocalizationEvent.LOADED:
				Nitro.instance.core.asset.downloadAssets(
					this.getPreloadAssetUrls(),
					(status: boolean) => {
						if (status) {
							this.message = "Connecting";

							Nitro.instance.communication.init();
						} else {
							this.isError = true;
							this.message = "Assets Failed";
						}
					}
				);
				return;
		}
	}

	private onConnectionTimeout(): void {
		LegacyExternalInterface.call(
			"logDebug",
			"TcpAuth control socket security error"
		);
	}
}
</script>
