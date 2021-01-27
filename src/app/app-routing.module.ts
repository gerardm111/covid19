import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CountryPageComponent } from './country-page/country-page.component';
import { AddNewsComponent } from './add-news/add-news.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {path: "home-page", component: HomePageComponent},
  {path: "country-page", component: CountryPageComponent},
  {path: "add-news", component: AddNewsComponent,
canActivate: [AuthGuard]},
  {path: "", pathMatch:"full", redirectTo:"home-page"},
  {path: "**", redirectTo: "home-page"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
