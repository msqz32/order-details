import {Component, OnInit} from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import {OrderDetailService} from "../../services/order-detail.service";
import {MatTableDataSource} from "@angular/material/table";
import {OrderDetail} from "../../models/order-detail";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit{

  displayedColumns: string[] = ['purchase_date','invoice','customer_root','customer_leaf','product_description','pack_size','unit_type','category','distributor_root','distributor_leaf','manufacturer','quantity','price','total'];
  dataSource = new MatTableDataSource<any>();
  orderDetails: OrderDetail[] = [];

  constructor(private breakpointObserver: BreakpointObserver, private orderDetailService:OrderDetailService) {
  }

  ngOnInit(): void {
    this.orderDetailService.getOrderDetail().subscribe(
      data=>{
        this.orderDetails = data;
        this.dataSource = new MatTableDataSource<OrderDetail>(this.orderDetails);
      }
    )
  }


}
