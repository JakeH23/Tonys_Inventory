import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CarAddComponent } from 'src/app/pages/car-add/car-add.component';

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
    openAddEditCarForm() {
        const dialogRef = this._dialog.open(CarAddComponent, {
            width: "100%"
        });
        dialogRef.afterClosed().subscribe({
            next: (val) => {
                if (val) {
                    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                        this.router.navigate([`/cars/${val}`]);
                    });
                }
            },
        });
    }
}