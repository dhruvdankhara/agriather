# 🧪 Profile Image Feature - Quick Testing Guide

## Quick Start

### 1. Start the Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 2. Seed Test Data (if not already done)
```bash
cd backend
npm run seed
```

---

## Test Scenarios

### 🔵 **Admin Profile Test**

**Login:**
- Email: `admin@agriather.com`
- Password: `admin123`

**Steps:**
1. Login with admin credentials
2. Click on "Profile" in the left sidebar
3. You should see `/admin/profile` page
4. Click the camera icon to upload an avatar
5. Select an image (< 5MB)
6. Wait for upload (spinner shows)
7. Avatar should update immediately
8. Check sidebar - avatar should appear there too

**Expected Results:**
- ✅ Profile page loads correctly
- ✅ AvatarUpload component visible at top
- ✅ Can select and upload image
- ✅ Success toast notification appears
- ✅ Avatar updates in profile page
- ✅ Avatar updates in sidebar
- ✅ Can edit personal info (firstname, lastname, phone)
- ✅ Can change password
- ✅ Role shows as "admin" with Shield icon

---

### 🟢 **Supplier Profile Test**

**Login:**
- Email: `supplier@test.com`
- Password: `supplier123`

**Steps:**
1. Login with supplier credentials
2. Click on "Profile" in the left sidebar
3. You should see `/supplier/profile` page
4. Click the camera icon to upload an avatar
5. Select an image (< 5MB)
6. Wait for upload (spinner shows)
7. Avatar should update immediately
8. Check sidebar - avatar should appear there too

**Expected Results:**
- ✅ Profile page loads correctly
- ✅ AvatarUpload component visible at top
- ✅ Can select and upload image
- ✅ Success toast notification appears
- ✅ Avatar updates in profile page
- ✅ Avatar updates in sidebar
- ✅ Can edit personal info (firstname, lastname, phone)
- ✅ Can edit business info (businessName, businessAddress)
- ✅ GST number is displayed (read-only)
- ✅ Can change password

---

### 🟡 **Customer Profile Test**

**Login:**
- Email: `customer@test.com`
- Password: `customer123`

**Steps:**
1. Login with customer credentials
2. Click on profile icon/link in navbar
3. You should see `/profile` page
4. Click the camera icon to upload an avatar
5. Select an image (< 5MB)
6. Wait for upload (spinner shows)
7. Avatar should update immediately
8. Check navbar - avatar should appear there too

**Expected Results:**
- ✅ Profile page loads correctly
- ✅ AvatarUpload component visible at top
- ✅ Can select and upload image
- ✅ Success toast notification appears
- ✅ Avatar updates in profile page
- ✅ Avatar updates in navbar
- ✅ Can edit personal info
- ✅ Can manage addresses
- ✅ Can change password

---

## Validation Tests

### ✅ **File Size Validation**
1. Try uploading a file > 5MB
2. Should show error: "File size must be less than 5MB"
3. Upload should not proceed

### ✅ **File Type Validation**
1. Try uploading a PDF or text file
2. Should show error: "Please upload an image file"
3. Upload should not proceed

### ✅ **Success Flow**
1. Upload valid image (< 5MB, image type)
2. Should see preview immediately
3. Should see loading spinner
4. Should see success toast: "Avatar updated successfully"
5. Avatar should appear in profile
6. Avatar should appear in sidebar/navbar

### ✅ **Error Handling**
1. Disconnect internet
2. Try uploading image
3. Should show error toast
4. Should not break the component
5. Reconnect internet and try again

### ✅ **Multiple Uploads**
1. Upload first image
2. Wait for success
3. Upload second image
4. Should replace first image
5. Old image should be deleted from Cloudinary

---

## Navigation Tests

### Admin Navigation
```
/admin → Dashboard
/admin/profile → Profile page ✅ NEW
```

### Supplier Navigation
```
/supplier → Dashboard
/supplier/profile → Profile page ✅ NEW
```

### Customer Navigation
```
/ → Home
/profile → Profile page (already existed, now has avatar)
```

---

## Browser Console Checks

### Look for these logs during upload:
```
🎯 Starting avatar update...
📸 Uploading avatar to /api/v1/auth/avatar
✅ Avatar updated successfully
```

### Should NOT see any errors:
- ❌ No 404 errors for routes
- ❌ No console errors about missing components
- ❌ No Redux state errors
- ❌ No Cloudinary upload errors

---

## Quick Visual Checklist

### Profile Page Should Show:
- [ ] Avatar section at the top (circular avatar or initials)
- [ ] Camera icon button on hover
- [ ] Personal information section
- [ ] Business information section (Supplier only)
- [ ] Role display (Admin only)
- [ ] Password change section
- [ ] Edit/Save/Cancel buttons

### Avatar Upload Should:
- [ ] Show current avatar or initials
- [ ] Have gradient background (if no avatar)
- [ ] Show camera icon on hover
- [ ] Open file picker on click
- [ ] Show preview immediately after selection
- [ ] Show loading spinner during upload
- [ ] Update avatar after successful upload

### Sidebar/Navbar Should:
- [ ] Have "Profile" link
- [ ] Show User icon next to Profile
- [ ] Highlight Profile when on profile page
- [ ] Show avatar in user info section (if available)

---

## Common Issues & Solutions

### Issue: "Profile page not found"
**Solution**: Make sure you've added the routes in `routes/index.jsx`

### Issue: "Cannot upload image"
**Solution**: Check Cloudinary credentials in backend `.env` file

### Issue: "Avatar not showing after upload"
**Solution**: Check browser console for errors, verify Cloudinary URL is accessible

### Issue: "Old avatar not deleted"
**Solution**: Verify Cloudinary API has delete permissions

### Issue: "Profile link not in sidebar"
**Solution**: Check `AdminLayout.jsx` and `SupplierLayout.jsx` have Profile in navigation array

---

## Browser DevTools Checks

### Network Tab
1. Upload an image
2. Should see PUT request to `/api/v1/auth/avatar`
3. Status should be 200
4. Response should contain updated user object with avatar URL

### Redux DevTools
1. Upload an image
2. Should see `auth/updateAvatar/pending` action
3. Should see `auth/updateAvatar/fulfilled` action
4. State should update with new avatar URL

### Application Tab (localStorage)
1. After avatar upload
2. Check `user` in localStorage
3. Should contain updated user object with avatar URL

---

## Performance Checks

### Upload Speed
- Small images (< 500KB): < 2 seconds
- Medium images (500KB - 2MB): 2-5 seconds
- Large images (2MB - 5MB): 5-10 seconds

### Page Load Speed
- Profile page should load instantly
- Avatar should display without delay
- No layout shift when avatar loads

---

## Accessibility Checks

### Keyboard Navigation
- [ ] Can tab to camera icon button
- [ ] Can press Enter to open file picker
- [ ] Can tab through form fields
- [ ] Can save/cancel with keyboard

### Screen Reader
- [ ] Avatar has alt text
- [ ] Buttons have proper labels
- [ ] Form fields have labels
- [ ] Error messages are announced

---

## Mobile Testing

### Responsive Design
- [ ] Profile page works on mobile
- [ ] Avatar upload works on mobile
- [ ] Sidebar collapses on mobile
- [ ] Touch targets are large enough
- [ ] Forms are mobile-friendly

---

## Cross-Browser Testing

Test in:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

All should work identically.

---

## Final Verification

After testing all three roles, verify:

✅ **All Routes Work**
- `/admin/profile` - Admin profile
- `/supplier/profile` - Supplier profile
- `/profile` - Customer profile

✅ **All Features Work**
- Avatar upload for all roles
- Personal info editing for all roles
- Password change for all roles
- Navigation links for all roles

✅ **All Validations Work**
- File size validation (5MB limit)
- File type validation (images only)
- Form validation (required fields)

✅ **All UI Elements Work**
- AvatarUpload component
- Profile forms
- Toast notifications
- Loading states

✅ **No Errors**
- No console errors
- No network errors
- No Redux errors
- No render errors

---

## Success Criteria

### ✅ Feature is complete when:

1. **All three user roles can:**
   - Navigate to their profile page
   - Upload a profile picture
   - See their avatar in sidebar/navbar
   - Edit their personal information
   - Change their password

2. **All validations work:**
   - File size limit enforced
   - File type restriction enforced
   - Success/error notifications shown

3. **No bugs or errors:**
   - No console errors
   - No broken routes
   - No missing components
   - No styling issues

4. **Code quality:**
   - Follows Agriather conventions
   - Uses ApiResponse pattern
   - Uses Redux properly
   - Has proper error handling

---

## 🎉 Ready to Test!

Start both servers, login with test accounts, and verify all features work as expected. The profile image feature should be fully functional across all user roles.

**Happy Testing! 🚀**
