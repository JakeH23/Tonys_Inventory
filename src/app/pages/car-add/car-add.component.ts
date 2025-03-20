import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../../components/core/core.service';
import { CarService } from '../../services/car.service';
import { CarImagesService } from '../../services/car-images.service';
import { CarImage } from '../../../../src/app/components/carousel/carousel.interface';
import { BoxedChoice } from '../../../../src/app/models/BoxedChoice';

declare const window: any;

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
  myWidget: any;

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
    this.myWidget = window.cloudinary.createUploadWidget(
      {
        uploadPreset: "ml-default", //replace with your own upload preset
        cloudName: "dlkgqdwtm", //replace with your own cloud name
        // cropping: true, //add a cropping step
        // showAdvancedOptions: true,  //add advanced options (public_id and tag)
        // sources: [ "local", "url"], // restrict the upload sources to URL and local files
        multiple: false,  //restrict upload to a single file
        folder: "Cars", //upload files to the specified folder
        // tags: ["users", "profile"], //add the given tags to the uploaded files
        // context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
        //clientAllowedFormats: ["images"], //restrict uploading to image files only
        maxImageFileSize: 700000,  //restrict file size to less than 700KB
        // maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
        // theme: "purple", //change to a purple theme
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          console.log("Done! Here is the image info: ", result.info);
          document?.getElementById("uploadedimage")?.setAttribute("src", result.info.secure_url);
        }
      }
    );
  }

  openWidget() {
    this.myWidget.open();
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
        this.image = result.Image;
        this.carForm.patchValue({ id: result.Id })
      });
  }
}
