import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from "rxjs";
import {OrderDetail} from "../models/order-detail";

@Injectable({
  providedIn: 'root'
})
export class OrderDetailService {

  private heroesUrl = '/order-detail';

  constructor(private http: HttpClient) { }

  getOrderDetail():Observable<OrderDetail[]>{
    return this.http.get<OrderDetail[]>(this.heroesUrl);
  }
}
