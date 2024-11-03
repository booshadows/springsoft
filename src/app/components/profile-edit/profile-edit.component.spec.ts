import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { ProfileEditComponent } from './profile-edit.component';
import { UserProfile, UserProfileService } from '../../service/userprofile.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, throwError } from 'rxjs';

describe('ProfileEditComponent', () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;
  let userProfileService: jasmine.SpyObj<UserProfileService>;
  let spinnerService: jasmine.SpyObj<NgxSpinnerService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const mockUserProfile: UserProfile = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    image: 'https://dummyjson.com/icon/miar/128'
  };

  beforeEach(async () => {
    const spinnerSubject = new BehaviorSubject({
      name: undefined,
      show: false,
      bdColor: 'rgba(51,51,51,0.8)',
      size: 'medium',
      color: '#fff',
      type: 'ball-scale-multiple',
      fullScreen: true
    });
    const userProfileServiceSpy = jasmine.createSpyObj('UserProfileService', ['getUserProfile', 'updateUserProfile']);
    const spinnerServiceSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide', 'getSpinner']);
    spinnerServiceSpy.getSpinner.and.returnValue(spinnerSubject);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ProfileEditComponent
      ],
      providers: [
        { provide: UserProfileService, useValue: userProfileServiceSpy },
        { provide: NgxSpinnerService, useValue: spinnerServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => '123'
            } as unknown as ParamMap)
          }
        }
      ]
    }).compileComponents();

    userProfileService = TestBed.inject(UserProfileService) as jasmine.SpyObj<UserProfileService>;
    spinnerService = TestBed.inject(NgxSpinnerService) as jasmine.SpyObj<NgxSpinnerService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
  });

  beforeEach(() => {
    userProfileService.getUserProfile.and.returnValue(of(mockUserProfile));
    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the form with required fields', () => {
      expect(component.profileForm.get('firstName')).toBeTruthy();
      expect(component.profileForm.get('lastName')).toBeTruthy();
      expect(component.profileForm.get('email')).toBeTruthy();
      expect(component.profileForm.get('phone')).toBeTruthy();
    });

    it('should load user data on init', () => {
      expect(userProfileService.getUserProfile).toHaveBeenCalledWith('123');
      expect(component.profileForm.get('firstName')?.value).toBe(mockUserProfile.firstName);
      expect(component.profileForm.get('lastName')?.value).toBe(mockUserProfile.lastName);
      expect(component.profileForm.get('email')?.value).toBe(mockUserProfile.email);
      expect(component.profileForm.get('phone')?.value).toBe(mockUserProfile.phone);
      expect(component.imageUrl).toBe(mockUserProfile.image);
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const form = component.profileForm;
      form.controls['firstName'].setValue('');
      form.controls['lastName'].setValue('');
      form.controls['email'].setValue('');

      expect(form.valid).toBeFalsy();
      expect(form.controls['firstName'].errors?.['required']).toBeTruthy();
      expect(form.controls['lastName'].errors?.['required']).toBeTruthy();
      expect(form.controls['email'].errors?.['required']).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.profileForm.controls['email'];
      
      emailControl.setValue('invalid-email');
      expect(emailControl.errors?.['email']).toBeTruthy();
      
      emailControl.setValue('valid@email.com');
      expect(emailControl.errors).toBeNull();
    });
  });

  describe('Image Handling', () => {
    it('should handle image file selection', fakeAsync(() => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      const event = { target: { files: [file] } };
      
      // Mock FileReader
      const mockFileReader: FileReader = {
        readAsDataURL: jasmine.createSpy('readAsDataURL'),
        onload: null,
        result: 'data:image/png;base64,test'
      } as any;
      
      spyOn(window, 'FileReader').and.returnValue(mockFileReader);
      
      component.onFileSelected(event);
      
      // Simulate FileReader onload
      mockFileReader.onload?.({target: mockFileReader} as any);
      tick();
      
      expect(component.imageUrl).toBe('data:image/png;base64,test');
    }));
  });

  describe('Form Submission', () => {
    it('should successfully submit valid form data', fakeAsync(() => {
      userProfileService.updateUserProfile.and.returnValue(of(mockUserProfile));
      
      component.profileForm.patchValue(mockUserProfile);
      component.imageUrl = mockUserProfile.image;
      component.userId = mockUserProfile.id.toString();
      
      component.onSubmit();
      tick();

      expect(spinnerService.show).toHaveBeenCalled();
      expect(userProfileService.updateUserProfile).toHaveBeenCalledWith({
        ...mockUserProfile,
        id: mockUserProfile.id
      });
      expect(spinnerService.hide).toHaveBeenCalled();
      expect(snackBar.open).toHaveBeenCalledWith(
        'Profile updated successfully!',
        'x',
        jasmine.any(Object)
      );
    }));

    it('should handle submission errors', fakeAsync(() => {
      // Reset previous calls to snackBar.open if any
      snackBar.open.calls.reset();
  
      // Mock an error response from updateUserProfile
      userProfileService.updateUserProfile.and.returnValue(throwError(() => new Error('Update failed')));
  
      // Populate the form with valid data
      component.profileForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '1234567890'
      });
      component.imageUrl = mockUserProfile.image;
      component.userId = mockUserProfile.id;
  
      // Ensure the form is valid
      expect(component.profileForm.valid).toBeTruthy();
  
      // Call onSubmit to trigger the update
      component.onSubmit();
      tick(); // Wait for observable completion
      fixture.detectChanges(); // Apply changes after async operations
  
      // Handle any remaining timers
      flush();
  
      // Assertions
      expect(spinnerService.show).toHaveBeenCalled();
      expect(userProfileService.updateUserProfile).toHaveBeenCalled();
      expect(spinnerService.hide).toHaveBeenCalled();
  
      // Verify the error snackbar message was shown
      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to update profile. Please try again.',
        'x',
        jasmine.any(Object)
      );
  }));
  
  

    it('should not submit invalid form', () => {
      component.profileForm.controls['email'].setValue('invalid-email');
      component.onSubmit();
      
      expect(userProfileService.updateUserProfile).not.toHaveBeenCalled();
    });
  });
});