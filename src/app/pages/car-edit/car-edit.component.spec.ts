import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Location } from '@angular/common';
import { of } from 'rxjs';
import { CoreService } from '../../components/core/core.service';
import { CarImagesService } from '../../services/car-images.service';
import { CarService } from '../../services/car.service';
import { CarEditComponent } from './car-edit.component';

describe('CarEditComponent', () => {
  let component: CarEditComponent;
  let carService: jasmine.SpyObj<CarService>;
  let coreService: jasmine.SpyObj<CoreService>;
  let carImagesService: jasmine.SpyObj<CarImagesService>;
  let cdr: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(() => {
    carService = jasmine.createSpyObj('CarService', ['getCarById', 'updateCar']);
    coreService = jasmine.createSpyObj('CoreService', ['openSnackBar']);
    carImagesService = jasmine.createSpyObj('CarImagesService', ['updateCarImage']);
    cdr = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    component = new CarEditComponent(
      new FormBuilder(),
      carService as any,
      coreService as any,
      { params: of({ id: 7 }) } as any,
      carImagesService as any,
      { back: jasmine.createSpy('back') } as unknown as Location,
      cdr as any
    );
  });

  it('should load the car details and patch the form with the latest valuation', () => {
    carService.getCarById.and.returnValue(of({
      Id: 7,
      ManufacturersCode: 'ABC',
      Make: 'Ford',
      Model: 'Mustang',
      EstimatedValue: [{ EstimatedCost: 220, DateChanged: '2025-01-01T00:00:00.000Z' }],
      Image: 'car.png',
    }));

    component.ngOnInit();

    expect(carService.getCarById).toHaveBeenCalledWith(7);
    expect(component.carForm.get('Make')?.value).toBe('Ford');
    expect(component.image).toBe('car.png');
  });

  it('should update the car and refresh the estimated value history', () => {
    (component as any).estimatedValueHistory = [{ EstimatedCost: 100, DateChanged: '2025-01-01T00:00:00.000Z' }];
    component.id = 7;
    component.carForm.patchValue({
      ManufacturersCode: 'ABC',
      Make: 'Ford',
      Model: 'Mustang',
      EstimatedValue: 120,
      Boxed: true,
      Notes: 'Updated',
    });
    carService.updateCar.and.returnValue(of({}));

    component.onFormSubmit();

    expect(carService.updateCar).toHaveBeenCalled();
    expect(coreService.openSnackBar).toHaveBeenCalledWith('Car detail updated!');
    expect(component.carForm.get('EstimatedValue')?.value).toBe(120);
  });
});
