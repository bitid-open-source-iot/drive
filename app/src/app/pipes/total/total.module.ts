/* --- PIPES --- */
import { TotalPipe } from './total.pipe';

/* --- MODULES --- */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        TotalPipe
    ],
    declarations: [
        TotalPipe
    ]
})

export class TotalPipeModule { }
