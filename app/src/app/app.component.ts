import { MatDrawer } from '@angular/material/sidenav';
import { environment } from 'src/environments/environment';
import { MenuService } from './services/menu/menu.service';
import { SplashScreen } from './libs/splashscreen/splashscreen';
import { ConfigService } from './services/config/config.service';
import { UpdateService } from './libs/update/update.service';
import { AccountService } from './services/account/account.service';
import { SettingsService } from './services/settings/settings.service';
import { LocalstorageService } from './services/localstorage/localstorage.service';
import { OnInit, Component, ViewChild } from '@angular/core';

@Component({
	selector: 'app-root',
	styleUrls: ['./app.component.scss'],
	templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

	@ViewChild(MatDrawer, { static: true }) private drawer?: MatDrawer;
	@ViewChild(SplashScreen, { static: true }) private splashscreen?: SplashScreen;

	constructor(public menu: MenuService, private config: ConfigService, private update: UpdateService, public account: AccountService, private settings: SettingsService, private localstorage: LocalstorageService) { }

	public icon: string = environment.icon;
	public title: any[] = [];
	public badges: any = {};
	public minified: boolean = JSON.parse(this.localstorage.get('minified', false));
	public authenticated?: boolean;

	public toggle() {
		this.minified = !this.minified;
		this.localstorage.set('minified', this.minified);
	}

	private async initialize() {
		await this.splashscreen?.show();

		await this.config.init();
		await this.update.init();
		await this.settings.init();

		await this.splashscreen?.hide();
	}

	ngOnInit(): void {
		this.menu.events.subscribe(event => {
			switch (event) {
				case ('open'):
					this.drawer?.open();
					break;
				case ('close'):
					this.drawer?.close();
					break;
				case ('toggle'):
					this.drawer?.toggle();
					break;
			}
		});

		this.menu.badge.subscribe((data: any) => {
			Object.keys(data).map(key => {
				(this.badges as any)[key] = data[key];
			});
		});

		this.config.loaded.subscribe(async loaded => {
			if (loaded) {
				this.icon = environment.icon;
				await this.account.init();
			}
		});

		this.account.authenticated.subscribe(authenticated => {
			this.authenticated = authenticated;
			if (!authenticated) {
				this.drawer?.close();
			}
		});

		this.initialize();
	}

}
