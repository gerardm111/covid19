import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { Covid19Service } from '../covid19.service';
import { News } from '../news.module';
import { User } from '../user.model';
import {DatePipe} from '@angular/common';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-country-page',
  templateUrl: './country-page.component.html',
  styleUrls: ['./country-page.component.css']
})
export class CountryPageComponent implements OnInit {
  country: any; //the country name in this page
  existingNews:any=[]; //the existing news worldwide
  SignIn: any;//to know if the user is sign in

  dailyDataC: any=[];//daily cases data
  dailyDataD: any=[];//daily deaths data
  dailyDataR: any=[];//daily recovered data
  dailyDate: any=[];//dates for daily data

  closeResult=''; //for the pop up closing
  bool: boolean; //to know whether if to show the add news button
  popUp: boolean; //to know whether if to show the warning pop up button
  
  constructor(public covid19Service: Covid19Service, private datePipe: DatePipe,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.SignIn=this.covid19Service.isSignedIn();
    this.bool=this.covid19Service.userSignedIn();
    this.popUp=false;

    this.country = this.covid19Service.getCountry();
    this.pieChart(this.covid19Service.getCountry());

    this.covid19Service.getCountryDataDaily(this.country.slug).subscribe((res) => {
      let compteur = 0;
      let n = Object.keys(res).length;
      for (let compteur=0; compteur<n; compteur++){
        this.dailyDataC.push(res[compteur]["Confirmed"]);
        this.dailyDataD.push(res[compteur]["Deaths"]);
        this.dailyDataR.push(res[compteur]["Recovered"]);
        this.dailyDate.push(this.datePipe.transform(res[compteur]["Date"], "yyyy-MM-dd"));
      }
      this.barChart(n);
      this.lineChart();
      this.pieChart(this.covid19Service.getCountry())});
  }

  //wait to have the country, to find the corresponding news
  ngAfterContentInit():void{
    this.covid19Service.getNews(this.country.displayName).subscribe((news: News[])=>{
      this.existingNews = news;
    });
  }

  async signButton(){
    var user;
    if (this.SignIn=="Sign In"){
      user = await this.covid19Service.signInWithGoogle();
      user.subscribe((res)=>{
        if (res.exists){
         console.log("user exists");
         this.covid19Service.updateUserData();
         this.SignIn = "Sign Out";
         this.bool=true;
        }
        else{
         console.log("user does not exist");
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

  async addNewsButton(){
    this.covid19Service.goToNews();
  }

  pieChart(r: any){
    var canvas = <HTMLCanvasElement> document.getElementById("myPieChart");
    var ctx = canvas.getContext('2d');
    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data:{
        labels: ["Dead Cases", "Recovered Cases", "Active Cases"],
        datasets: [{
          data:[r.deaths, r.recovered, r.cases-r.recovered-r.deaths],
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

  barChart(n: number){
    var canvas = <HTMLCanvasElement> document.getElementById("myBarChart");
    var ctx = canvas.getContext('2d');
    var myBarChart = new Chart(ctx, {
      type: 'bar',
      data:{
        labels: [this.dailyDate[n-8], this.dailyDate[n-7], this.dailyDate[n-6], this.dailyDate[n-5], this.dailyDate[n-4], this.dailyDate[n-3], this.dailyDate[n-2], this.dailyDate[n-1]],
        datasets: [{
          label: "Daily Deaths",
          data: [this.dailyDataD[n-8], this.dailyDataD[n-7], this.dailyDataD[n-6], this.dailyDataD[n-5], this.dailyDataD[n-4], this.dailyDataD[n-3], this.dailyDataD[n-2], this.dailyDataD[n-1]],
          backgroundColor: ["#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC", "#FF99CC"],
          borderWidth:1
        },
          {
            label: "Daily Recovered",
            data:[this.dailyDataR[n-8], this.dailyDataR[n-7], this.dailyDataR[n-6], this.dailyDataR[n-5], this.dailyDataR[n-4], this.dailyDataR[n-3], this.dailyDataR[n-2], this.dailyDataR[n-1]],
            backgroundColor: ["#3399CC", "#3399CC", "#3399CC", "#3399CC", "#3399CC", "#3399CC", "#3399CC"],
            borderWidth:1
        },

          {
            label: "Daily New Cases",
            data:[this.dailyDataC[n-8], this.dailyDataC[n-7], this.dailyDataC[n-6], this.dailyDataC[n-5], this.dailyDataC[n-4], this.dailyDataC[n-3], this.dailyDataC[n-2], this.dailyDataC[n-1]],
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
        labels: this.dailyDate,
        datasets: [{
          label: "Total Deaths",
          data: this.dailyDataD,
          backgroundColor: "rgba(255, 153, 204, 0.5)", //(255, 153, 204)
          borderColor:["#000000"]
        },
        {
          label: "Total Recovered",
          data: this.dailyDataR,
          backgroundColor: "rgba(51, 153, 204, 0.5)", //(51, 153, 204)
          borderColor:["#3399FF"]
        },
        {
          label: "Total Cases",
          data: this.dailyDataC,
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
