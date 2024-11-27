import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  UiButtonComponent,
  UiPasswordInputComponent,
  UiTextInputComponent,
} from '@eDB/shared-ui';
import { FormUtilsService } from '@eDB/shared-utils';
import { User } from '../../../../models/user.model';
import { AuthService } from '../../../../services/auth-service/auth.service';
import { registerFormFields } from './register-form.config';

@Component({
  selector: 'platform-portal-register-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiTextInputComponent,
    UiPasswordInputComponent,
    UiButtonComponent,
  ],
  template: `
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <div class="form-row" *ngFor="let row of fieldRows">
          <div class="form-column" *ngFor="let field of row">
            <ng-container *ngIf="field">
              <ui-text-input
                *ngIf="field.controlType === 'text'"
                [formControlName]="field.controlName"
                [label]="field.label"
                [invalid]="isFieldInvalid(field.controlName)"
                [invalidText]="getErrorMessage(field.controlName)"
              ></ui-text-input>

              <ui-password-input
                *ngIf="field.controlType === 'password'"
                [formControlName]="field.controlName"
                [label]="field.label"
                [invalid]="isFieldInvalid(field.controlName)"
                [invalidText]="getErrorMessage(field.controlName)"
              ></ui-password-input>
            </ng-container>
          </div>
        </div>

        <div class="form-row">
          <div class="form-column">
            <ui-button
              type="submit"
              [isExpressive]="true"
              [disabled]="registerForm.invalid || isLoading"
              [fullWidth]="true"
            >
              {{ isLoading ? 'Registering...' : 'Register' }}
            </ui-button>
          </div>
          <div class="form-column">
            <!-- Empty column -->
          </div>
        </div>
      </div>
    </form>
  `,
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent implements OnInit {
  private formUtils = inject(FormUtilsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  fieldRows = registerFormFields;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  validationErrors: { [key: string]: string[] } | null = null;

  ngOnInit(): void {
    const flatFieldDefinitions = this.fieldRows
      .flat()
      .filter((field): field is NonNullable<typeof field> => !!field);

    this.registerForm = this.formUtils.createFormGroup(flatFieldDefinitions);
  }

  isFieldInvalid(controlName: string): boolean {
    return this.formUtils.isFieldInvalid(this.registerForm, controlName);
  }

  getErrorMessage(controlName: string): string {
    const field = this.fieldRows
      .flat()
      .find(
        (f): f is NonNullable<typeof f> => !!f && f.controlName === controlName
      );
    return field
      ? this.formUtils.getErrorMessage(
          this.registerForm,
          controlName,
          field.errorMessages
        )
      : '';
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      this.validationErrors = null;

      const user: User = this.registerForm.getRawValue();

      this.authService.register(user).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          this.registerForm.reset();
          this.router.navigate(['auth/login']);
        },
        error: (error) => {
          this.isLoading = false;
          if (error.errors) {
            this.validationErrors = error.errors;
          } else {
            this.errorMessage =
              error.message || 'An error occurred. Please try again.';
          }
        },
      });
    }
  }
}
