import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StructuredListModule } from 'carbon-components-angular';
import { UiButtonComponent } from '../button/button.component';
import { UiIconComponent } from '../icon/icon.component';
import { UiPasswordInputComponent } from '../inputs/password-input/password-input.component';
import { UiTextInputComponent } from '../inputs/text-input/input.component';

@Component({
  selector: 'ui-structured-list',
  standalone: true,
  imports: [
    StructuredListModule,
    UiIconComponent,
    CommonModule,
    UiTextInputComponent,
    UiPasswordInputComponent,
    UiButtonComponent,
    FormsModule,
  ],
  template: `
    <cds-structured-list [skeleton]="skeleton">
      <cds-list-header>
        <cds-list-column>
          {{ header }}
          <ui-icon
            *ngIf="headerIcon"
            [name]="headerIcon"
            size="16"
            class="icon-gap"
          ></ui-icon>
        </cds-list-column>
      </cds-list-header>

      <!-- Dynamic rows passed as input -->
      <cds-list-row *ngFor="let row of rows; let rowIndex = index">
        <cds-list-column class="w-30">
          <!-- First column is always static (E-mail, Password) -->
          {{ row[0] }}
        </cds-list-column>

        <cds-list-column>
          <!-- Second column is editable in edit mode -->
          <ng-container *ngIf="!editMode[rowIndex]">
            {{ row[1] }}
          </ng-container>
          <ng-container *ngIf="editMode[rowIndex]">
            <div class="input-button-container">
              <ng-container *ngIf="row[0] === 'Password'">
                <!-- Stack Password Inputs and Buttons -->
                <ui-password-input
                  [(ngModel)]="newPassword"
                  [label]="'New Password'"
                  placeholder="Enter new password"
                ></ui-password-input>
                <ui-password-input
                  [(ngModel)]="confirmPassword"
                  [label]="'Confirm Password'"
                  placeholder="Confirm new password"
                ></ui-password-input>
              </ng-container>
              <ng-container *ngIf="row[0] !== 'Password'">
                <!-- Stack Text Inputs and Buttons -->
                <ui-text-input
                  [(ngModel)]="row[1]"
                  [label]="'Update your e-mail address'"
                  placeholder="Enter new value"
                ></ui-text-input>
              </ng-container>
              <!-- Stack the buttons under the inputs -->
              <div class="button-container">
                <ui-button
                  (buttonClick)="cancelEdit(rowIndex)"
                  variant="secondary"
                  >Cancel</ui-button
                >
                <ui-button
                  (buttonClick)="updateEdit(rowIndex)"
                  variant="primary"
                  >Update</ui-button
                >
              </div>
            </div>
          </ng-container>
        </cds-list-column>

        <cds-list-column>
          <!-- Third column is editable in edit mode -->
          <ng-container *ngIf="!editMode[rowIndex]">
            <div class="edit-container" (click)="toggleEditMode(rowIndex)">
              Edit
              <ui-icon name="faEdit" size="16" class="icon-gap"></ui-icon>
            </div>
          </ng-container>
        </cds-list-column>
      </cds-list-row>
    </cds-structured-list>
  `,
  styleUrls: ['./structured-list.component.scss'],
})
export class UiStructuredListComponent {
  @Input() header: string = ''; // First column header
  @Input() headerIcon: string = ''; // Dynamic icon for the header
  @Input() rows: string[][] = []; // Array of rows for the first and second columns
  @Input() skeleton: boolean = false;

  editMode: boolean[] = []; // Array to track which row is in edit mode
  newPassword: string = ''; // For handling new password input
  confirmPassword: string = ''; // For handling password confirmation

  constructor() {}

  // Toggle edit mode for a specific row
  toggleEditMode(rowIndex: number): void {
    this.editMode[rowIndex] = !this.editMode[rowIndex];
  }

  // Cancel edit and reset the input values
  cancelEdit(rowIndex: number): void {
    this.editMode[rowIndex] = false;
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // Handle the update of row data (for text or password)
  updateEdit(rowIndex: number): void {
    if (this.rowRequiresPasswordUpdate(rowIndex)) {
      // Logic for updating the password (e.g., check if passwords match)
      if (this.newPassword === this.confirmPassword) {
        // Update password and reset fields
        this.rows[rowIndex][1] = this.newPassword;
        this.cancelEdit(rowIndex); // Reset the form
      } else {
        // Handle password mismatch
        alert('Passwords do not match.');
      }
    } else {
      // Update text value
      this.rows[rowIndex][1] = this.rows[rowIndex][1];
      this.cancelEdit(rowIndex); // Reset the form
    }
  }

  // Check if the row requires password update
  rowRequiresPasswordUpdate(rowIndex: number): boolean {
    return this.rows[rowIndex][1] === 'Password';
  }
}
