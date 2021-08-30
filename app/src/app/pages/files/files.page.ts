import { File } from 'src/app/classes/file';
import { Router } from '@angular/router';
import { MatSort } from '@angular/material/sort';
import { ToastService } from 'src/app/services/toast/toast.service';
import { FilesService } from 'src/app/services/files/files.service';
import { MatPaginator } from '@angular/material/paginator';
import { ConfigService } from 'src/app/services/config/config.service';
import { OptionsService } from 'src/app/libs/options/options.service';
import { ConfirmService } from 'src/app/libs/confirm/confirm.service';
import { SearchComponent } from 'src/app/libs/search/search.component';
import { MatTableDataSource } from '@angular/material/table';
import { OnInit, Component, OnDestroy, ViewChild } from '@angular/core';


@Component({
	selector: 'files-page',
	styleUrls: ['./files.page.scss'],
	templateUrl: './files.page.html'
})

export class FilesPage implements OnInit, OnDestroy {

	@ViewChild(MatSort, { static: true }) private sort?: MatSort;
	@ViewChild(MatPaginator, { static: true }) private paginator?: MatPaginator;
	@ViewChild(SearchComponent, { static: true }) private search?: SearchComponent;

	constructor(private toast: ToastService, private sheet: OptionsService, private config: ConfigService, private router: Router, private confirm: ConfirmService, private service: FilesService) { }

	public table: MatTableDataSource<any> = new MatTableDataSource<any>();
	public columns: string[] = ['filename', 'size'];
	public loading?: boolean;
	private observers: any = { };

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
			]
		});

		if (response.ok) {
			this.table.data = response.result.map((o: any) => new File(o));
		} else {
			this.table.data = [];
		}

		this.loading = false;
	};

	public async options(file: File) {
		this.sheet.show({
			role: 0,
			title: file.filename,
			options: [
				{
					icon: 'visibility',
					title: 'View',
					danger: false,
					handler: () => {
						this.router.navigate(['/files', 'viewer'], {
							queryParams: {
								fileId: file.fileId
							}
						});
					},
					disabled: []
				},
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
									for(let i = 0; i < this.table.data.length; i++){
										if(this.table.data[i].fileId == file.fileId) {
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
		(this.table as any).sort = this.sort;
		(this.table as any).paginator = this.paginator;

		this.observers.loaded = this.config.loaded.subscribe((loaded: boolean) => {
			if (loaded) {
				this.list();
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
