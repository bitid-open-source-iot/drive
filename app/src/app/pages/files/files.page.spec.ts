import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesPage } from './files.page';

describe('FilesPage', () => {
  let component: FilesPage;
  let fixture: ComponentFixture<FilesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
