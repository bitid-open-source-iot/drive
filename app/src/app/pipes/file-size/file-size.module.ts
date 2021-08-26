/* --- PIPES --- */
import { FileSizePipe } from './file-size.pipe';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        FileSizePipe
    ],
    declarations: [
        FileSizePipe
    ]
})

export class FileSizePipeModule { }
