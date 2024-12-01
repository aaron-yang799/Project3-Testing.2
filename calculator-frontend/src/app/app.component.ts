import { Component } from '@angular/core';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalculatorComponent, HttpClientModule],
  template: '<app-calculator></app-calculator>'
})
export class AppComponent { }