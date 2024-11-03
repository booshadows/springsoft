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
import { NgxSpinnerModule, NgxSpinnerService } from "ngx-spinner";
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';


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
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatSnackBarModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  imageUrl: string | null | undefined;
  profileForm!: FormGroup;
  userId: string | number | undefined;

  constructor(private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar

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
      this.spinner.show();
      const updatedProfile: UserProfile = {
        id: this.userId,
        ...this.profileForm.value,
        image: this.imageUrl
      };
      console.log(updatedProfile)
      this.userProfileService.updateUserProfile(updatedProfile).subscribe(
        (response) => {
          //hide spinner and show snackbar
          this.spinner.hide();
          this.snackBar.open('Profile updated successfully!', 'x', {
            duration: 3000,
            verticalPosition: 'bottom',
          });
        },
        (error) => {
          //hide spinner and show snackbar
          this.spinner.hide();
          this.snackBar.open('Failed to update profile. Please try again.', 'x', {
            duration: 3000,
            verticalPosition: 'bottom',
          });
        }
      );
    }
  }
}
