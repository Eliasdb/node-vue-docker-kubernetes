// src/app/components/login-form/login-form.component.ts
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  UiButtonComponent,
  UiPasswordInputComponent,
  UiTextInputComponent,
  UiTitleComponent,
} from '@eDB/shared-ui';
import { FormUtilsService } from '@eDB/shared-utils';
import { NotificationService } from 'carbon-components-angular'; // Import NotificationService
import { jwtDecode } from 'jwt-decode';
import { Credentials, LoginResponse } from '../../../../models/auth.model'; // Import Credentials
import { AuthService } from '../../../../services/auth-service/auth.service';
import { loginFormFields } from './login-form.config';

@Component({
  selector: 'platform-portal-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiTextInputComponent,
    UiPasswordInputComponent,
    UiButtonComponent,
    UiTitleComponent,
  ],
  template: `
    <div class="login-form-container">
      <section class="login-form-title">
        <ui-title text="Log in to eDB"></ui-title>
      </section>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <div *ngFor="let field of fieldDefinitions">
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
          </div>

          <ui-button
            type="submit"
            icon="faArrowRight"
            class="login-btn"
            [isExpressive]="true"
            [fullWidth]="true"
            [disabled]="loginForm.invalid || isLoading"
            [loading]="isLoading"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </ui-button>
        </div>
      </form>

      <section>
        <p>Don't have an account?</p>
        <ui-button
          icon="faPlus"
          [fullWidth]="true"
          [isExpressive]="true"
          [variant]="'tertiary'"
          (click)="navigateToRegister()"
        >
          Create one
        </ui-button>
      </section>
    </div>
  `,
  styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
  private formUtils = inject(FormUtilsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService); // Inject NotificationService

  loginForm!: FormGroup;
  isLoading = false;

  // Define field definitions
  fieldDefinitions = loginFormFields;

  // Initialize the mutation
  loginMutation = this.authService.loginMutation();

  ngOnInit(): void {
    this.loginForm = this.formUtils.createFormGroup(loginFormFields);
  }

  isFieldInvalid(controlName: string): boolean {
    return this.formUtils.isFieldInvalid(this.loginForm, controlName);
  }

  getErrorMessage(controlName: string): string {
    const field = loginFormFields.find((f) => f.controlName === controlName);
    return field
      ? this.formUtils.getErrorMessage(
          this.loginForm,
          controlName,
          field.errorMessages
        )
      : '';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const credentials: Credentials = this.loginForm.getRawValue();

      this.loginMutation.mutate(credentials, {
        onSuccess: (response: LoginResponse) => {
          console.log('Login successful:', response);
          // Decode token if needed
          const decodedToken = jwtDecode(response.token);
          console.log('Decoded Token:', decodedToken);

          // Handle token storage via AuthService
          this.authService.handleLogin(response.token);

          // Navigate to dashboard
          this.router.navigate(['/dashboard']);

          // Show success notification
          this.notificationService.showToast({
            type: 'success',
            title: 'Success',
            subtitle: 'You have successfully logged in.',
            caption: `Welcome back!`,
            duration: 5000,
            smart: true,
          });
          this.isLoading = false; // End submission
        },
        onError: (error: HttpErrorResponse) => {
          console.error('Login failed:', error.message);
          if (error.error && error.error.message) {
            console.error('Error message:', error.error.message);
          }

          this.isLoading = false; // End submission

          // Show error notification
          this.notificationService.showToast({
            type: 'error',
            title: 'Login Failed',
            subtitle: 'Unable to log in.',
            caption: error.error.message || 'An unexpected error occurred.',
            duration: 5000,
            smart: true,
          });
        },
      });
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}
