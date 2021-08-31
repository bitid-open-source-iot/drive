import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesFilterDialog } from './filter.dialog';

describe('FilesFilterDialog', () => {
    let component: FilesFilterDialog;
    let fixture: ComponentFixture<FilesFilterDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FilesFilterDialog]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilesFilterDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
