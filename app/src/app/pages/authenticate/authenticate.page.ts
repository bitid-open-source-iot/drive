import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ConfigService } from 'src/app/services/config/config.service';
import { AccountService } from 'src/app/services/account/account.service';
import { LocalstorageService } from 'src/app/services/localstorage/localstorage.service';
import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, Component, OnDestroy } from '@angular/core';

@Component({
	selector: 'authenticate-page',
	styleUrls: ['./authenticate.page.scss'],
	templateUrl: './authenticate.page.html'
})

export class AuthenticatePage implements OnInit, OnDestroy {

	constructor(private title: Title, private route: ActivatedRoute, private config: ConfigService, private router: Router, private service: AccountService, private localstorage: LocalstorageService) { }

	public error?: boolean;
	private params: any = {};
	public loading?: boolean;
	private observers: any = {};

	public async retrieve() {
		this.error = false;
		this.loading = true;

		const response = await this.service.retrieve(this.params);

		if (response.ok) {
			this.localstorage.setObject('token', response.result.token);
			this.router.navigate(['/files']);
			await this.service.init();
		} else {
			this.error = true;
		}

		this.loading = false;
	}

	ngOnInit(): void {
		this.observers.config = this.config.loaded.subscribe(loaded => {
			if (loaded) {
				const params = this.route.snapshot.queryParams;
				this.params = {
					email: params.email,
					tokenId: params.tokenId
				};
				this.retrieve();
				this.title.setTitle([environment.appName, '|', 'Authenticate'].join(' '));
			}
		});
	}

	ngOnDestroy(): void {
		this.observers.config.unsubscribe();
	}

}
