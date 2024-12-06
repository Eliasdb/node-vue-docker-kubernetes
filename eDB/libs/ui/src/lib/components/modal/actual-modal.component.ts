import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalModule } from 'carbon-components-angular';
import { UiButtonComponent } from '../buttons/button/button.component';
import { UiTextAreaComponent } from '../inputs/text-area/text-area.component';
import { UiTextInputComponent } from '../inputs/text-input/input.component';

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [
    ModalModule,
    ReactiveFormsModule,
    UiButtonComponent,
    UiTextInputComponent,
    UiTextAreaComponent,
  ],
  template: `
    <cds-modal [open]="true" [size]="'md'" (close)="onCancel()">
      <cds-modal-header (closeSelect)="onCancel()">
        <h2 cdsModalHeaderLabel>Admin</h2>
        <h3 cdsModalHeaderHeading>{{ header }}</h3>
      </cds-modal-header>

      @if (template) {
        <ng-container
          *ngTemplateOutlet="template; context: context"
        ></ng-container>
      } @else {
        @if (hasForm) {
          <form [formGroup]="form" class="form">
            <ui-text-input
              label="Application Name"
              placeholder="Enter application name"
              formControlName="name"
              theme="light"
            ></ui-text-input>

            <section class="row-2">
              <ui-text-input
                label="Route path"
                placeholder="Enter route path"
                formControlName="routePath"
                theme="light"
              ></ui-text-input>
              <ui-text-input
                label="Icon URL"
                placeholder="Enter icon URL"
                formControlName="iconUrl"
                theme="light"
              ></ui-text-input>
            </section>

            <ui-text-input
              label="Tags (comma-separated)"
              placeholder="Enter tags"
              formControlName="tags"
              theme="light"
            ></ui-text-input>

            <ui-textarea
              label="Description"
              placeholder="Enter application description"
              formControlName="description"
              theme="light"
            ></ui-textarea>
          </form>
        } @else {
          <div class="confirmation-text">
            <p>{{ content }}</p>
          </div>
        }
      }

      <cds-modal-footer>
        <ui-button
          variant="secondary"
          (buttonClick)="onCancel()"
          [fullWidth]="true"
          size="sm"
          [isExpressive]="true"
        >
          Cancel
        </ui-button>
        <ui-button
          variant="primary"
          [disabled]="hasForm && form.invalid"
          (buttonClick)="onSave()"
          [fullWidth]="true"
          [isExpressive]="true"
          size="sm"
        >
          Confirm
        </ui-button>
      </cds-modal-footer>
    </cds-modal>
  `,
})
export class UiModalComponent {
  @Input() header: string = 'Confirmation';
  @Input() content: string = 'Are you sure you want to proceed?';
  @Input() hasForm: boolean = false;
  @Input() template?: TemplateRef<any>;
  @Input() context: any;
  @Input() cancelRoute?: string; // Optional route for cancelation navigation
  @Input() form: FormGroup;

  @Output() save = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [''],
      routePath: [''],
      iconUrl: [''],
      tags: [''],
      description: [''],
    });
  }

  onCancel(): void {
    if (this.cancelRoute) {
      this.router.navigate([this.cancelRoute]); // Navigate to the specified route
    }
    this.close.emit();
  }

  onSave(): void {
    if (this.hasForm) {
      const formValue = this.form.value;
      formValue.tags = formValue.tags
        .split(',')
        .map((tag: string) => tag.trim());
      this.save.emit(formValue);
    } else {
      this.save.emit();
      if (this.cancelRoute) {
        this.router.navigate([this.cancelRoute]);
      }
    }
    this.onCancel();
  }
}
