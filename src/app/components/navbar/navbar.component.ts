import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CarAddComponent } from 'src/app/pages/car-add/car-add.component';
import { PartAddComponent } from 'src/app/pages/part-add/part-add.component';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {

    constructor(
        private _dialog: MatDialog,
        private router: Router
    ) { }
    openAddCarForm() {
        const dialogRef = this._dialog.open(CarAddComponent, {
            width: 'min(960px, 95vw)',
            maxWidth: '95vw',
            panelClass: 'theme-dialog-panel',
            autoFocus: false,
        });
        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        this.router.navigate([`/cars/${val}`]);
                    });
                }
            },
        });
    }

    openAddPartForm() {
        const dialogRef = this._dialog.open(PartAddComponent, {
            width: 'min(960px, 95vw)',
            maxWidth: '95vw',
            panelClass: 'theme-dialog-panel',
            autoFocus: false,
        });
        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                        this.router.navigate([`/parts/${val}`]);
                    });
                }
            },
        });
    }
}