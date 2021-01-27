import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as Chart from 'chart.js';
import { $ } from 'protractor';

import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomePageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
  
(function(){
    
    var canvas = <HTMLCanvasElement> document.getElementById("myChart");
    var ctx = canvas.getContext('2d');
    console.log(ctx);
    var myPieChart = new Chart(ctx, {
      type: 'pie',
      data:{
        labels: ["test1", "test2"],
        datasets: [{
          label: 'Test',
          data:[300,50],
          backgroundColor: ["red", "blue"],
          borderWidth:1
        }]
      },
      options: {
        legend: {
          display:true
        },
        responsive: true,
      }});
  });
