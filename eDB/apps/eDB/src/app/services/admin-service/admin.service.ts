// admin.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import {
  ApplicationOverviewDto,
  CreateApplicationDto,
} from '../../models/application-overview.model';
import { PaginatedResponse } from '../../models/paged-result.model';
import { UserProfile } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = 'http://localhost:9101/api/admin/users';
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:9101/api/admin';
  private queryClient = inject(QueryClient);

  /**
   * Fetches users with given parameters.
   * @param cursor Cursor for pagination (represents the last User's sort field value or a composite object).
   * @param searchParam Search query.
   * @param sortParam Sort parameters in the format "field,direction".
   * @returns Promise of PaginatedResponse.
   */
  async queryUsers(
    cursor: number | string | null,
    searchParam?: string,
    sortParam?: string
  ): Promise<PaginatedResponse<UserProfile>> {
    let params = new HttpParams();

    if (cursor !== null && cursor !== undefined) {
      if (typeof cursor === 'string') {
        try {
          const parsedCursor = JSON.parse(cursor);

          if (
            typeof parsedCursor === 'object' &&
            parsedCursor.value !== undefined &&
            parsedCursor.id !== undefined
          ) {
            params = params.set('cursor', JSON.stringify(parsedCursor));
          } else {
            params = params.set('cursor', cursor); // Raw string fallback
          }
        } catch (error) {
          console.error('Failed to parse cursor:', error);
          params = params.set('cursor', cursor); // Fallback to original cursor
        }
      } else {
        params = params.set('cursor', cursor.toString()); // Convert numbers to string
      }
    }

    if (searchParam && searchParam.trim() !== '') {
      params = params.set('search', searchParam.trim());
    }

    if (sortParam && sortParam.trim() !== '') {
      const [sortField, sortDirection] = sortParam.split(',');
      const backendSortField = this.mapSortFieldToBackend(sortField);
      const backendSortParam = `${backendSortField},${sortDirection}`;
      params = params.set('sort', backendSortParam);
    }

    console.log(`Fetching users with params: ${params.toString()}`);

    return lastValueFrom(
      this.http.get<PaginatedResponse<UserProfile>>(this.apiUrl, { params })
    );
  }

  fetchUser(userId: number) {
    const userSignal = signal<UserProfile | null>(null); // Initialize a signal
    injectQuery(() => ({
      queryKey: ['user', userId],
      queryFn: async () => {
        const user = await firstValueFrom(
          this.http.get<UserProfile>(`${this.baseUrl}/users/${userId}`)
        );
        if (!user) {
          throw new Error('User not found');
        }
        userSignal.set(user); // Update the signal when data is fetched
        return user;
      },
    }));
    return userSignal; // Return the signal
  }

  deleteUser() {
    return injectMutation(() => ({
      mutationFn: async (userId: number) => {
        return firstValueFrom(
          this.http.delete<void>(`${this.baseUrl}/users/${userId}`)
        );
      },
      onSuccess: () => {
        // Invalidate queries related to applications to refresh the data
        this.queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    }));
  }

  fetchApplications() {
    return injectQuery(() => ({
      queryKey: ['applications'],
      queryFn: async () => {
        const subscriptions = await firstValueFrom(
          this.http.get<ApplicationOverviewDto[]>(
            `${this.baseUrl}/applications-overview`
          )
        );
        if (!subscriptions) {
          throw new Error('Subscriptions not found');
        }
        return subscriptions;
      },
    }));
  }

  deleteApplication() {
    return injectMutation(() => ({
      mutationFn: async (applicationId: number) => {
        return firstValueFrom(
          this.http.delete<void>(
            `${this.baseUrl}/applications/${applicationId}`
          )
        );
      },
      onSuccess: () => {
        // Invalidate queries related to applications to refresh the data
        this.queryClient.invalidateQueries({ queryKey: ['applications'] });
      },
    }));
  }

  addApplicationMutation() {
    return injectMutation(() => ({
      mutationFn: async (application: CreateApplicationDto) => {
        return firstValueFrom(
          this.http.post(`${this.baseUrl}/applications/create`, application)
        );
      },
      onSuccess: () => {
        // Invalidate the subscriptions query to refresh data
        this.queryClient.invalidateQueries({ queryKey: ['applications'] });
      },
    }));
  }

  revokeSubscription() {
    return injectMutation(() => ({
      mutationFn: async ({
        applicationId,
        userId,
      }: {
        applicationId: number;
        userId: number;
      }) => {
        return firstValueFrom(
          this.http.delete<void>(
            `${this.baseUrl}/applications/${applicationId}/subscriptions/${userId}`
          )
        );
      },
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['applications'] });
      },
    }));
  }

  /**
   * Maps frontend sortField to backend sortField.
   * @param sortField Frontend sort field.
   * @returns Backend sort field.
   */
  public mapSortFieldToBackend(sortField: string): keyof UserProfile {
    const fieldMapping: { [key: string]: keyof UserProfile } = {
      firstname: 'firstName',
      lastname: 'lastName',
      email: 'email',
      role: 'role',
      state: 'state',
      id: 'id',
    };
    return fieldMapping[sortField.toLowerCase()] || 'id';
  }
}
