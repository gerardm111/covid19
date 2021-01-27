export class News{
    date: Date;
    countrySelected: string;
    news: Text;
    author: string;

    constructor(date: Date,
        countrySelected: string,
        news: Text,
        author: string){
            this.date=date;
            this.countrySelected=countrySelected;
            this.news=news;
            this.author=author;
    }
}