import { Meta } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalstorageService } from '../localstorage/localstorage.service';

@Injectable({
	providedIn: 'root'
})

export class SettingsService {

	public theme: BehaviorSubject<string> = new BehaviorSubject<string>('light');
	public paging: BehaviorSubject<number> = new BehaviorSubject<number>(10);
	public notifications: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(private meta: Meta, private localstorage: LocalstorageService) {
		const settings = this.localstorage.getObject('settings', {
			theme: 'light',
			paging: 10,
			notifications: false
		});
		this.theme.subscribe(value => {
			if (typeof (value) != 'undefined' && value !== null) {
				settings.theme = value;
				if (value == 'dark') {
					this.meta.updateTag({
						name: 'theme-color',
						content: '#000000'
					});
					document.body.classList.add('dark-mode');
				} else {
					this.meta.updateTag({
						name: 'theme-color',
						content: '#1976d2'
					});
					document.body.classList.remove('dark-mode');
				}
				this.localstorage.setObject('settings', settings);
			}
		});
		this.paging.subscribe(value => {
			if (typeof (value) != 'undefined' && value !== null) {
				settings.paging = value;
				this.localstorage.setObject('settings', settings);
			}
		});
		this.notifications.subscribe(value => {
			if (typeof (value) != 'undefined' && value !== null) {
				settings.notifications = value;
				if (value) {
					Notification.requestPermission((status) => {
						new Notification('Hey!', {
							body: 'You enabled notifications!'
						});
					});
				}
				this.localstorage.setObject('settings', settings);
			}
		});
	}

	public async init() {
		const settings = this.localstorage.getObject('settings', {
			theme: 'light',
			paging: 10,
			mapType: 'terrain',
			notifications: false
		});

		this.theme.next(settings.theme);
		this.paging.next(parseInt(settings.paging));
		this.notifications.next(settings.notifications);

		if (settings.notifications) {
			Notification.requestPermission((status) => {
				if (status == 'granted') {
					new Notification('Hey!', {
						body: 'You enabled notifications!'
					});
				}
			});
		}

		if (settings.theme == 'dark') {
			this.meta.updateTag({
				name: 'theme-color',
				content: '#000000'
			});
			document.body.classList.add('dark-mode');
		} else {
			this.meta.updateTag({
				name: 'theme-color',
				content: '#1976d2'
			});
			document.body.classList.remove('dark-mode');
		}
	}

}
