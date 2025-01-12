import { DatePipe, NgClass } from '@angular/common';
import { Component, effect, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SnakeCaseParserPipe, WhiteSpaceFillerPipe } from '../../../../../projects/ui-lib/src/public-api';
import { Log } from '../../../shared/types';

@Component({
  selector: 'app-log-table',
  templateUrl: 'log-table.component.html',
  styleUrls: ['log-table.component.scss'],
  imports: [
    DatePipe,
    NgClass,
    WhiteSpaceFillerPipe,
    SnakeCaseParserPipe,
    MatTooltipModule,
    MatProgressSpinnerModule
  ]
})
export class LogTableComponent {
  public data = input.required<Log[]>();
  public headings = input<string[]>([]);

  protected action = output<any>();
  protected scrolled = output<void>();

  public scrollContainer = viewChild.required<ElementRef<HTMLDivElement>>('scrollContainer');

  protected loading: boolean = true;

  private router = inject(Router);

  constructor() {
    effect(() => {
      if (this.data()) {
        this.loading = false;
      }
    });
  }

  protected navigate(route: string, id: string | undefined): void {
    if (id) {
      this.router.navigate([route, id]);
    }
  }

  protected onScroll() {
    const container = this.scrollContainer().nativeElement;
    if ((Math.ceil(container.scrollTop) + container.offsetHeight) >= container.scrollHeight) {
      this.scrolled.emit();
    }
  }
}
