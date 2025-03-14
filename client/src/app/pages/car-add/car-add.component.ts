import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../../components/core/core.service';
import { CarService } from '../../services/car.service';
import { CarImagesService } from 'src/app/services/car-images.service';
import { CarImage } from 'src/app/components/carousel/carousel.interface';
import { BoxedChoice } from 'src/app/models/BoxedChoice';

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
      id: '',
      manufacturersCode: '',
      make: '',
      model: '',
      estimatedValue: 0,
      boxed: false,
      notes: '',
      thumbnail: ''
    });
  }

  ngOnInit(): void {
    this.carForm.patchValue(this.data);
  }

  onFormSubmit() {
    if (this.carForm.valid) {
      if (this.carForm.controls['id'].value != '') {
        this._carService.updateCar(this.carForm.controls['id'].value, this.carForm.value).subscribe({
          next: () => {
            this._coreService.openSnackBar('Car added successfully');
            this._dialogRef.close(this.carForm.controls['id'].value);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      } else {
        this._carService.addCar(this.carForm.value).subscribe({
          next: (res) => {
            this._coreService.openSnackBar('Car added successfully');
            this._dialogRef.close(res.id);
          },
          error: (err: any) => {
            console.error(err);
          },
        });
      }
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    this._carImagesService.uploadCarImage(formData)
      .subscribe((result: CarImage) => {
        this.image = result.image;
        this.carForm.patchValue({ id: result.id })
      });
  }
}
