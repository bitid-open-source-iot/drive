import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileSize'
})

export class FileSizePipe implements PipeTransform {

    transform(value: number): string {
        if (value <= 999) {
            return [value, 'b'].join('');
        } else if (value <= 999999) {
            return [parseFloat((value / 1000).toFixed(2)), 'kb'].join('');
        } else if (value <= 999999999) {
            return [parseFloat((value / 1000000).toFixed(2)), 'mb'].join('');
        } else if (value <= 999999999999) {
            return [parseFloat((value / 1000000000).toFixed(2)), 'gb'].join('');
        } else {
            return [parseFloat((value / 1000000000000).toFixed(2)), 'tb'].join('');
        }
    }

}
