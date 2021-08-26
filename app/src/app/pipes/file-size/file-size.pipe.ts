import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileSize'
})

export class FileSizePipe implements PipeTransform {

    transform(value: number): string {
        if (value <= 1023) {
            return [value, 'b'].join('');
        } else if (value <= 1048575) {
            return [parseFloat((value / 1024).toFixed(2)), 'kb'].join('');
        } else if (value <= 1073741823) {
            return [parseFloat((value / 1024 / 1024).toFixed(2)), 'mb'].join('');
        } else if (value <= 1099511627775) {
            return [parseFloat((value / 1024 / 1024 / 1024).toFixed(2)), 'gb'].join('');
        } else {
            return [parseFloat((value / 1024 / 1024 / 1024 / 1024).toFixed(2)), 'tb'].join('');
        }
    }

}
