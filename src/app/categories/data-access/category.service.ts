import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../../shared/types';
import { JSON_HTTP_OPTIONS } from '../../shared/utils';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoryUrl = environment.backendUrl + '/categories';

  private http = inject(HttpClient);

  public getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoryUrl, JSON_HTTP_OPTIONS);
  }
}
