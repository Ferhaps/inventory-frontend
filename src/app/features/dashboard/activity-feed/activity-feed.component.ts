import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SnakeCaseParserPipe } from '@ferhaps/easy-ui-lib';
import { Log } from '../../../shared/types';

@Component({
	selector: 'app-activity-feed',
	host: { class: 'block overflow-y-auto h-full' },
	imports: [
		DatePipe,
		SnakeCaseParserPipe
	],
	templateUrl: './activity-feed.component.html',
	styleUrl: './activity-feed.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeedComponent {
	public logs = input.required<Log[]>();
}
