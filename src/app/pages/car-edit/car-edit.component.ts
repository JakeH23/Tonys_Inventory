import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoreService } from '../../components/core/core.service';
import { CarService } from '../../services/car.service';
import { ActivatedRoute } from '@angular/router';
import { CarImagesService } from 'src/app/services/car-images.service';

@Component({
  selector: 'app-car-edit',
  templateUrl: './car-edit.component.html',
  styleUrls: ['./car-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    private _carImagesService: CarImagesService,
    private cdr: ChangeDetectorRef
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
        this.image = res.Image ?? '';
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

  async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    this._carImagesService.updateCarImage(await this.toBase64(file), this.id)
      .subscribe((result: { src: string }) => {
        this.image = result.src;
        this.cdr.detectChanges();
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
