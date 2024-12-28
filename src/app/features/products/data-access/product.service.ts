import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JSON_HTTP_OPTIONS } from '../../../shared/utils';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../shared/types';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = environment.backendUrl + '/products';

  private http = inject(HttpClient);

  public getProduts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl, JSON_HTTP_OPTIONS);
  }

  public addProduct(name: string, category: string): Observable<Product> {
    return this.http.post<Product>(this.productsUrl + `?name=${name}&categoryId=${category}`, {}, JSON_HTTP_OPTIONS);
  }

  public updateProductQuantity(id: string, newQuantity: number): Observable<any> {
    return this.http.patch(this.productsUrl + `/${id}?quantity=${newQuantity}`, {});
  }

  public deleteProduct(id: string): Observable<any> {
    return this.http.delete(this.productsUrl + `/${id}`);
  }
}
