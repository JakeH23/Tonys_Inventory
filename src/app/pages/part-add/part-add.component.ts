import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoreService } from '../../components/core/core.service';
import { PartService } from '../../services/part.service';
import { PartImagesService } from '../../services/part-images.service';

@Component({
  selector: 'app-part-add',
  templateUrl: './part-add.component.html',
  styleUrls: ['./part-add.component.scss'],
})

export class PartAddComponent implements OnInit {
  partForm: FormGroup;
  @ViewChild("fileInput") fileInput: any;

  readonly requiredControlNames = ['CatalogNumber', 'Category', 'PartNumber', 'Description'];
  readonly sectionRequiredControls: Record<'details' | 'description', string[]> = {
    details: ['CatalogNumber', 'Category', 'PartNumber'],
    description: ['Description'],
  };

  image = '';

  constructor(
    private _fb: FormBuilder,
    private _partService: PartService,
    private _partImagesService: PartImagesService,
    private _dialogRef: MatDialogRef<PartAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
  ) {
    this.partForm = this._fb.group({
      Id: '',
      CatalogNumber: ['', [Validators.required, Validators.maxLength(60)]],
      Category: ['', Validators.required],
      ModelNumber: '',
      PartNumber: ['', [Validators.required, Validators.maxLength(80)]],
      VehicleSide: '',
      Description: ['', [Validators.required, Validators.maxLength(300)]],
      Notes: ['', Validators.maxLength(300)],
      Image: ''
    });
  }

  ngOnInit(): void {
    this.partForm.patchValue(this.data);
  }

  get requiredCompleteCount(): number {
    return this.requiredControlNames.filter((controlName) => {
      const control = this.partForm.get(controlName);
      return !!control && control.valid;
    }).length;
  }

  getSectionSummary(section: 'details' | 'description'): string {
    const controls = this.sectionRequiredControls[section];
    const validCount = controls.filter((controlName) => {
      const control = this.partForm.get(controlName);
      return !!control && control.valid;
    }).length;

    return `${validCount}/${controls.length} required complete`;
  }

  onFormSubmit() {
    if (this.partForm.invalid) {
      this.partForm.markAllAsTouched();
      this._coreService.openSnackBar('Please complete the highlighted fields first.');
      return;
    }

    if (this.partForm.controls['Id'].value != '') {
      this._partService.updatePart(this.partForm.controls['Id'].value, this.partForm.value).subscribe({
        next: () => {
          this._coreService.openSnackBar('Part updated successfully');
          this._dialogRef.close(this.partForm.controls['Id'].value);
        },
        error: (err: any) => {
          this._coreService.openSnackBar('Unable to update the part right now.');
          console.error(err);
        },
      });
    } else {
      this._partService.addPart(this.partForm.value).subscribe({
        next: (res) => {
          this._coreService.openSnackBar('Part added successfully');
          this._dialogRef.close(res.id);
        },
        error: (err: any) => {
          this._coreService.openSnackBar('Unable to add the part right now.');
          console.error(err);
        },
      });
    }
  }

  async onFileSelected(event: any): Promise<void> {
    const file: File = event.target.files[0];
    // Subscribe to getNextPartId to get the next part ID
    this._partImagesService.uploadPartImage(await this.toBase64(file))
      .subscribe((result: { src: string; alt: string }) => {
        this.image = result.src;
        this.partForm.patchValue({ Id: result.alt }); // Update the form with the image ID
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
