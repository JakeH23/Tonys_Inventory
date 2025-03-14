import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { StatsService } from '../../services/stats.service';
import { CarImage } from '../../components/carousel/carousel.interface';
import { CarImagesService } from '../../services/car-images.service';

@Component({
  selector: 'app-stats-home',
  templateUrl: './stats-home.component.html',
  styleUrls: ['./stats-home.component.scss'],
})
export class StatsHomeComponent implements OnInit {
  cars: CarImage[] = [];

  totalCarsCount: number;
  totalCarsValue: number;
  boxedTotal: number;
  unboxedTotal: number;
  displayedColumns: string[] = [
    'make',
    'model',
    'manufacturersCode',
    'estimatedValue',
  ];
  dataSource!: MatTableDataSource<any>; 
  
  
  constructor(
    private _statsService: StatsService,
    private _carImagesService: CarImagesService
  ) {}

  ngOnInit(): void {
    this.getAllStatistics();
    this.getRandomCarImages();
  }

  getAllStatistics() {
    this._statsService.getAllStatistics().subscribe({
      next: (res) => {
        this.totalCarsCount = res.statistics.totalCarsCount; 
        this.totalCarsValue = res.statistics.totalCarsValue; 
        this.boxedTotal = res.statistics.boxedTotal; 
        this.unboxedTotal = res.statistics.unboxedTotal; 
        this.dataSource = new MatTableDataSource(res.statistics.mostExpensiveCars);
      },
      error: console.log,
    });
  }

  getRandomCarImages() {
    this._carImagesService.getRandomCarImages().subscribe({
      next: (res) => {
        this.cars = res;
      },
      error: console.log,
    });
  } 
}
