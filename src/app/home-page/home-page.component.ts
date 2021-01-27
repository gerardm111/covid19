import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { ChartPoint } from 'chart.js';
import { Covid19Service } from '../covid19.service';
import { Sort } from '@angular/material/sort';
import { Country } from '../country.module';
import { News } from '../news.module';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  ctx: any; //used to construct charts
  SignIn: any; //to know if the user is sign in

  global_data:any =[];//general data worldwide today
  daily_data:any=[]; //general data for the last 7 days
  hist_data:any=[]; //general data since the begining
  rows:any =[]; //countries general data
  sortedData: Country[]; //to enable sorting in the countries' table

  index: number; //the index linked to country in the data base
  existingNews:any=[]; //the existing news worldwide

  closeResult=''; //for the pop up closing
  bool: boolean; //to know whether if to show the add news button
  popUp: boolean; //to know whether if to show the warning pop up button

  constructor(public covid19Service: Covid19Service, 
    private modalService: NgbModal) { 
  }

  ngOnInit(): void {
    this.SignIn=this.covid19Service.isSignedIn();
    this.bool=this.covid19Service.userSignedIn();
    this.popUp=false;

    this.covid19Service.getData().subscribe((res) => {this.global_data = res["Global"];
    this.rows = res["Countries"];
    this.sortedData = this.rows.slice();
    this.pieChart()});
    this.covid19Service.getDataDaily().subscribe((res) => {this.daily_data = res;
    this.barChart()});
    this.covid19Service.getDataDaily2().subscribe((res) => {this.hist_data = res;
    this.lineChart()});
    this.covid19Service.getNews("Worldwide").subscribe((news: News[])=>{
      this.existingNews = news});
  }


  countryButton(row: any){
    this.index=0;
    while(row["Country"] != this.rows[this.index]["Country"]){
      this.index=this.index+1;
     }
    this.covid19Service.putCountry(this.index, row["Country"]);
  }

  async signButton(){
    var user;
    if (this.SignIn=="Sign In"){
      user = await this.covid19Service.signInWithGoogle();
      user.subscribe((res)=>{
        if (res.exists){
         this.covid19Service.updateUserData();
         this.SignIn = "Sign Out";
         this.bool=true;
        }
        else{
         localStorage.setItem("user", JSON.stringify(null));
         this.SignIn= "Sign In";
         this.popUp=true;
        }
       });
    }
    else{
      this.covid19Service.signOut();
      this.SignIn=this.covid19Service.isSignedIn();
      this.bool=false;
    }
  }

  addNewsButton(){
    this.covid19Service.goToNews();
  }

  sortData(sort: Sort) {
    const data = this.rows.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'displayName': return compare(a["Country"], b["Country"], isAsc);
        case 'cases': return compare(a["TotalConfirmed"], b["TotalConfirmed"], isAsc);
        case 'newCases': return compare(a["NewConfirmed"], b["NewConfirmed"], isAsc);
        case 'recovered': return compare(a["TotalRecovered"], b["TotalRecovered"], isAsc);
        case 'newRecovered': return compare(a["NewRecovered"], b["NewRecovered"], isAsc);
        case 'deaths': return compare(a["TotalDeaths"], b["TotalDeaths"], isAsc);
        case 'newDeaths': return compare(a["NewDeaths"], b["NewDeaths"], isAsc);
        default: return 0;
      }
    });
  }

  pieChart(){
    var canvas = <HTMLCanvasElement> document.getElementById("myPieChart");
    var ctx = canvas.getContext('2d');
    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data:{
        labels: ["Dead Cases", "Recovered Cases", "Active Cases"],
        datasets: [{
          data:[this.global_data["TotalDeaths"], this.global_data["TotalRecovered"], this.global_data["TotalConfirmed"]-this.global_data["TotalRecovered"]-this.global_data["TotalDeaths"]],
          backgroundColor: ["#FF99CC", "#3399CC", "#FFCC66"],
          borderWidth:1
        }]
      },
      options: {
        legend: {
          display:true
        },
        responsive: true,
      }});
  }

  barChart(){
    var canvas = <HTMLCanvasElement> document.getElementById("myBarChart");
    var ctx = canvas.getContext('2d');
    var myBarChart = new Chart(ctx, {
      type: 'bar',
      data:{
        labels: (Object.keys(this.daily_data["cases"])),
        datasets: [{
          label: "Daily Deaths",
          data: [<number> Object.values(this.daily_data["deaths"])[1]- <number> Object.values(this.daily_data["deaths"])[0],
                 <number> Object.values(this.daily_data["deaths"])[2]- <number> Object.values(this.daily_data["deaths"])[1],
                 <number> Object.values(this.daily_data["deaths"])[3]- <number> Object.values(this.daily_data["deaths"])[2],
                 <number> Object.values(this.daily_data["deaths"])[4]- <number> Object.values(this.daily_data["deaths"])[3],
                 <number> Object.values(this.daily_data["deaths"])[5]- <number> Object.values(this.daily_data["deaths"])[4],
                 <number> Object.values(this.daily_data["deaths"])[6]- <number> Object.values(this.daily_data["deaths"])[5],
                 <number> Object.values(this.daily_data["deaths"])[7]- <number> Object.values(this.daily_data["deaths"])[6]
        ],
          backgroundColor: ["#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC"],
          borderWidth:1
        },
          {
            label: "Daily Recovered",
            data:[<number> Object.values(this.daily_data["recovered"])[1]- <number> Object.values(this.daily_data["recovered"])[0],
            <number> Object.values(this.daily_data["recovered"])[2]- <number> Object.values(this.daily_data["recovered"])[1],
            <number> Object.values(this.daily_data["recovered"])[3]- <number> Object.values(this.daily_data["recovered"])[2],
            <number> Object.values(this.daily_data["recovered"])[4]- <number> Object.values(this.daily_data["recovered"])[3],
            <number> Object.values(this.daily_data["recovered"])[5]- <number> Object.values(this.daily_data["recovered"])[4],
            <number> Object.values(this.daily_data["recovered"])[6]- <number> Object.values(this.daily_data["recovered"])[5],
            <number> Object.values(this.daily_data["recovered"])[7]- <number> Object.values(this.daily_data["recovered"])[6]
   ],
            backgroundColor: ["#3399CC", "#3399CC", "#3399CC", "#3399CC", "#3399CC", "#3399CC", "#3399CC"],
            borderWidth:1
        },

          {
            label: "Daily New Cases",
            data:[<number> Object.values(this.daily_data["cases"])[1]- <number> Object.values(this.daily_data["cases"])[0],
            <number> Object.values(this.daily_data["cases"])[2]- <number> Object.values(this.daily_data["cases"])[1],
            <number> Object.values(this.daily_data["cases"])[3]- <number> Object.values(this.daily_data["cases"])[2],
            <number> Object.values(this.daily_data["cases"])[4]- <number> Object.values(this.daily_data["cases"])[3],
            <number> Object.values(this.daily_data["cases"])[5]- <number> Object.values(this.daily_data["cases"])[4],
            <number> Object.values(this.daily_data["cases"])[6]- <number> Object.values(this.daily_data["cases"])[5],
            <number> Object.values(this.daily_data["cases"])[7]- <number> Object.values(this.daily_data["cases"])[6]
   ],
            backgroundColor: ["#FFCC66", "#FFCC66", "#FFCC66", "#FFCC66", "#FFCC66", "#FFCC66", "#FFCC66"],
            borderWidth:1}]
        },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        legend: {
          display:true
        },
        responsive: true,
      }});
  }

  lineChart(){
    var canvas = <HTMLCanvasElement> document.getElementById("myLineChart");
    var ctx = canvas.getContext('2d');
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data:{
        labels: (Object.keys(this.hist_data["cases"])),
        datasets: [{
          label: "Total Deaths",
          data:<(number | number[])[] | ChartPoint[]> (Object.values(this.hist_data["deaths"])),
          backgroundColor: "rgba(255, 153, 204, 0.5)", //(255, 153, 204)
          borderColor:["#000000"]
        },
        {
          label: "Total Recovered",
          data: <(number | number[])[] | ChartPoint[]> (Object.values(this.hist_data["recovered"])),
          backgroundColor: "rgba(51, 153, 204, 0.5)", //(51, 153, 204)
          borderColor:["#3399FF"]
        },
        {
          label: "Total Cases",
          data: <(number | number[])[] | ChartPoint[]> (Object.values(this.hist_data["cases"])),
          backgroundColor: "rgba(255, 204, 102, 0.5)",
          borderColor:["#FFCC33"]
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        },
        legend: {
          display:true
        },
        responsive: true,
      }});
  }

  //for the warning pop up
  open(content) { 
    this.modalService.open(content, 
   {ariaLabelledBy: 'modal-basic-title'}).result.then((result)  => { 
      this.closeResult = `Closed with: ${result}`; 
    }, (reason) => { 
      this.closeResult =  
         `Dismissed ${this.getDismissReason(reason)}`; 
    }); 
  }
  //for the closing of the warning pop up
  private getDismissReason(reason: any): string { 
    if (reason === ModalDismissReasons.ESC) { 
      return 'by pressing ESC'; 
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) { 
      return 'by clicking on a backdrop'; 
    } else { 
      return `with: ${reason}`; 
    } 
  } 

}
function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}