import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilesService } from 'src/app/services/files/files.service';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigService } from 'src/app/services/config/config.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmService } from 'src/app/libs/confirm/confirm.service';
import { FiltersService } from 'src/app/services/filters/filters.service';
import { SettingsService } from 'src/app/services/settings/settings.service';
import { UserEditorDialog } from './editor/editor.dialog';
import { MatTableDataSource } from '@angular/material/table';
import { OnInit, Component, OnDestroy, ViewChild } from '@angular/core';

@Component({
	selector: 'subscribers-page',
	styleUrls: ['./subscribers.page.scss'],
	templateUrl: './subscribers.page.html'
})

export class SubscribersPage implements OnInit, OnDestroy {

	@ViewChild(MatPaginator, { static: true }) private paginator?: MatPaginator;

	constructor(private files: FilesService, private config: ConfigService, private dialog: MatDialog, private toast: ToastService, private filters: FiltersService, private route: ActivatedRoute, private confirm: ConfirmService, private settings: SettingsService) { }

	public id?: string;
	public role?: number;
	public type?: string;
	public table: MatTableDataSource<any> = new MatTableDataSource<any>();
	public filter: any = this.filters.get({
		page: 0,
		search: ''
	});
	public columns: string[] = ['owner', 'email', 'role', 'options'];
	public loading?: boolean;
	private observers: any = {};

	private async get() {
		this.loading = true;

		const params: any = {
			filter: [
				'role',
				'users',
				'description'
			]
		};
		let crumb: string;
		let service: any;

		switch (this.type) {
			case ('file'):
				crumb = 'file Subscribers',
					service = this.files;
				params.fileId = this.id;
				break;
		}

		const response = await service.get(params);

		if (response.ok) {
			this.role = response.result.role;
			this.table.data = response.result.users;
			(this.paginator as any).pageIndex = this.filter.page;
		
		} else {
			this.table.data = [];
		}

		this.loading = false;
	}

	private async share(user: any) {
		this.loading = true;

		const params: any = {
			role: user.role,
			email: user.email
		};
		let service: any;

		switch (this.type) {
			case ('file'):
				service = this.files;
				params.fileId = this.id;
				break;
		}

		const response = await service.share(params);

		if (response.ok) {
			this.table.data.push(user);
			this.table.data = JSON.parse(JSON.stringify(this.table.data));
			this.toast.success('User was shared!');
		} else {
			this.toast.error(response.error.message);
		}

		this.loading = false;
	}

	public async editor(user?: any) {
		const dialog = await this.dialog.open(UserEditorDialog, {
			data: user,
			panelClass: 'user-editor-dialog'
		});

		dialog.afterClosed().subscribe(result => {
			if (result) {
				if (user) {
					this.updatesubscriber(user.email, result.role);
				} else {
					this.share(result);
				}
			}
		});
	}

	public async unsubscribe(email: string) {
		this.loading = true;

		const params: any = {
			email
		};
		let service: any;

		switch (this.type) {
			case ('file'):
				service = this.files;
				params.fileId = this.id;
				break;
		}

		const response = await service.unsubscribe(params);

		if (response.ok) {
			for (let i = 0; i < this.table.data.length; i++) {
				if (this.table.data[i].email == email) {
					this.table.data.splice(i, 1);
				}
			}
			this.table.data = JSON.parse(JSON.stringify(this.table.data));
			this.toast.success('User was removed!');
		} else {
			this.toast.error(response.error.message);
		}

		this.loading = false;
	}

	public async changeowner(email: string) {
		this.confirm.show({
			message: 'Are you sure you want make ' + email + ' the owner?',
			handler: async () => {
				this.loading = true;

				const params: any = {
					email
				};
				let service: any;

				switch (this.type) {
					case ('file'):
						service = this.files;
						params.fileId = this.id;
						break;
				}

				const response = await service.changeowner(params);

				if (response.ok) {
					this.table.data.map(user => {
						if (user.role == 5) {
							user.role = 4;
						}
					});
					this.table.data.map(user => {
						if (user.email == email) {
							user.role = 5;
						}
					});
					this.role = 4;
					this.table.data = JSON.parse(JSON.stringify(this.table.data));
					this.toast.success('Ownership was changed!');
				} else {
					this.toast.error(response.error.message);
				}

				this.loading = false;
			}
		});
	}

	public async updatesubscriber(email: string, role: number) {
		this.loading = true;

		const params: any = {
			role,
			email
		};
		let service: any;

		switch (this.type) {
			case ('file'):
				service = this.files;
				params.fileId = this.id;
				break;
		}

		const response = await service.updatesubscriber(params);

		if (response.ok) {
			this.toast.success('User was updated!');
		} else {
			this.toast.error(response.error.message);
		}

		this.loading = false;
	}

	ngOnInit(): void {
		(this.table as any).paginator = this.paginator;

		this.observers.page = this.paginator?.page.subscribe(page => {
			this.filter.page = page.pageIndex;
			this.filters.update(this.filter);
		});

		this.observers.loaded = this.config.loaded.subscribe(loaded => {
			if (loaded) {
				const params = this.route.snapshot.queryParams;
				this.id = params.id;
				this.type = params.type;
				this.get();
			}
		});

		this.observers.paging = this.settings.paging.subscribe(paging => {
			if (paging) {
				(this.paginator as any).pageSize = paging;
			}
		});
	}

	ngOnDestroy(): void {
		Object.keys(this.observers).filter(key => typeof (this.observers[key]) != 'undefined' && this.observers[key] != null).map(key => this.observers[key].unsubscribe());
	}

}
