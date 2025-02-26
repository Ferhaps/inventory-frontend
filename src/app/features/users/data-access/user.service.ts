import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JSON_HTTP_OPTIONS } from '../../../shared/utils';
import { User } from '../../../shared/types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersUrl = environment.backendUrl + '/users';

  private http = inject(HttpClient);

  public getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl, JSON_HTTP_OPTIONS);
  }

  public deletetUser(id: string): Observable<any> {
    return this.http.delete(this.usersUrl + `/${id}`, JSON_HTTP_OPTIONS);
  }
}
