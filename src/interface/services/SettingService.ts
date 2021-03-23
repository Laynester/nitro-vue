import { DesktopViewComposer } from 'nitro-renderer/src/nitro/communication/messages/outgoing/desktop/DesktopViewComposer';
import { Nitro } from 'nitro-renderer/src/nitro/Nitro';
import Vue from 'vue';
import { Services } from './Services';

export class SettingService
{

    private _states = Vue.observable({
       navigatorVisible: false,
    });

    public handleClick(type: string): void
    {
        switch (type) {
            case "home":
                this.visitHomeRoom();
                break;
            case "exit":
                this.visitDesktop();
                break;
            case "navigator":
                this.toggleNavigator();
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

    public toggleNavigator(): void
    {
        this._states.navigatorVisible = !this._states.navigatorVisible;
    }

    public get navigatorVisible(): boolean
    {
        return this._states.navigatorVisible;
    }
}
