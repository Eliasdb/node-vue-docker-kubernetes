import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StructuredListModule } from 'carbon-components-angular';
import { UiButtonComponent } from '../../buttons/button/button.component';
import { UiIconComponent } from '../../icon/icon.component';
import { UiPasswordInputComponent } from '../../inputs/password-input/password-input.component';
import { UiTextInputComponent } from '../../inputs/text-input/input.component';

@Component({
  selector: 'ui-structured-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StructuredListModule,
    UiIconComponent,
    UiButtonComponent,
    UiTextInputComponent,
    UiPasswordInputComponent,
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

      <ng-container *ngIf="editMode">
        <cds-list-row
          *ngFor="let row of rows; let rowIndex = index; trackBy: trackByFn"
        >
          <cds-list-column class="w-20">
            <p class="row-0">{{ row[0] }}</p>
          </cds-list-column>

          <cds-list-column class="w-60">
            <ng-container *ngIf="!isEditing(rowIndex); else editTemplate">
              <section class="skeleton-text-wrapper">
                <p>{{ row[1] }}</p>
              </section>
            </ng-container>
            <ng-template #editTemplate>
              <div class="input-button-container">
                <ng-container [ngSwitch]="row[0]">
                  <ng-container *ngSwitchCase="'Password'">
                    <ui-password-input
                      [(ngModel)]="inputValues.newPassword"
                      label="New password"
                      placeholder="Enter new password"
                    ></ui-password-input>
                    <ui-password-input
                      [(ngModel)]="inputValues.confirmPassword"
                      label="Confirm password"
                      placeholder="Confirm new password"
                    ></ui-password-input>
                  </ng-container>
                  <ng-container *ngSwitchCase="'Name'">
                    <ui-text-input
                      [(ngModel)]="inputValues.firstName"
                      label="First name"
                      placeholder="Enter first name"
                    ></ui-text-input>
                    <ui-text-input
                      [(ngModel)]="inputValues.lastName"
                      label="Last name"
                      placeholder="Enter last name"
                    ></ui-text-input>
                  </ng-container>
                  <ng-container *ngSwitchDefault>
                    <ui-text-input
                      [(ngModel)]="inputValues.value"
                      [label]="'Update your ' + row[0].toLowerCase()"
                      placeholder="Enter new value"
                    ></ui-text-input>
                  </ng-container>
                </ng-container>
                <div class="button-container">
                  <ui-button
                    (buttonClick)="cancelEdit.emit(rowIndex)"
                    variant="secondary"
                  >
                    Cancel
                  </ui-button>
                  <ui-button
                    (buttonClick)="updateEdit.emit(rowIndex)"
                    variant="primary"
                  >
                    Update
                  </ui-button>
                </div>
              </div>
            </ng-template>
          </cds-list-column>

          <cds-list-column>
            <div
              class="action-container"
              [ngClass]="{
                'disabled-action': isEditingAny && !isEditing(rowIndex)
              }"
              (click)="onActionClick(rowIndex)"
            >
              <!-- Hide the action content if the row is in edit mode -->
              <ng-container *ngIf="!isEditing(rowIndex)">
                <ng-container [ngSwitch]="header">
                  <ng-container *ngSwitchCase="'Offboarding'">
                    <span class="delete-account-btn-container">Delete</span>
                    <ui-icon
                      name="faTrash"
                      size="16"
                      class="icon-gap"
                      color="red"
                    ></ui-icon>
                  </ng-container>
                  <ng-container *ngSwitchDefault>
                    Edit
                    <ui-icon name="faEdit" size="16" class="icon-gap"></ui-icon>
                  </ng-container>
                </ng-container>
              </ng-container>
            </div>
          </cds-list-column>
        </cds-list-row>
      </ng-container>

      <ng-container *ngIf="!editMode">
        <cds-list-row
          *ngFor="let row of rows; let rowIndex = index; trackBy: trackByFn"
        >
          <cds-list-column class="w-20">
            <p class="row-0">{{ row[0] }}</p>
          </cds-list-column>

          <cds-list-column class="w-60">
            <ng-container>
              <section class="skeleton-text-wrapper">
                <p>{{ row[1] }}</p>
              </section>
            </ng-container>
          </cds-list-column>
        </cds-list-row>
      </ng-container>
    </cds-structured-list>
  `,
  styleUrls: ['./structured-list.component.scss'],
})
export class UiStructuredListComponent {
  @Input() header = '';
  @Input() headerIcon = '';
  @Input() rows: string[][] = [];
  @Input() editingRowIndex: number | null = null;
  @Input() isEditingAny = false;
  @Input() inputValues: any = {};

  @Input() editMode: boolean = false; // New input to control edit visibility

  @Output() actionClick = new EventEmitter<number>();
  @Output() updateEdit = new EventEmitter<number>();
  @Output() cancelEdit = new EventEmitter<number>();

  isEditing(rowIndex: number): boolean {
    return this.editingRowIndex === rowIndex;
  }

  onActionClick(rowIndex: number): void {
    this.actionClick.emit(rowIndex);
  }
  trackByFn(index: number, row: any): number {
    return row ? row.id || index : index; // Use a unique identifier for each row
  }
}
