import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ConfigService } from 'src/app/services/config/config.service';
import { AccountService } from 'src/app/services/account/account.service';
import { OnInit, Component, OnDestroy } from '@angular/core';

@Component({
	selector: 'home-page',
	styleUrls: ['./home.page.scss'],
	templateUrl: './home.page.html'
})

export class HomePage implements OnInit, OnDestroy {

	constructor(private title: Title, private config: ConfigService, public account: AccountService) { }

	public icon: string = environment.icon;
	public name: string = environment.appName;
	private observers: any = {};

	ngOnInit(): void {
		this.observers.loaded = this.config.loaded.subscribe(loaded => {
			if (loaded) {
				this.title.setTitle([environment.appName, 'Home'].join(' | '));

				this.icon = environment.icon;
				this.name = environment.appName;
			}
		});
	}

	ngOnDestroy(): void {
		this.observers.loaded.unsubscribe();
	}

}
