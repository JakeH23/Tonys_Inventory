import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { CoreService } from '../../components/core/core.service';
import { PartImagesService } from '../../services/part-images.service';
import { PartService } from '../../services/part.service';
import { PartAddComponent } from './part-add.component';

describe('PartAddComponent', () => {
  let component: PartAddComponent;
  let partService: jasmine.SpyObj<PartService>;
  let partImagesService: jasmine.SpyObj<PartImagesService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<PartAddComponent>>;
  let coreService: jasmine.SpyObj<CoreService>;

  beforeEach(() => {
    partService = jasmine.createSpyObj('PartService', ['addPart', 'updatePart']);
    partImagesService = jasmine.createSpyObj('PartImagesService', ['uploadPartImage']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    coreService = jasmine.createSpyObj('CoreService', ['openSnackBar']);

    component = new PartAddComponent(
      new FormBuilder(),
      partService as any,
      partImagesService as any,
      dialogRef as any,
      undefined,
      coreService as any
    );
  });

  it('should block submission when required fields are missing', () => {
    component.onFormSubmit();

    expect(component.attemptedInvalidSubmit).toBeTrue();
    expect(coreService.openSnackBar).toHaveBeenCalledWith('Please complete the highlighted fields first.', 'Dismiss', 'error');
    expect(partService.addPart).not.toHaveBeenCalled();
  });

  it('should add a part and close the dialog with the created id', () => {
    partService.addPart.and.returnValue(of({ id: 11 }));
    component.partForm.patchValue({
      CatalogNumber: 'ABC-1',
      Category: 'Electrical',
      PartNumber: 'P-001',
      Description: 'Test part',
    });

    component.onFormSubmit();

    expect(partService.addPart).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalledWith(11);
  });
});
