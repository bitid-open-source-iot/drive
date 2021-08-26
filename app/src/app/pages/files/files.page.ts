import { Router } from '@angular/router';
import { FilesService } from 'src/app/services/files/files.service';
import { ConfigService } from 'src/app/services/config/config.service';
import { OptionsService } from 'src/app/libs/options/options.service';
import { MatTableDataSource } from '@angular/material/table';
import { OnInit, Component, OnDestroy } from '@angular/core';
import { File } from 'src/app/classes/file';

@Component({
	selector: 'files-page',
	styleUrls: ['./files.page.scss'],
	templateUrl: './files.page.html'
})

export class FilesPage implements OnInit, OnDestroy {

	constructor(private sheet: OptionsService, private config: ConfigService, private router: Router, private service: FilesService) { }

	public table: MatTableDataSource<any> = new MatTableDataSource<any>();
	public columns: string[] = ['filename', 'size'];
	public loading?: boolean;
	private observers: any = {};

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

	public async options(file: any) {
		this.sheet.show({
			role: 0,
			title: file.description,
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
					handler: () => {},
					disabled: []
				}
			]
		})
	}

	ngOnInit(): void {
		this.observers.loaded = this.config.loaded.subscribe((loaded: boolean) => {
			if (loaded) {
				this.list();
			};
		});
	}

	ngOnDestroy(): void {
		this.observers.loaded.unsubscribe();
	}

}
