import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoreService } from '../../components/core/core.service';
import { PartService } from '../../services/part.service';
import { ActivatedRoute } from '@angular/router';
import { PartImagesService } from 'src/app/services/part-images.service';

@Component({
  selector: 'app-part-edit',
  templateUrl: './part-edit.component.html',
  styleUrls: ['./part-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartEditComponent implements OnInit {
  partForm: FormGroup;
  id: number;
  image = "";

  constructor(
    private _fb: FormBuilder,
    private _partService: PartService,
    private _coreService: CoreService,
    private route: ActivatedRoute,
    private _partImagesService: PartImagesService,
    private cdr: ChangeDetectorRef
  ) {
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    this.partForm = this._fb.group({
      Id: this.id,
      CatalogNumber: '',
      Category: '',
      ModelNumber: '',
      PartNumber: '',
      VehicleSide: '',
      Description: '',
      Notes: '',
      Images: 0
    });
  }

  ngOnInit(): void {
    this.getPartById();
  }

  getPartById() {
    this._partService.getPartById(this.id).subscribe({
      next: (res) => {
        this.partForm.patchValue(res);
        this.image = res.Image;
      },
      error: console.log,
    });
  }

  onFormSubmit() {
    if (this.partForm.valid) {
      this._partService
        .updatePart(this.id, this.partForm.value)
        .subscribe({
          next: () => {
            this._coreService.openSnackBar('Part detail updated!');
          },
          error: (err: any) => {
            console.error(err);
          },
        });
    }
  }

  async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    this._partImagesService.updatePartImage(await this.toBase64(file), this.partForm.value.CatalogNumber)
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
