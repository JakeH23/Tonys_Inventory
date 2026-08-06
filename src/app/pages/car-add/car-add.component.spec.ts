import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CoreService } from '../../components/core/core.service';
import { CarImagesService } from '../../services/car-images.service';
import { CarService } from '../../services/car.service';
import { CarAddComponent } from './car-add.component';

describe('CarAddComponent', () => {
  let component: CarAddComponent;
  let carService: jasmine.SpyObj<CarService>;
  let carImagesService: jasmine.SpyObj<CarImagesService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<CarAddComponent>>;
  let coreService: jasmine.SpyObj<CoreService>;

  beforeEach(() => {
    carService = jasmine.createSpyObj('CarService', ['addCar', 'updateCar']);
    carImagesService = jasmine.createSpyObj('CarImagesService', ['uploadCarImage']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    coreService = jasmine.createSpyObj('CoreService', ['openSnackBar']);

    component = new CarAddComponent(
      new FormBuilder(),
      carService as any,
      carImagesService as any,
      dialogRef as any,
      { EstimatedValue: [{ EstimatedCost: 100, DateChanged: '2025-01-01T00:00:00.000Z' }] },
      coreService as any
    );
  });

  it('should initialize the form with the latest estimated value', () => {
    component.ngOnInit();
    expect(component.carForm.get('EstimatedValue')?.value).toBe(100);
  });

  it('should block submission and show validation feedback when the form is invalid', () => {
    component.onFormSubmit();

    expect(component.attemptedInvalidSubmit).toBeTrue();
    expect(coreService.openSnackBar).toHaveBeenCalledWith('Please complete the highlighted fields first.', 'Dismiss', 'error');
    expect(carService.addCar).not.toHaveBeenCalled();
  });

  it('should add a car and close the dialog with the new id', () => {
    carService.addCar.and.returnValue(of({ id: 42 }));
    component.carForm.patchValue({
      ManufacturersCode: 'ABC123',
      Make: 'Ford',
      Model: 'Mustang',
      EstimatedValue: 125,
      Boxed: true,
    });

    component.onFormSubmit();

    expect(carService.addCar).toHaveBeenCalled();
    const payload = carService.addCar.calls.argsFor(0)[0] as any;
    expect(payload.EstimatedValue[0].EstimatedCost).toBe(125);
    expect(dialogRef.close).toHaveBeenCalledWith(42);
  });
});
