import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PartService } from 'src/app/services/part.service';
import { PartAddComponent } from '../part-add/part-add.component';

@Component({
  selector: 'app-parts',
  templateUrl: './parts.component.html',
  styleUrls: ['./parts.component.scss'],
})
export class PartsComponent implements OnInit {
  displayedColumns: string[] = [
    'catalogNumber',
    'category',
    'modelNumber',
    'partNumber',
    'vehicleSide',
    'description',
    'action',
  ];
  dataSource!: MatTableDataSource<any>;
  allData: any[] = [];
  selectedCategory: string | null = null;
  selectedVehicleSide: string | null = null;
  isLoading = false;
  hasError = false;
  errorMessage = '';
  activeFilterLabel = 'All parts';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filterInput') filterInput!: ElementRef; // Add ViewChild for the input field

  constructor(
    private _dialog: MatDialog,
    private _partService: PartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getPartList();
  }

  openAddPartForm() {
    const dialogRef = this._dialog.open(PartAddComponent);
    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getPartList();
        }
      },
    });
  }

  getPartList() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this._partService.getPartList().subscribe({
      next: (res) => {
        this.allData = res;
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'We could not load your parts right now. Please try again.';
        console.log(err);
      },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.activeFilterLabel = filterValue.trim() ? `Filtered by “${filterValue.trim()}”` : 'All parts';
  }

  filterByCategory() {
    if (this.selectedCategory) {
      this.dataSource.data = this.allData.filter(
        (part) => part.Category === this.selectedCategory
      );
      this.activeFilterLabel = `Category: ${this.selectedCategory}`;
    } else {
      this.dataSource.data = this.allData;
      this.activeFilterLabel = 'All parts';
    }
  }

  filterByVehicleSide() {
    if (this.selectedVehicleSide) {
      this.dataSource.data = this.allData.filter(
        (part) => part.VehicleSide === this.selectedVehicleSide
      );
      this.activeFilterLabel = `Side: ${this.selectedVehicleSide}`;
    } else {
      this.dataSource.data = this.allData;
      this.activeFilterLabel = 'All parts';
    }
  }

  clearFilters() {
    this.selectedCategory = null;
    this.selectedVehicleSide = null;
    this.dataSource.filter = '';
    this.dataSource.data = this.allData;
    this.activeFilterLabel = 'All parts';
    if (this.filterInput) {
      this.filterInput.nativeElement.value = '';
    }
  }

  navigateToId(id: number) {
    this.router.navigate([`/parts/${id}`]);
  }

  openEditForm(data: any) {
    const dialogRef = this._dialog.open(PartAddComponent, {
      data,
      width: '100%',
    });

    dialogRef.afterClosed().subscribe({
      next: (val) => {
        if (val) {
          this.getPartList();
        }
      },
    });
  }
}
