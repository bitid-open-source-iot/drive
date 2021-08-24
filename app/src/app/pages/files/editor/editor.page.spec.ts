import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesEditorPage } from './editor.page';

describe('FilesEditorPage', () => {
  let component: FilesEditorPage;
  let fixture: ComponentFixture<FilesEditorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesEditorPage ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesEditorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
