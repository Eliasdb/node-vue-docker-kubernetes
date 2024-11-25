// ui-table.component.ts

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaginationModule, TableModule } from 'carbon-components-angular';
import { TableModel } from 'carbon-components-angular/table';

export interface SortEvent {
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, TableModule, PaginationModule],
  template: `
    <cds-table-container>
      <cds-table-header>
        <h4 cdsTableHeaderTitle>{{ title }}</h4>
        <p cdsTableHeaderDescription>{{ description }}</p>
      </cds-table-header>

      <cds-table
        [model]="model"
        [sortable]="sortable"
        [showSelectionColumn]="showSelectionColumn"
        [stickyHeader]="stickyHeader"
        [isDataGrid]="isDataGrid"
        (rowClick)="onRowClick($event)"
        (sort)="simpleSort($event)"
        [skeleton]="skeleton"
      ></cds-table>

      <cds-pagination
        *ngIf="showPagination"
        [model]="model"
        (selectPage)="onPageChange($event)"
      ></cds-pagination>
    </cds-table-container>
  `,
  styles: [
    `
      /* Optional: Add any additional styling here */
    `,
  ],
})
export class UiTableComponent {
  @Input() title = 'Table Title';
  @Input() description = 'Table description goes here.';
  @Input() model!: TableModel;
  @Input() sortable = true;
  @Input() showSelectionColumn = true;
  @Input() stickyHeader = false;
  @Input() isDataGrid = false;
  @Input() showPagination = true;
  @Input() skeleton = false;

  @Output() rowClicked = new EventEmitter<number>();
  @Output() pageChanged = new EventEmitter<number>();
  @Output() sortChanged = new EventEmitter<SortEvent>();

  onRowClick(index: number): void {
    this.rowClicked.emit(index);
  }

  onPageChange(page: number): void {
    this.pageChanged.emit(page);
  }

  /**
   * Handles the sort event emitted by the cds-table component.
   * @param index The index of the column to sort.
   */
  simpleSort(index: number): void {
    const headerItem = this.model.header[index];
    let sortDirection: 'asc' | 'desc' = 'asc';

    if (headerItem.sorted) {
      // Toggle the sorting direction
      headerItem.ascending = !headerItem.ascending;
      sortDirection = headerItem.ascending ? 'asc' : 'desc';
    } else {
      // Reset all other headers
      this.model.header.forEach((item, idx) => {
        item.sorted = false;
        item.ascending = true;
      });
      // Set the sorting direction to ascending by default
      headerItem.sorted = true;
      headerItem.ascending = true;
      sortDirection = 'asc';
    }

    // Emit the sort change event to parent component
    const sortField = headerItem.metadata?.sortField || headerItem.data;
    this.sortChanged.emit({
      sortField,
      sortDirection,
    });
  }
}
