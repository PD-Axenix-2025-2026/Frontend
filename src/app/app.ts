import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';
import {Header} from './shared/layout/header/header';
import {Hero} from './shared/ui/hero/hero';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Hero,
    SearchForm,
    SearchStats
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('axenix-frontend');
}
