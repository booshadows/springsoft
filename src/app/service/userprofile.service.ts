import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface UserProfile {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'https://dummyjson.com/users/1';
  private apiKey = 'f2dd75bc166449e1be26ab75fed13499';

  constructor(private http: HttpClient) {}

  // Fetch user profile data
  getUserProfile(userId: string): Observable<UserProfile> {
    const headers = new HttpHeaders({
      'Content-Type':  'application/json',      
      'x-api-key': this.apiKey
    });
    return this.http.get<UserProfile>(`${this.apiUrl}${userId}`, { headers }).pipe(
      delay(100)
    );
  }

  // Update user profile data
  updateUserProfile(profileData: UserProfile): Observable<any> {
    return this.http.put(`${this.apiUrl}${profileData.id}`, profileData);
  }
}
