import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
	selector: 'layout',
	templateUrl: 'layout.component.html',
	styleUrls: ['layout.component.scss'],
	imports: [RouterModule, HeaderComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {}
