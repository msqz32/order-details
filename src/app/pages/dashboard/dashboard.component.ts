import {Component, OnInit} from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import {OrderDetailService} from "../../services/order-detail.service";
import {MatTableDataSource} from "@angular/material/table";
import {OrderDetail} from "../../models/order-detail";
import { MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-US'}
  ]
})
export class DashboardComponent implements OnInit{

  orderBy:boolean = false;
  orderStatus:string = 'desc';
  export_url:string = '';
  formFilter:any;

  displayedColumns: string[] = ['purchase_date','invoice','customer_root','customer_leaf','product_description','pack_size','unit_type','category','distributor_root','distributor_leaf','manufacturer','quantity','price','total'];
  dataSource = new MatTableDataSource<any>();
  orderDetails: OrderDetail[] = [];

  constructor(private breakpointObserver: BreakpointObserver, private orderDetailService:OrderDetailService, private dateAdapter: DateAdapter<any>, public formBuilder:FormBuilder) {
    this.dateAdapter.setLocale('en-US');
  }

  ngOnInit(): void {

    this.loadForm();

    this.orderDetailService.getOrderDetail().subscribe(
      data=>{
        this.orderDetails = data;
        this.dataSource = new MatTableDataSource<OrderDetail>(this.orderDetails);
      }
    );

    this.export_url = this.orderDetailService.getExporUrl();

  }

  loadForm(){
    this.formFilter = new FormGroup({
      filterDate:new FormControl(),
      orderSelect:new FormControl()
    });
  }

  filterByDate(){
      let params={
        filterDate:this.dateToString(this.formFilter.get('filterDate').value)
      }
      this.orderDetailService.getOrderDetail(params).subscribe(
        data=>{
          this.orderDetails = data;
          this.dataSource = new MatTableDataSource<OrderDetail>(this.orderDetails);
        }
      );
      this.export_url = this.orderDetailService.getExporUrl(params);
  }

  removeFilterByDate(){

    this.formFilter.get('filterDate').setValue('');

    this.orderDetailService.getOrderDetail().subscribe(
      data=>{
        this.orderDetails = data;
        this.dataSource = new MatTableDataSource<OrderDetail>(this.orderDetails);
      }
    );

    this.export_url = this.orderDetailService.getExporUrl();
  }

  orderByParam(status:string){

    this.orderBy = true;

    let params={
      filterDate:this.dateToString(this.formFilter.get('filterDate').value),
      orderParam:this.formFilter.get('orderSelect').value,
      orderStatus: status
    }
    this.orderDetailService.getOrderDetail(params).subscribe(
      data=>{
        this.orderDetails = data;
        this.dataSource = new MatTableDataSource<OrderDetail>(this.orderDetails);
      }
    );
    this.export_url = this.orderDetailService.getExporUrl(params);

  }



  dateToString(d: Date) {
    try {
      //return ('00' +  d.getDate()).slice(-2) + '-' + ('00' +  (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
      return d.getFullYear() + '-' + ('00' +  (d.getMonth() + 1)).slice(-2) + '-' + ('00' +  d.getDate()).slice(-2);
    } catch (error) {
      return '';
    }
  }


}
