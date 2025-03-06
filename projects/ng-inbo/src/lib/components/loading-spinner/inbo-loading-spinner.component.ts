import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
    selector: 'inbo-loading-spinner',
    templateUrl: 'inbo-loading-spinner.component.html',
    styleUrls: ['inbo-loading-spinner.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class InboLoadingSpinnerComponent {

}
