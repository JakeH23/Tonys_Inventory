import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoreService } from '../../components/core/core.service';
import { CarService } from '../../services/car.service';
import { ActivatedRoute } from '@angular/router';
import { CarImagesService } from 'src/app/services/car-images.service';
import { CarImage } from 'src/app/components/carousel/carousel.interface';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.component.html',
  styleUrls: ['./car-edit.component.scss'],
})
export class CarEditComponent implements OnInit {
  carForm: FormGroup;
  id: number;
  image = "";

  constructor(
    private _fb: FormBuilder,
    private _carService: CarService,
    private _coreService: CoreService,
    private route: ActivatedRoute,
    private _carImagesService: CarImagesService
  ) {
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    this.carForm = this._fb.group({
      Id: this.id,
      ManufacturersCode: '',
      Make: '',
      Model: '',
      EstimatedValue: 0,
      Boxed: false,
      Notes: '',
      Image: ''
    });
  }

  ngOnInit(): void {
    this.getCarById();
  }

  getCarById() {
    this._carService.getCarById(this.id).subscribe({
      next: (res) => {
        this.carForm.patchValue(res);
        this.image = res.image;
      },
      error: console.log,
    });
  }

  onFormSubmit() {
    if (this.carForm.valid) {
      this._carService
        .updateCar(this.id, this.carForm.value)
        .subscribe({
          next: () => {
            this._coreService.openSnackBar('Car detail updated!');
          },
          error: (err: any) => {
            console.error(err);
          },
        });
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    this._carImagesService.updateCarImage(formData, this.id)
      .subscribe((result: CarImage) => {
        this.image = result.image;
      });
  }
}
