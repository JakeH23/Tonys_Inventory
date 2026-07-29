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
  selectedImage: string | null = null; // Store the currently selected image for the pop-out view

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
      Images: []
    });
  }

  ngOnInit(): void {
    this.getPartById();
  }

  getPartById() {
    this._partService.getPartById(this.id).subscribe({
      next: (res) => {
        this.partForm.patchValue(res);
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
    const imageCount = this.partForm.value.Images.length;
    this._partImagesService.updatePartImage(await this.toBase64(file), this.partForm.value.CatalogNumber, imageCount)
      .subscribe((result: { src: string }) => {
        const updatedImages = [...this.partForm.value.Images, result.src];
        this.partForm.patchValue({ Images: updatedImages });
        this.cdr.detectChanges();
        this.onFormSubmit();
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

  getPartImages(): string[] {
    return this.partForm.get('Images')?.value || [];
  }

  openImagePopOut(image: string): void {
    this.selectedImage = image; // Set the selected image for the pop-out view
  }

  closeImagePopOut(): void {
    this.selectedImage = null; // Clear the selected image to close the pop-out view
  }
}
