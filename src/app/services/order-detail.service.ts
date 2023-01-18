import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from "rxjs";
import {OrderDetail} from "../models/order-detail";


@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {



  private api_url = '/orders-detail/detail';

  constructor(private http: HttpClient) { }



  getOrderDetail(params?:any):Observable<OrderDetail[]>{
    return this.http.get<OrderDetail[]>(`${this.api_url}?${this.formatParameter(params, false)}`);
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
