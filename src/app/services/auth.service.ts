import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { JSON_HTTP_OPTIONS, TOKEN_KEY } from '../shared/utils';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoggedUserInfo } from '../shared/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = environment.backendUrl + '/auth';
  
  private http = inject(HttpClient);
  private router = inject(Router);

  public login(body: { email: string, password: string }): Observable<LoggedUserInfo> {
    return this.http.post<LoggedUserInfo>(this.authUrl + '/login', body, JSON_HTTP_OPTIONS);
  }

  public extendToken(token: string): Observable<any> {
    return this.http.get(this.authUrl + `/token/extend?accessToken=${token}`, JSON_HTTP_OPTIONS);
  }

  public getLoggedUserInfo(): LoggedUserInfo {
    return JSON.parse(localStorage.getItem(TOKEN_KEY)!);
  }

  public logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigateByUrl('/login');
  }
}
