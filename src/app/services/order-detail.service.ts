import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from "rxjs";
import {OrderDetail} from "../models/order-detail";
import {Invoice} from "../models/invoice";
import {Product} from "../models/product";


@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {



  private api_url = '/orders-detail';
  private export_url = 'http://localhost:7080/orders-detail/export';

  constructor(private http: HttpClient) { }



  getOrderDetail(params?:any):Observable<OrderDetail[]>{
    return this.http.get<OrderDetail[]>(`${this.api_url}/detail?${this.formatParameter(params, false)}`);
  }

  getInvoices(params?:any):Observable<Invoice[]>{
    return this.http.get<Invoice[]>(`${this.api_url}/invoices?${this.formatParameter(params, false)}`);
  }

  getProducts(params?:any):Observable<Product[]>{
    return this.http.get<Product[]>(`${this.api_url}/products?${this.formatParameter(params, false)}`);
  }



  getExporUrl(params?:any){
    return `${this.export_url}?${this.formatParameter(params, false)}`;
  }

  formatParameter(object: any, pagination: boolean = false): string {
    let encodedString = '';
    for (let prop in object) {
      if (object.hasOwnProperty(prop)) {
        if (encodedString.length > 0) encodedString += '&';

        if (!pagination)
          encodedString += encodeURI(prop + '=' + (object[prop] ?? ''));
        else if (['field', 'order', 'page', 'size'].includes(prop))
          encodedString += encodeURI(prop + '=' + (object[prop] ?? ''));
        else
          encodedString += encodeURI(
            'value.' + prop + '=' + (object[prop] ?? '')
          );
      }
    }
    return encodedString;
  }

}
