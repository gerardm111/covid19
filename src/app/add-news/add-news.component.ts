import { Component, OnInit } from '@angular/core';
import { Covid19Service } from '../covid19.service';
import { News } from '../news.module';
import { User } from '../user.model';

@Component({
  selector: 'app-add-news',
  templateUrl: './add-news.component.html',
  styleUrls: ['./add-news.component.css']
})
export class AddNewsComponent implements OnInit {
  country:any =[];//to have the list of countries
  user: User; //to know the user and display his/her name

  //form inputs
  date: any;
  countrySelected: string;
  news: Text;

  constructor(public covid19Service: Covid19Service) { }

  ngOnInit(): void {
    this.user = this.covid19Service.getUser();
    this.covid19Service.getData().subscribe((res) => {this.country = res["Countries"]});
  }

  addNews(){
    let news_add: News = {
      date: new Date(this.date),
      countrySelected: this.countrySelected,
      news: this.news,
      author: this.covid19Service.getUser()["displayName"]
    };
    this.covid19Service.addNews(news_add);
    //empty the form after adding news
    this.date=undefined;
    this.countrySelected=undefined;
    this.news=undefined; 
  }

}
