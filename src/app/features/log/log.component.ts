import { Component, OnInit, inject, viewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { LogTableComponent } from './log-table/log-table.component';
import { LogService } from './data-access/log.service';
import { Log, LogBody, User } from '../../shared/types';
import { LoaderService, SnakeCaseParserPipe } from '../../../../projects/ui-lib/src/public-api';
import { CustomDateAdapter } from '../../shared/custom-date-adapter';
import { UserService } from '../users/data-access/user.service';

type QuickDateFilter = 'Today' | '1 week' | '1 month' | 'This week' | 'This month' | 'This year';

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [
    LogTableComponent,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatAutocompleteModule,
    MatInputModule,
    SnakeCaseParserPipe,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule,
    MatButtonModule,
  ],
  providers: [
    SnakeCaseParserPipe,
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {
  protected logTable = viewChild.required<LogTableComponent>('logTable');
  protected logs: Log[] = [];

  protected range: { start: Date | null, end: Date| null } = {
    start: null,
    end: null
  };
  protected quickDateFiltes: QuickDateFilter[] = ['Today', '1 week', '1 month'];
  protected moreFilters: QuickDateFilter[] = ['This week', 'This month', 'This year'];
  protected selectedDateFilter: QuickDateFilter | undefined = undefined;

  protected selectedEvent: string = '';
  protected searchEvent: string = '';
  private lastSelectedEvent: string = '';
  protected allLogEvents: string[] = [];
  protected filteredLogEvents: string[] = [];

  protected selectedUserId: string | undefined;
  private lastSelectedUserId: string | undefined;
  protected searchUser: string | undefined;
  protected allUsers: User[] = [];
  protected filteredUsers: User[] = [];

  protected isFetching: boolean = false;
  protected stopScrolling: boolean = false;
  private itemsPerPage: number = 50;

  private snakeCasePipe = inject(SnakeCaseParserPipe);
  private loaderService = inject(LoaderService);
  private userService = inject(UserService);
  private logService = inject(LogService);

  public ngOnInit(): void {
    this.getLogs(true);
    this.getEvents();
    this.getUsers();
    // this.getProducts();
    // this.getCategories();
  }

  protected getLogs(init: boolean = false): void {
    if (init) {
      this.loaderService.setLoading(true);
    }

    const body: LogBody = {
      pageSize: this.itemsPerPage,
    };

    if (this.selectedEvent) {
      body.event = this.selectedEvent;
    }

    if (this.selectedUserId) {
      body.user = this.selectedUserId;
    }

    if (this.range.start && this.range.end) {
      body.startDate = this.range.start;
      body.endDate = this.range.end;
    }

    this.logService.getLogs(body).subscribe({
      next: (logs: Log[]) => {
        this.loaderService.setLoading(false);
        this.isFetching = false;
        if (logs.length < this.itemsPerPage) {
          this.stopScrolling = true;
        }
        this.logs = logs;
        console.log('logs', this.logs);
      },
      error: () => {
        this.loaderService.setLoading(false);
        this.isFetching = false;
        // console.log('err', err);
      }
    });
  }

  private getEvents(): void {
    this.logService.getLogEvents().subscribe((types: string[]) => {
      this.allLogEvents = types;
      this.filteredLogEvents = types;
    });
  }

  protected onEventOptionClick(auto: MatAutocomplete): void {
    if (this.lastSelectedEvent && (this.selectedEvent === this.lastSelectedEvent)) {
      this.selectedEvent = '';
      this.lastSelectedEvent = '';
      this.searchEvent = '';
      this.filteredLogEvents = this.allLogEvents;
      auto.options.forEach((o : MatOption) => o.deselect());
      this.resetPaging();
      this.getLogs(true);
      return;
    }

    this.lastSelectedEvent = this.selectedEvent;
    this.searchEvent = this.snakeCasePipe.transform(this.selectedEvent);
    this.resetPaging();
    this.getLogs(true);
  }

  protected onUsersClick(auto: MatAutocomplete): void {
    if (this.lastSelectedUserId && (this.selectedUserId === this.lastSelectedUserId)) {
      this.selectedUserId = '';
      this.lastSelectedUserId = '';
      this.searchUser = '';
      this.filteredLogEvents = this.allLogEvents;
      auto.options.forEach((o : MatOption) => o.deselect());
      this.resetPaging();
      this.getLogs(true);
      return;
    }

    this.lastSelectedUserId = this.selectedUserId;
    this.resetPaging();
    this.getLogs(true);
  }

  protected getUsers(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      if (users) {
        this.allUsers = users;
        this.filteredUsers = users;
      }
    });
  }

  protected onDateFilterChange(): void {
    this.resetPaging();
    switch (this.selectedDateFilter) {
      case 'Today':
        this.range.start = new Date();
        this.range.start.setHours(0, 0, 0, 0);
        this.range.end = new Date();
        break;
      case '1 week':
        this.range.start = new Date();
        this.range.start.setDate(this.range.start.getDate() - 6);
        this.range.end = new Date();
        break;
      case '1 month':
        this.range.start = new Date();
        this.range.start.setMonth(this.range.start.getMonth() - 1);
        this.range.end = new Date();
        break;
      case 'This week':
        this.range.start = new Date();
        this.range.start.setDate(this.range.start.getDate() - this.range.start.getDay());
        this.range.end = new Date();
        break;
      case 'This month':
        this.range.start = new Date();
        this.range.start.setDate(1);
        this.range.end = new Date();
        break;
      case 'This year':
        this.range.start = new Date();
        this.range.start.setMonth(0);
        this.range.start.setDate(1);
        this.range.end = new Date();
        break;
      default:
        this.range.start = null;
        this.range.end = null;
        break;
    }

    this.getLogs(true);
  }

  protected switchPlaces(filter: QuickDateFilter, index: number): void {
    const firstFilter = this.quickDateFiltes[0];
    this.quickDateFiltes[0] = filter;
    this.moreFilters[index] = firstFilter;
  }
 
  protected onDateChange(): void {
    if (this.range.start && this.range.end) {
      this.resetPaging();
      this.getLogs(true);
    }
  }

  protected filterAutocomplete(type: 'events' | 'users', value: string | undefined): any {
    if (value) {
      const filterValue = value.toLowerCase();

      if (type === 'events') {
        return this.allLogEvents.filter(event => this.snakeCasePipe.transform(event).toLowerCase().includes(filterValue));
      }

      if (type === 'users') {
        return this.allUsers.filter(user => user.email.toLowerCase().includes(filterValue));
      }
    }
  }

  protected onAction(event: any): void {
    console.log('action', event);
  }

  protected clearFilters(eventsAuto: MatAutocomplete): void {
    eventsAuto.options.forEach((o : MatOption) => o.deselect());
    this.resetPaging();
    this.stopScrolling = false;
    this.range.start = null;
    this.range.end = null;
    this.selectedDateFilter = undefined;
    this.selectedEvent = '';
    this.searchEvent = '';
    this.lastSelectedEvent = '';

    this.lastSelectedUserId = undefined;
    this.selectedUserId = undefined;
    this.searchUser = undefined;
    this.getLogs(true);
  }

  protected onScroll(): void {
    if (this.isFetching || this.stopScrolling) {
      return;
    }
    this.itemsPerPage += 50;
    this.isFetching = true;
    this.getLogs();
  }

  protected resetPaging(): void {
    this.itemsPerPage = 50;
    this.logTable().scrollContainer().nativeElement.scrollTo(0, 0);
  }
}
