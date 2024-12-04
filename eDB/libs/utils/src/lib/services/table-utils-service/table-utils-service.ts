// src/app/shared/services/table-utils.service.ts

import { Injectable, TemplateRef } from '@angular/core';
import { TableHeaderItem, TableItem } from 'carbon-components-angular';
import {
  ApplicationOverviewDto,
  RowMapperConfig,
  TableColumnConfig,
} from '../../forms/models/table.model';

@Injectable({
  providedIn: 'root',
})
export class TableUtilsService {
  /**
   * Generates table headers dynamically from column configurations.
   * @param columnConfigs Array of column configurations.
   * @returns Array of TableHeaderItem.
   */
  getTableHeaders(
    columnConfigs: TableColumnConfig[],
    activeSortField?: string,
    activeSortDirection?: 'asc' | 'desc'
  ): TableHeaderItem[] {
    return columnConfigs.map(
      (config) =>
        new TableHeaderItem({
          data: config.header,
          sortable: config.sortable,
          sorted: config.sortField === activeSortField,
          ascending:
            activeSortField === config.sortField &&
            activeSortDirection === 'asc',
          metadata: {
            sortField: config.sortField || null,
          },
        })
    );
  }

  /**
   * Maps rows to table items dynamically based on the mapper configuration.
   * Supports expandable rows by handling `isExpandable` and `getExpandedData`.
   * @param rows Array of data rows.
   * @param mapperConfigs Array of row mapper configurations.
   * @param overflowTemplate Optional template for action columns.
   * @returns Array of TableItem arrays.
   */
  prepareData<T>(
    rows: T[],
    mapperConfigs: RowMapperConfig<T>[],
    overflowTemplate?: TemplateRef<any>
  ): TableItem[][] {
    return rows.map((row) =>
      mapperConfigs.map((config) => {
        let data = (row as any)[config.field];

        // Use valueGetter if provided to transform the data
        if (config.valueGetter) {
          data = config.valueGetter(row);
        }

        const tableItem = new TableItem({
          data: config.isTemplate ? row : data,
          template: config.isTemplate ? overflowTemplate : null,
        });

        // Handle expandable rows
        if (config.isExpandable && config.getExpandedData) {
          tableItem.expandedData = config.getExpandedData(row);
          tableItem.expandAsTable = true as any;
        }

        return tableItem;
      })
    );
  }

  /**
   * Creates expanded data for the Subscriptions table.
   * @param app ApplicationOverviewDto instance.
   * @returns Array of TableItem arrays with headers and subscribed users.
   */
  // Inside TableUtilsService
  // In TableUtilsService
  createSubscriptionsExpandedData(
    app: ApplicationOverviewDto,
    actionTemplate: TemplateRef<any>
  ): TableItem[][] {
    // Define headers for the expanded table
    const header = [
      new TableItem({ data: 'ID' }),
      new TableItem({ data: 'User Name' }),
      new TableItem({ data: 'Subscription Date' }),
      new TableItem({ data: 'Actions' }),
    ];

    // Map subscribed users to TableItem[] rows
    const data = app.subscribedUsers.map((user) => {
      // Now create and return the TableItem array for this user
      return [
        new TableItem({
          data: user.userId,
        }),
        new TableItem({ data: user.userName }),
        new TableItem({
          data: new Date(user.subscriptionDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }),
        new TableItem({
          data: { userId: user.userId, applicationId: app.applicationId },
          template: actionTemplate,
        }),
      ];
    });

    // Return as TableItem[][] with header
    return [header, ...data];
  }
}
