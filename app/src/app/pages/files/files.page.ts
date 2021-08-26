import { Router } from '@angular/router';
import { OptionsService } from 'src/app/libs/options/options.service';
import { MatTableDataSource } from '@angular/material/table';
import { OnInit, Component, OnDestroy } from '@angular/core';

@Component({
	selector: 'files-page',
	styleUrls: ['./files.page.scss'],
	templateUrl: './files.page.html'
})

export class FilesPage implements OnInit, OnDestroy {

	constructor(private sheet: OptionsService, private router: Router) { }

	public table: MatTableDataSource<any> = new MatTableDataSource<any>();
	public columns: string[] = ['description', 'size', 'appId'];

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
		this.table.data = [
			{
				size: 10000,
				appId: '000000000000000000000001',
				fileId: '000000000000000000000001',
				description: 'My Image.png',
			},
			{
				size: 1000000,
				appId: '000000000000000000000001',
				fileId: '000000000000000000000002',
				description: 'My Second.png',
			},
			{
				size: 1000000000,
				appId: '000000000000000000000001',
				fileId: '000000000000000000000003',
				description: 'My Third.png',
			}
		];
	}

	ngOnDestroy(): void { }

}
