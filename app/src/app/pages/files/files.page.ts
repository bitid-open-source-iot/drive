import { App } from 'src/app/classes/app';
import { File } from 'src/app/classes/file';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AppsService } from 'src/app/services/apps/apps.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilesService } from 'src/app/services/files/files.service';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigService } from 'src/app/services/config/config.service';
import { FiltersService } from 'src/app/services/filters/filters.service';
import { OptionsService } from 'src/app/libs/options/options.service';
import { ConfirmService } from 'src/app/libs/confirm/confirm.service';
import { SearchComponent } from 'src/app/libs/search/search.component';
import { MatTableDataSource } from '@angular/material/table';
import { OnInit, Component, OnDestroy, ViewChild, HostListener } from '@angular/core';

/* --- DIALOGS --- */
import { FilesFilterDialog } from './filter/filter.dialog';

@Component({
	selector: 'files-page',
	styleUrls: ['./files.page.scss'],
	templateUrl: './files.page.html'
})

export class FilesPage implements OnInit, OnDestroy {

	@ViewChild(MatSort, { static: true }) private sort: MatSort = new MatSort();
	@ViewChild(MatPaginator, { static: true }) private paginator?: MatPaginator;
	@ViewChild(SearchComponent, { static: true }) private search?: SearchComponent;

	constructor(public apps: AppsService, private toast: ToastService, private filters: FiltersService, private sheet: OptionsService, private config: ConfigService, private dialog: MatDialog, private router: Router, private confirm: ConfirmService, private service: FilesService) { }

	@HostListener('window:resize', ['$event']) resize(event: any) {
		if (window.innerWidth <= 600) {
			this.table.paginator = null;
		} else {
			(this.table as any).paginator = this.paginator;
		};
	}

	public filter: any = this.filters.get({
		appId: []
	});
	public table: MatTableDataSource<File> = new MatTableDataSource<File>();
	public columns: string[] = ['filename', 'size', 'appId'];
	public loading: boolean = false;
	private observers: any = { };

	private async load() {
		this.loading = true;

		const response = await this.apps.list({
			filter: [
				'name',
				'icon',
				'appId'
			]
		});

		if (response.ok) {
			this.apps.data = response.result.map((o: any) => new App(o));
		} else {
			this.apps.data = [];
		};

		this.loading = false;
	}

	private async list() {
		this.loading = true;

		const response = await this.service.list({
			filter: [
				'size',
				'role',
				'appId',
				'token',
				'fileId',
				'filename',
				'uploadDate',
				'serverDate',
				'contentType',
				'organizationOnly'
			],
			appId: this.filter.appId
		});

		if (response.ok) {
			this.table.data = response.result.map((o: any) => new File(o));
		} else {
			this.table.data = [];
		}

		this.loading = false;
	}

	public async OpenFilter() {
		const dialog = await this.dialog.open(FilesFilterDialog, {
			data: this.filter,
			panelClass: 'filter-dialog'
		});

		await dialog.afterClosed().subscribe(async result => {
			if (result) {
				this.filter = result;
				this.filters.update(result);
				this.list();
			};
		});
	}

	public async options(file: File) {
		this.sheet.show({
			role: file.role,
			title: file.filename,
			options: [
				// {
				// 	icon: 'visibility',
				// 	title: 'View',
				// 	danger: false,
				// 	handler: () => {
				// 		this.router.navigate(['/files', 'viewer'], {
				// 			queryParams: {
				// 				fileId: file.fileId
				// 			}
				// 		});
				// 	},
				// 	disabled: []
				// },
				{
					icon: 'edit',
					title: 'Edit',
					danger: false,
					handler: () => {
						this.router.navigate(['/files', 'editor'], {
							queryParams: {
								mode: 'update',
								fileId: file.fileId
							}
						});
					},
					disabled: []
				},
				{
					icon: 'people',
					title: 'Manage Subscribers',
					danger: false,
					handler: () => {
						this.router.navigate(['subscribers'], {
							queryParams: {
								id: file.fileId,
								type: 'file'
								// fileId: file.fileId
							}
						});
					},
					disabled: [0, 1, 2, 3]
				},
				{
					icon: 'delete',
					title: 'Delete',
					danger: true,
					handler: async () => {
						this.confirm.show({
							message: 'Are you sure you want to delete ' + file.filename,
							handler: async () => {
								this.loading = true;

								const response = await this.service.delete({
									fileId: file.fileId
								});

								if (response.ok) {
									this.toast.success('Deleted ' + file.filename + '!');
									// this.table.data do for loop and splice correct file
									for (let i = 0; i < this.table.data.length; i++) {
										if (this.table.data[i].fileId == file.fileId) {
											this.table.data.splice(i, 1);
											break;
										}
									}
									this.table.data = this.table.data.map(o => new File(o));
								} else {
									this.toast.error(response.error.message);
								};

								this.loading = false;
							}
						});
					},
					disabled: []
				}
			]
		});
	}

	ngOnInit(): void {
		this.table.sort = this.sort;
		
		if (window.innerWidth <= 600) {
			this.table.paginator = null;
		} else {
			(this.table as any).paginator = this.paginator;
		};

		this.observers.loaded = this.config.loaded.subscribe(async (loaded: boolean) => {
			if (loaded) {
				await this.load();
				await this.list();
			};
		});

		this.observers.search = this.search?.change.subscribe((value: string) => {
			(this.table as any).filter = value;
		});

	}

	ngOnDestroy(): void {
		this.observers.loaded.unsubscribe();
		this.observers.search.unsubscribe();
	}

}
