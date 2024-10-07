import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JSON_HTTP_OPTIONS } from '../../shared/utils';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = environment.backendUrl + '/products';

  private http = inject(HttpClient);

  public getProduts(): Observable<any> {
    return this.http.get(this.productsUrl, JSON_HTTP_OPTIONS);
  }
}
