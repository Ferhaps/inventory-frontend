import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DefaultDialogComponent } from '@ferhaps/easy-ui-lib';


@Component({
  selector: 'app-default-delete-popup',
  standalone: true,
  imports: [
    DefaultDialogComponent,
    MatButtonModule,
  ],
  templateUrl: './default-delete-popup.component.html',
  styleUrls: ['./default-delete-popup.component.scss']
})
export class DefaultDeletePopupComponent {
  private dialogRef: MatDialogRef<DefaultDeletePopupComponent> = inject(MatDialogRef);

  constructor(@Inject(MAT_DIALOG_DATA) public data: string) { }

  protected deleteAndClose(): void {
    this.dialogRef.close(true);
  }
}
