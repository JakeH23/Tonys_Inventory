import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

type SnackBarTone = 'info' | 'success' | 'warning' | 'error';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar(message: string, action = 'Dismiss', tone: SnackBarTone = 'info', duration = 4000) {
    this._snackBar.open(message, action, {
      duration,
      verticalPosition: 'top',
      panelClass: [`snackbar-${tone}`],
    });
  }
}
