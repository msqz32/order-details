import {Component, OnInit, ViewChild} from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import {OrderDetailService} from "../../services/order-detail.service";
import { MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BaseChartDirective} from "ng2-charts";
import {ChartConfiguration, ChartData, ChartEvent, ChartType} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

// convert to array whit group values
const groupBy = function (xs, key){
  return xs.reduce( function (rv,x){
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  },{} );
};


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'en-US'}
  ]
})



export class DashboardComponent implements OnInit{

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  // responsive
  breakpoint5: number;
  breakpoint2: number;

  // params for filters, order and group
  paramGroupBy:String = '';
  paramOrderBy:string = '';
  paramOrderStatus:string = 'desc';
  paramFilterDate:string = '';

  // url to export to excell
  export_url:string = '';


  formFilter:any;

  displayedColumns: string[] = ['purchase_date','invoice','customer_root','customer_leaf','product_description','pack_size','unit_type','category','distributor_root','distributor_leaf','manufacturer','quantity','price','total'];

  // arrays for mat-table
  orderDetails: any[] = [];
  auxDatasource: any[] = [];

  // arrays for graph
  invoices: any[] = [];
  products: any[] = [];

  // param for kpi
  kpiInvoiceCount:number = 0;
  kpiInvoiceTotal:number = 0;
  kpiInvoiceQuantity:number = 0;

  // graphs
  barChartData: ChartData<'bar'>;

  constructor(private breakpointObserver: BreakpointObserver, private orderDetailService:OrderDetailService, private dateAdapter: DateAdapter<any>, public formBuilder:FormBuilder) {
    this.dateAdapter.setLocale('en-US');
  }

  ngOnInit(): void {
    this.breakpoint5 = (window.innerWidth <= 400) ? 1 : 5;
    this.breakpoint2 = (window.innerWidth <= 400) ? 1 : 2;
    this.loadForm();
    this.orderDetailService.getInvoices().subscribe(data=>{
        this.invoices = data;
        this.loadKPIs();
    });
    this.orderDetailService.getProducts().subscribe(data=>{
      this.products = data;
      this.loadBarChartProduct();
    });
    this.orderDetailService.getOrderDetail().subscribe(
      data=>{
        this.orderDetails = data;
        this.auxDatasource = data;
      }
    );
    this.export_url = this.orderDetailService.getExporUrl();
  }

  onResize(event) {
    this.breakpoint5 = (event.target.innerWidth <= 400) ? 1 : 5;
    this.breakpoint2 = (event.target.innerWidth <= 400) ? 1 : 2;
  }

  // init form
  loadForm(){
    this.formFilter = new FormGroup({
      filterDate:new FormControl(),
      orderSelect:new FormControl(),
      groupSelect: new FormControl()
    });
  }

  loadKPIs(){
    this.kpiInvoiceCount = this.invoices.length;
    let kpiTotal = 0;
    let kpiQuantity = 0;
    this.invoices.forEach( invoice =>{
        kpiTotal = kpiTotal + invoice.total;
        kpiQuantity = kpiQuantity + invoice.quantity;
    });
    this.kpiInvoiceTotal = kpiTotal;
    this.kpiInvoiceQuantity = kpiQuantity;
  }

  loadBarChartProduct(){
    let labels = [];
    let quantities = [];
    let totals = [];
    this.products.forEach(product=>{
        labels.push(product.productDescription);
        quantities.push(product.quantity);
        totals.push(product.total);
    });
    this.barChartData = {
      labels: labels,
      datasets: [
        //{ data: quantities, label: 'Quantities' }
        { data: totals, label: 'Total' }
      ]
    };
  }

  refreshKPIs(params?:any){
    this.orderDetailService.getInvoices(params).subscribe(data=>{
      this.invoices = data;
      this.loadKPIs();
    });
  }

  refreshBarChart(params?:any){
    this.orderDetailService.getProducts(params).subscribe(data=>{
      this.products = data;
      this.loadBarChartProduct();
    });
  }

  // change mat-table by filter, order or group
  changeByParam(status?:string){
    this.paramFilterDate = this.dateToString(this.formFilter.get('filterDate').value);
    this.paramOrderBy = this.formFilter.get('orderSelect').value;
    this.paramOrderStatus = status;
    this.orderSelectChange();
    let params={
      filterDate:this.paramFilterDate,
      orderBy: this.paramOrderBy,
      orderStatus: this.paramOrderStatus
    }
    this.orderDetailService.getOrderDetail(params).subscribe(
      data=>{
        this.orderDetails = data;
        this.auxDatasource = data;
        this.groupSelectChange();
      }
    );
    this.refreshKPIs(params);
    this.refreshBarChart(params);
    this.export_url = this.orderDetailService.getExporUrl(params);
  }

  // remove date filter
  removeFilterByDate(){
    this.formFilter.get('filterDate').setValue('');
    let params={
      filterDate:this.dateToString(this.formFilter.get('filterDate').value),
      orderBy: this.paramOrderBy,
      orderStatus: this.paramOrderStatus
    }
    this.orderDetailService.getOrderDetail(params).subscribe(
      data=>{
        this.orderDetails = data;
        this.auxDatasource = data;
        this.groupSelectChange();
      }
    );
    this.refreshKPIs();
    this.refreshBarChart();
    this.export_url = this.orderDetailService.getExporUrl();
  }

  // validate orderSelect change set value to '' when is null or 0
  orderSelectChange(){
    this.paramOrderBy = this.formFilter.get('orderSelect').value;
    if(this.paramOrderBy == null || this.paramOrderBy == '0'){
      this.paramOrderBy = '';
    }
  }

  // validate groupSelect change set value to '' when is null or 0
  // build new array for mat-table if it is grouped
  groupSelectChange(){
      this.paramGroupBy = this.formFilter.get('groupSelect').value;
      if(this.paramGroupBy == null || this.paramGroupBy == '0'){
        this.orderDetails = this.auxDatasource;
      }else{
        this.transform(this.auxDatasource, this.paramGroupBy);
      }
  }

  // convert date to string and format
  dateToString(d: Date) {
    try {
      //return ('00' +  d.getDate()).slice(-2) + '-' + ('00' +  (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
      return d.getFullYear() + '-' + ('00' +  (d.getMonth() + 1)).slice(-2) + '-' + ('00' +  d.getDate()).slice(-2);
    } catch (error) {
      return '';
    }
  }

  // convert simple array to group array
  transform(paramDataSource, group) {


    let newData = groupBy(paramDataSource, group);
    this.orderDetails=[];

    Object.keys(newData).forEach(key => {
      let orders = [];
      let header = new Group();
      let values = newData[key];
      header.label = group;
      header.group = key;
      header.count = values.length;
      header.isGroupBy = true;
      this.orderDetails.push(header);
      let total = 0;
      values.forEach((element) => {
        orders.push(element.invoice);
        total = total + element.total;
        this.orderDetails.push(element);
      });

      let unique = orders.filter(function (element, index, self){
        return index === self.indexOf(element);
      });
      header.orders = unique.length;
      header.total = Math.round((total + Number.EPSILON) * 100) / 100;
      header.avg = Math.round((header.total/header.orders+ Number.EPSILON) * 100) / 100;

    })
  }

  // flag when row is grouped
  isGroup(index, item): boolean {
    return item.isGroupBy;
  }


  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {min: 10}
    },
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        anchor: 'end',
        align: 'end'
      }
    }
  };

  barChartType: ChartType = 'bar';

  barChartPlugins = [
    ChartDataLabels
  ];


}

export class Group {
  label: string;
  group: string;
  count: number;
  isGroupBy: boolean;
  total:number;
  orders:number;
  avg:number;

}


