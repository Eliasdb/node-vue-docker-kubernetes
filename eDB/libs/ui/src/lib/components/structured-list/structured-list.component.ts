import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
    <cds-structured-list>
      <cds-list-header>
        <cds-list-column>
          <div class="header-container">
            <h3>{{ header }}</h3>
            <ui-icon
              *ngIf="headerIcon"
              [name]="headerIcon"
              size="1.1rem"
              class="icon-gap"
            ></ui-icon>
          </div>
        </cds-list-column>
      </cds-list-header>

      <cds-list-row *ngFor="let row of rows; let rowIndex = index">
        <cds-list-column class="w-20">
          <p>{{ row[0] }}</p>
        </cds-list-column>

        <cds-list-column>
          <ng-container *ngIf="!editMode[rowIndex]">
            <section class="skeleton-text-wrapper">
              <p>{{ row[1] }}</p>
            </section>
          </ng-container>
          <ng-container *ngIf="editMode[rowIndex]">
            <div class="input-button-container">
              <ng-container *ngIf="row[0] === 'Password'">
                <ui-password-input
                  [(ngModel)]="inputValues[rowIndex].newPassword"
                  [label]="'New Password'"
                  placeholder="Enter new password"
                ></ui-password-input>
                <ui-password-input
                  [(ngModel)]="inputValues[rowIndex].confirmPassword"
                  [label]="'Confirm Password'"
                  placeholder="Confirm new password"
                ></ui-password-input>
              </ng-container>
              <ng-container *ngIf="row[0] === 'Name'">
                <ui-text-input
                  [(ngModel)]="inputValues[rowIndex].firstName"
                  [label]="'First Name'"
                  placeholder="Enter first name"
                ></ui-text-input>
                <ui-text-input
                  [(ngModel)]="inputValues[rowIndex].lastName"
                  [label]="'Last Name'"
                  placeholder="Enter last name"
                ></ui-text-input>
              </ng-container>
              <ng-container *ngIf="row[0] !== 'Password' && row[0] !== 'Name'">
                <ui-text-input
                  [(ngModel)]="inputValues[rowIndex].value"
                  [label]="'Update your ' + row[0]"
                  placeholder="Enter new value"
                ></ui-text-input>
              </ng-container>
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
          <ng-container *ngIf="!editMode[rowIndex]">
            <div class="action-container" (click)="onActionClick(rowIndex)">
              <ng-container
                *ngIf="header !== 'Offboarding'"
                class="edit-account-btn-container"
              >
                Edit
                <ui-icon name="faEdit" size="16" class="icon-gap"></ui-icon>
              </ng-container>
              <ng-container *ngIf="header === 'Offboarding'">
                <span class="delete-account-btn-container">Delete</span>
                <ui-icon
                  name="faTrash"
                  size="16"
                  class="icon-gap"
                  [color]="'red'"
                ></ui-icon>
              </ng-container>
            </div>
          </ng-container>
        </cds-list-column>
      </cds-list-row>
    </cds-structured-list>
  `,
  styleUrls: ['./structured-list.component.scss'],
})
export class UiStructuredListComponent {
  @Input() header: string = '';
  @Input() headerIcon: string = '';
  @Input() rows: string[][] = [];

  @Output() rowUpdated = new EventEmitter<{ field: string; value: string }>();
  @Output() deleteProfile = new EventEmitter<void>();

  editMode: boolean[] = [];
  inputValues: { [key: number]: any } = {};

  onActionClick(rowIndex: number): void {
    if (this.header === 'Offboarding') {
      this.confirmAndDeleteProfile();
    } else {
      this.toggleEditMode(rowIndex);
    }
  }

  confirmAndDeleteProfile(): void {
    if (
      confirm(
        'Are you sure you want to delete your profile? This action cannot be undone.'
      )
    ) {
      this.deleteProfile.emit();
    }
  }

  toggleEditMode(rowIndex: number): void {
    this.editMode[rowIndex] = !this.editMode[rowIndex];
    if (this.editMode[rowIndex]) {
      const fieldName = this.rows[rowIndex][0];
      const currentValue = this.rows[rowIndex][1];
      if (fieldName === 'Password') {
        this.inputValues[rowIndex] = { newPassword: '', confirmPassword: '' };
      } else if (fieldName === 'Name') {
        const nameParts = currentValue.split(' ');
        this.inputValues[rowIndex] = {
          firstName: nameParts[0] || '',
          lastName: nameParts[1] || '',
        };
      } else {
        this.inputValues[rowIndex] = { value: currentValue };
      }
    }
  }

  cancelEdit(rowIndex: number): void {
    this.editMode[rowIndex] = false;
  }

  updateEdit(rowIndex: number): void {
    const field = this.rows[rowIndex][0];
    let value = '';

    if (field === 'Password') {
      if (
        this.inputValues[rowIndex].newPassword ===
        this.inputValues[rowIndex].confirmPassword
      ) {
        value = this.inputValues[rowIndex].newPassword;
      } else {
        alert('Passwords do not match.');
        return;
      }
    } else if (field === 'Name') {
      value =
        this.inputValues[rowIndex].firstName +
        ' ' +
        this.inputValues[rowIndex].lastName;
    } else {
      value = this.inputValues[rowIndex].value;
    }

    this.rows[rowIndex][1] = value;
    this.rowUpdated.emit({ field, value });
    this.cancelEdit(rowIndex);
  }
}
