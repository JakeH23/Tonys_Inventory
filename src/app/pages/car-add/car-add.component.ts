import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../../components/core/core.service';
import { CarService } from '../../services/car.service';
import { CarImagesService } from '../../services/car-images.service';
import { CarImage } from '../../../../src/app/components/carousel/carousel.interface';
import { BoxedChoice } from '../../../../src/app/models/BoxedChoice';
import {
  buildEstimatedValueHistory,
  getMostRecentEstimatedValue,
  normalizeEstimatedValueHistory,
} from '../../../../src/app/models/estimated-value.model';

@Component({
  selector: 'app-car-add',
  templateUrl: './car-add.component.html',
  styleUrls: ['./car-add.component.scss'],
})

export class CarAddComponent implements OnInit {
  carForm: FormGroup;
  carImage: CarImage | null = null;
  @ViewChild("fileInput") fileInput: any;

  image = '';
  boxedChoices: BoxedChoice[] = [{ label: "Yes", value: true }, { label: "No", value: false }];

  constructor(
    private _fb: FormBuilder,
    private _carService: CarService,
    private _carImagesService: CarImagesService,
    private _dialogRef: MatDialogRef<CarAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    this.carForm = this._fb.group({
      Id: '',
      ManufacturersCode: ['', [Validators.required, Validators.maxLength(50)]],
      Make: ['', [Validators.required, Validators.maxLength(80)]],
      Model: ['', [Validators.required, Validators.maxLength(80)]],
      EstimatedValue: [0, [Validators.required, Validators.min(0)]],
      Boxed: [false, Validators.required],
      Notes: ['', Validators.maxLength(300)],
      Image: ''
    });
  }

  ngOnInit(): void {
    const estimatedValue = getMostRecentEstimatedValue(this.data?.EstimatedValue);
    this.carForm.patchValue({
      ...this.data,
      EstimatedValue: estimatedValue,
    });
  }

  onFormSubmit() {
    if (this.carForm.invalid) {
      this.carForm.markAllAsTouched();
      this._coreService.openSnackBar('Please complete the highlighted fields first.');
      return;
    }

    const formValue = this.carForm.value;
    const payload = {
      ...formValue,
      EstimatedValue: buildEstimatedValueHistory(
        normalizeEstimatedValueHistory(this.data?.EstimatedValue),
        Number(formValue.EstimatedValue)
      ),
    };

    if (this.carForm.controls['Id'].value != '') {
      this._carService.updateCar(this.carForm.controls['Id'].value, payload).subscribe({
        next: () => {
          this._coreService.openSnackBar('Car updated successfully');
          this._dialogRef.close(this.carForm.controls['Id'].value);
        },
        error: (err: any) => {
          this._coreService.openSnackBar('Unable to update the car right now.');
          console.error(err);
        },
      });
    } else {
      this._carService.addCar(payload).subscribe({
        next: (res) => {
          this._coreService.openSnackBar('Car added successfully');
          this._dialogRef.close(res.id);
        },
        error: (err: any) => {
          this._coreService.openSnackBar('Unable to add the car right now.');
          console.error(err);
        },
      });
    }
  }

  async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    // Subscribe to getNextCarId to get the next car ID
    this._carImagesService.uploadCarImage(await this.toBase64(file))
      .subscribe((result: { src: string; alt: string }) => {
        this.image = result.src;
        this.carForm.patchValue({ Id: result.alt }); // Update the form with the image ID
      });
  }

  toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
}
