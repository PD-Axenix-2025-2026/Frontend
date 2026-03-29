import { Component } from '@angular/core';
import {Header} from './shared/layout/header/header';
import {Hero} from './shared/ui/hero/hero';
import {SearchForm} from './feature/search-form/search-form';
import {SearchStats} from './feature/search-stats/search-stats';
import {RouteFilters} from './feature/route-filters/route-filters';

@Component({
  selector: 'app-root',
  imports: [
    Header,
    Hero,
    SearchForm,
    SearchStats,
    RouteFilters
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
