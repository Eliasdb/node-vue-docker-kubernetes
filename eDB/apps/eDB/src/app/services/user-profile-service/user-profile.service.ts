import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly apiUrl = 'http://localhost:9101/api/profile/settings';

  constructor(private http: HttpClient) {}

  fetchUserProfile() {
    return injectQuery<UserProfile>(() => ({
      queryKey: ['userProfile'],
      queryFn: async () => {
        const profile = await firstValueFrom(
          this.http.get<UserProfile>(this.apiUrl)
        );
        if (!profile) {
          throw new Error('User profile not found');
        }
        return profile;
      },
    }));
  }
}
