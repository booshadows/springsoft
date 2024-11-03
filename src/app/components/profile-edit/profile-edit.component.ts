import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile, UserProfileService } from '../../service/userprofile.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    ReactiveFormsModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  imageUrl: string | null | undefined;
  profileForm!: FormGroup;
  userId: string | undefined;

  constructor(private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    //get id from url
    this.route.paramMap.subscribe((params: ParamMap) => {
    const userId = params.get('id');
    if(userId) {
      this.userId = userId;
      //get user details
      this.userProfileService.getUserProfile(userId).subscribe(data => {
        console.log(data);
        this.profileForm.patchValue(data);
        this.imageUrl = data.image;
      });
    }
  });
  }

   initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        console.log(file)
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const updatedProfile: UserProfile = {
        id: this.userId,
        ...this.profileForm.value,
        image: this.imageUrl
      };
      console.log(updatedProfile)
      this.userProfileService.updateUserProfile(updatedProfile).subscribe(
        (response) => {
          console.log('Profile updated successfully:', response);
        },
        (error) => {
          console.error('Error updating profile:', error);
        }
      );
    }
  }
}
