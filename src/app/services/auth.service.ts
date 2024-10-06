import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { JSON_HTTP_OPTIONS, TOKEN_KEY } from '../shared/utils';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = environment.backendUrl + '/auth';
  
  private http = inject(HttpClient);
  private router = inject(Router);

  public logout(): void {
    this.http.post(this.authUrl + '/logout', { }, JSON_HTTP_OPTIONS).subscribe(() => {
      localStorage.removeItem(TOKEN_KEY);
      this.router.navigateByUrl('login');
    });
  }
}
