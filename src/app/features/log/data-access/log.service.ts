import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { JSON_HTTP_OPTIONS } from '../../../shared/utils';
import { Log, LogBody } from '../../../shared/types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private logsUrl = environment.backendUrl + '/log';
  private http = inject(HttpClient);

  public getLogEvents(): Observable<string[]> {
    return this.http.get<string[]>(this.logsUrl + '/events', JSON_HTTP_OPTIONS);
  }

  public getLogs(body: LogBody): Observable<Log[]> {
    return this.http.post<Log[]>(this.logsUrl, body, JSON_HTTP_OPTIONS);
  }

}
