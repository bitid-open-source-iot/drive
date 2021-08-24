import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesViewerPage } from './viewer.page';

describe('FilesViewerPage', () => {
  let component: FilesViewerPage;
  let fixture: ComponentFixture<FilesViewerPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesViewerPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
