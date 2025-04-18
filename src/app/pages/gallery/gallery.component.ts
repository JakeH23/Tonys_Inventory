import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { StatsService } from 'src/app/services/stats.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryComponent implements OnInit {
  carsArray: number[] = [];
  groupedCarsArray: number[][] = []; // Grouped into rows of 4

  constructor(private statsService: StatsService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.statsService.getCarCount().subscribe({
      next: (count: number) => {
        this.carsArray = Array.from({ length: count }, (_, i) => i + 1);
        const shuffledArray = this.shuffleArray(this.carsArray); // Shuffle the array
        this.groupedCarsArray = this.groupIntoRows(shuffledArray, 4); // Group into rows of 4
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching car count:', err);
      }
    });
    this.cdr.detectChanges();
  }

  private groupIntoRows(array: number[], itemsPerRow: number): number[][] {
    const groupedArray = [];
    for (let i = 0; i < array.length; i += itemsPerRow) {
      groupedArray.push(array.slice(i, i + itemsPerRow));
    }
    return groupedArray;
  }

  private shuffleArray(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }
}