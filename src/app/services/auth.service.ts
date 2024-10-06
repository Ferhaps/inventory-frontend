import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { JSON_HTTP_OPTIONS, STRING_HTTP_OPTIONS, TOKEN_KEY } from '../shared/utils';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = environment.backendUrl + '/auth';
  
  private http = inject(HttpClient);
  private router = inject(Router);

  public login(body: { email: string, password: string }): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(this.authUrl + '/login', body, STRING_HTTP_OPTIONS);
  }

  public extendToken(token: string): Observable<any> {
    return this.http.get(this.authUrl + `/token/extend?accessToken=${token}`, JSON_HTTP_OPTIONS);
  }

  public logout(): void {
    this.http.post(this.authUrl + '/logout', { }, JSON_HTTP_OPTIONS).subscribe(() => {
      localStorage.removeItem(TOKEN_KEY);
      this.router.navigateByUrl('login');
    });
  }
}
