import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoreService } from './core.service';

describe('CoreService', () => {
  let service: CoreService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        CoreService,
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });

    service = TestBed.inject(CoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open a snack bar with the expected tone styling', () => {
    service.openSnackBar('Saved', 'Close', 'success', 1500);

    expect(snackBar.open).toHaveBeenCalledWith('Saved', 'Close', jasmine.objectContaining({
      duration: 1500,
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    }));
  });
});
