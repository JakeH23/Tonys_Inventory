import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarAddComponent } from '../car-add/car-add.component';
import { CarService } from '../../services/car.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CoreService } from '../../components/core/core.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss'],
})
export class CarsComponent implements OnInit {
  displayedColumns: string[] = [
    'make',
    'model',
    'manufacturersCode',
    'estimatedValue',
    'boxed',
    // 'notes',
    'action',
  ];
  dataSource!: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private _dialog: MatDialog,
    private _carService: CarService,
    private _coreService: CoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getCarList();
  }

  openAddCarForm() {
    const dialogRef = this._dialog.open(CarAddComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getCarList();
        }
      },
    });
  }

  getCarList() {
    this._carService.getCarList().subscribe({
      next: (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: console.log,
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  navigateToId(id: number){
    this.router.navigate([`/cars/${id}`]);
  }

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(CarAddComponent, {
      data,
      width: '100%',
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getCarList();
        }
      },
    });
  }
}
