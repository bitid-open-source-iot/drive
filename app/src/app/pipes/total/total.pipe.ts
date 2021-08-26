import * as path from 'object-path';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'total'
})

export class TotalPipe implements PipeTransform {

    transform(array: any[], key: string): number {
        return array.map(o => path.get(o, key)).filter(o => typeof(o) == 'number').reduce((a, b) => a + b, 0);
    }

}
