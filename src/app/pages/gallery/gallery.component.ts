import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CarService } from 'src/app/services/car.service';
import { Car } from 'src/app/models/car.model';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

interface GalleryCar {
  Id: number;
  Make: string;
  Model: string;
  ManufacturersCode: string;
  Image: string;
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnInit, OnDestroy {
  carsArray: GalleryCar[] = [];
  filteredCarsArray: GalleryCar[] = [];
  groupedCarsArray: GalleryCar[][] = [];
  flippedCards: Record<number, boolean> = {};
  filterControl = new FormControl<string>('');
  filterValue = '';
  private destroy$ = new Subject<void>();

  constructor(private carService: CarService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.filterControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value: string | null) => {
        this.filterValue = (value || '').trim().toLowerCase();
        this.applyFilter();
      });

    this.carService.getCarList({ pageSize: 0, sortBy: 'Id', sortDirection: 'asc' }).subscribe({
      next: (res: any) => {
        const cars = Array.isArray(res) ? res : res?.items ?? [];
        const galleryCars = (cars as Car[])
          .filter((car) => !!car.Id)
          .map((car) => ({
            Id: Number(car.Id),
            Make: car.Make || 'Unknown make',
            Model: car.Model || 'Unknown model',
            ManufacturersCode: car.ManufacturersCode || '',
            Image: `https://res.cloudinary.com/dlkgqdwtm/image/upload/${car.Id}.png`,
          }));

        this.carsArray = this.shuffleArray(galleryCars);
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching gallery cars:', err);
      }
    });
    this.cdr.detectChanges();
  }

  clearSearch() {
    this.filterControl.setValue('', { emitEvent: true });
  }

  toggleFlip(id: number) {
    this.flippedCards[id] = !this.flippedCards[id];
  }

  isFlipped(id: number): boolean {
    return !!this.flippedCards[id];
  }

  get resultsCount(): number {
    return this.filteredCarsArray.length;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFilter() {
    this.flippedCards = {};
    this.filteredCarsArray = this.filterCars(this.carsArray, this.filterValue);
    this.groupedCarsArray = this.groupIntoRows(this.filteredCarsArray, 4);
    this.cdr.detectChanges();
  }

  private filterCars(cars: GalleryCar[], filter: string): GalleryCar[] {
    if (!filter) {
      return [...cars];
    }

    return cars.filter((car) => {
      const searchable = [car.Id, car.Make, car.Model, car.ManufacturersCode]
        .map((value) => String(value || '').toLowerCase())
        .join(' ');
      return searchable.includes(filter);
    });
  }

  private groupIntoRows(array: GalleryCar[], itemsPerRow: number): GalleryCar[][] {
    const groupedArray: GalleryCar[][] = [];
    for (let i = 0; i < array.length; i += itemsPerRow) {
      groupedArray.push(array.slice(i, i + itemsPerRow));
    }
    return groupedArray;
  }

  private shuffleArray(array: GalleryCar[]): GalleryCar[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  }
}