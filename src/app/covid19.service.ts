import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import { User } from './user.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {HttpClient} from "@angular/common/http";
import { News } from './news.module';
import {DatePipe} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class Covid19Service {

  private user: User;
  private country: any;
  private countryDate: Date;

  constructor(private afAuth: AngularFireAuth,
    private router: Router, private firestore: AngularFirestore, 
    private http: HttpClient, private datePipe: DatePipe) { }

  async signInWithGoogle() {
    const credentials = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    this.user = {
      uid: credentials.user.uid,
      displayName: credentials.user.displayName,
      email: credentials.user.email
    };
    return this.firestore.collection("users").doc(this.user.uid).get();
  } 
   public updateUserData(){//update user data if user exists = eligible user
        this.firestore.collection("users").doc(this.user.uid).set({
          uid: this.user.uid,
          displayName: this.user.displayName,
          email: this.user.email
        }, {merge: true});
        localStorage.setItem("user", JSON.stringify(this.user)); //Storing user in local storage (browser storage)
       }


   async putCountry(i: number, c:any){
    let test=new Date();
    let actualDate = this.datePipe.transform(test, "yyyy-MM-dd");
    let cont=0; //to only go in one if

    this.firestore.collection("countries").doc(c).valueChanges().subscribe((res)=>{
      if (res==null){
        this.getFromApi(i);
        cont=1;
      }
      if (cont==0){
      this.countryDate=res["date"];
      cont=1;

        if (actualDate == this.datePipe.transform(this.countryDate, "yyyy-MM-dd")){
          //from firestore if the actual date is the one stored in the firestore = stored data up to date
          this.getFromFirestore(c);
        }
        if(actualDate != this.datePipe.transform(this.countryDate, "yyyy-MM-dd")){
          //from API if the actual date is not the one stored in the firestore = stored data not up to date
          this.getFromApi(i);
        }
    }
    });
   }

   getFromFirestore(c: any){
    console.log("from firestore");
    this.firestore.collection("countries").doc(c).valueChanges().subscribe((res)=>{
      this.country=res;
      this.countryDate=this.country.date;
      localStorage.setItem("country", JSON.stringify(this.country));
      this.router.navigate(["country-page"]);
    });
   }

   getFromApi(i: number){
    console.log("from API");
    this.getData().subscribe((res) => {
      this.country = {
        displayName: res["Countries"][i]["Country"],
        date: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
        slug: res["Countries"][i]["Slug"],
        cases: res["Countries"][i]["TotalConfirmed"],
        newCases: res["Countries"][i]["NewConfirmed"],
        recovered: res["Countries"][i]["TotalRecovered"],
        newRecovered: res["Countries"][i]["NewRecovered"],
        deaths: res["Countries"][i]["TotalDeaths"],
        newDeaths: res["Countries"][i]["NewDeaths"]
      };
      localStorage.setItem("country", JSON.stringify(this.country)); //Storing country in local storage (browser storage)
      this.updateCountryData(); //to store (or upadte) the country in the google firebase if necessary
      this.router.navigate(["country-page"]);
    })
   }

   private async updateCountryData(){
    this.firestore.collection("countries").doc(this.country.displayName).set({//create if does not exist, update if exists
      displayName: this.country.displayName,
      date: this.country.date,
      slug: this.country.slug,
      cases: this.country.cases,
      newCases: this.country.newCases,
      recovered: this.country.recovered,
      newRecovered: this.country.newRecovered,
      deaths: this.country.deaths,
      newDeaths: this.country.newDeaths
    }, {merge: true});
   }

   public getUser(){
     if(this.user == null && this.userSignedIn()){
       this.user=JSON.parse(localStorage.getItem("user"));
       //this if enable to keep the user name even though we reload the page 
     }
     return this.user;
   }

   userSignedIn(): boolean{
     return JSON.parse(localStorage.getItem("user")) != null; //check if the user is signIn in the local storage
   // if not equal to null (true) we are signed in
   //if equal to null (false) we are not signed in
    }

    isSignedIn(){
      if(JSON.parse(localStorage.getItem("user")) != null){
        return "Sign Out";
      }
      return "Sign In";
    }

    countryKnown(): boolean{
      return JSON.parse(localStorage.getItem("country")) != null;
      //if true we know the country
      //if false we don't know the country
    }

    signOut(){
      this.afAuth.signOut();
      localStorage.removeItem("user");
      this.user=null;
    }

    public getData(){
      return this.http.get<JSON>("https://api.covid19api.com/summary");
    }

    public getDataDaily(){
      return this.http.get<JSON>("https://corona.lmao.ninja/v2/historical/all?lastdays=8");
    }

    public getDataDaily2(){
      return this.http.get<JSON>("https://corona.lmao.ninja/v2/historical/all");
    }

    public getCountryDataDaily(slug: string){
      return this.http.get<JSON>("https://api.covid19api.com/dayone/country/"+slug);
    }
    
    public getCountry(){
      if(this.country == null && this.countryKnown()){
        this.country=JSON.parse(localStorage.getItem("country"));
        //this if enable to keep the user name even though we reload the page 
      }
      return this.country;

    }

    public goToCountry(c: string){
      this.router.navigate(["country-page"]);
    }
    public goToNews(){
      this.router.navigate(["add-news"]);
    }
    public goToHome(){
      this.router.navigate(["home-page"]);
    }

    addNews(news: News){
      this.firestore.collection("newsCountry").doc(news["countrySelected"]).collection("news").add(news);
    }

    getNews(country: string){
      return this.firestore.collection("newsCountry").doc(country).collection("news").valueChanges();
    }
}
