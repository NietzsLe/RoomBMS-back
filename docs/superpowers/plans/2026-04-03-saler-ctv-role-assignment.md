# Saler CTV Role Assignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users with SALER role to assign CTV role to other users under their management, and manage those users' information.

**Architecture:** Add authorization constraints in `UserConstraint` following existing pattern. Extend `UserService.update()` to handle Saler-specific permissions. Add new env vars for SALER_ROLEID and CTV_ROLEID.

**Tech Stack:** NestJS, TypeORM, class-validator

---

## File Changes Summary

| File | Change |
|------|--------|
| `.env` | Add `SALER_ROLEID=saler` and `CTV_ROLEID=ctv` |
| `src/services/constraints/user.helper.ts` | Add `JustSalerCanAssignCTV()` and `SalerCanManageUser()` methods |
| `src/services/user.service.ts` | Update `update()` to use new Saler constraints |

---

## Task 1: Add Environment Variables

**Files:**
- Modify: `.env`

- [ ] **Step 1: Add SALER_ROLEID and CTV_ROLEID to .env**

Add at the end of `.env`:
```
SALER_ROLEID=saler
CTV_ROLEID=ctv
```

---

## Task 2: Add Saler Constraint Methods

**Files:**
- Modify: `src/services/constraints/user.helper.ts:279-330`

- [ ] **Step 1: Add `JustSalerCanAssignCTV()` method**

Add this method to `UserConstraint` class (after line 279):

```typescript
/**
 * Check if requestor (Saler) can assign CTV role to target user.
 * Conditions:
 * - Requestor must have SALER role
 * - Target user must have no roles yet
 * - Target user must have manager = requestor
 *
 * @returns void on success, throws HttpException on failure
 */
JustSalerCanAssignCTV(
  requestorRoleIDs: string[],
  requestorID: string,
  targetUser: User,
) {
  // Check if requestor has SALER role
  let isSaler = false;
  for (const role of requestorRoleIDs) {
    if (role == process.env.SUPER_ADMIN_ROLEID) return; // Super Admin bypasses
    if (role == process.env.ADMIN_ROLEID) return; // Admin bypasses
    if (role == process.env.SALER_ROLEID) isSaler = true;
  }

  if (!isSaler) {
    throw new HttpException(
      'Only Saler can assign CTV role',
      HttpStatus.FORBIDDEN,
    );
  }

  // Check if target user already has roles
  if (targetUser.roles && targetUser.roles.length > 0) {
    throw new HttpException(
      'Target user already has a role',
      HttpStatus.FORBIDDEN,
    );
  }

  // Check if requestor is the manager of target user
  if (!targetUser.manager || targetUser.manager.username !== requestorID) {
    throw new HttpException(
      'Target user must have you as manager',
      HttpStatus.FORBIDDEN,
    );
  }
}
```

- [ ] **Step 2: Add `SalerCanManageUser()` method**

Add this method to `UserConstraint` class (after `JustSalerCanAssignCTV`):

```typescript
/**
 * Check if Saler can manage (edit info of) target user.
 * Conditions:
 * - Requestor must have SALER role
 * - Target user must have manager = requestor
 * - Target user must NOT be admin or super-admin
 *
 * @returns void on success, throws HttpException on failure
 */
SalerCanManageUser(
  requestorRoleIDs: string[],
  requestorID: string,
  targetUser: User,
) {
  // Check if requestor has SALER role
  let isSaler = false;
  for (const role of requestorRoleIDs) {
    if (role == process.env.SUPER_ADMIN_ROLEID) return; // Super Admin bypasses
    if (role == process.env.ADMIN_ROLEID) return; // Admin bypasses
    if (role == process.env.SALER_ROLEID) isSaler = true;
  }

  if (!isSaler) {
    throw new HttpException(
      'Only Saler can manage this user',
      HttpStatus.FORBIDDEN,
    );
  }

  // Check if requestor is the manager of target user
  if (!targetUser.manager || targetUser.manager.username !== requestorID) {
    throw new HttpException(
      'You are not the manager of this user',
      HttpStatus.FORBIDDEN,
    );
  }

  // Check if target user is admin or super-admin - Saler cannot manage
  if (targetUser.roles && targetUser.roles.length > 0) {
    for (const role of targetUser.roles) {
      if (
        role.roleID == process.env.SUPER_ADMIN_ROLEID ||
        role.roleID == process.env.ADMIN_ROLEID
      ) {
        throw new HttpException(
          "You can't manage an admin",
          HttpStatus.FORBIDDEN,
        );
      }
    }
  }
}
```

---

## Task 3: Update UserService.update()

**Files:**
- Modify: `src/services/user.service.ts:230-277`

- [ ] **Step 1: Understand current flow**

Current `update()` flow:
1. Validate user exists
2. Call `RequestorManageUser()` to check if can manage
3. Call `JustAdminCanUpdateManagerFieldOfUser()`
4. Call `JustAdminCanAssignRoles()` - only admins can assign roles

- [ ] **Step 2: Add Saler-specific logic**

In `UserService.update()`, after line 262 where `JustAdminCanAssignRoles` is called, add Saler handling:

Find this section (around line 262-265):
```typescript
this.constraint.JustAdminCanAssignRoles(
  requestorRoleIDs,
  updateUserDTO.roleIDs,
);
```

Replace with:
```typescript
// Determine if requestor is Saler (not Admin/SuperAdmin)
let isSalerOnly = false;
if (requestorRoleIDs.includes(process.env.SALER_ROLEID ?? 'saler') &&
    !requestorRoleIDs.includes(process.env.SUPER_ADMIN_ROLEID ?? 'super-admin') &&
    !requestorRoleIDs.includes(process.env.ADMIN_ROLEID ?? 'admin')) {
  isSalerOnly = true;
}

if (isSalerOnly && updateUserDTO.roleIDs && updateUserDTO.roleIDs.length > 0) {
  // Saler can only assign CTV role
  this.constraint.JustSalerCanAssignCTV(
    requestorRoleIDs,
    requestorID,
    result[0],
  );
} else if (!isSalerOnly) {
  // Admin/SuperAdmin flow - existing logic
  this.constraint.JustAdminCanAssignRoles(
    requestorRoleIDs,
    updateUserDTO.roleIDs,
  );
}
```

Also, update the `RequestorManageUser` check to allow Saler to manage their users:

Find the section around line 249-261:
```typescript
let IsAdmin = 0;
if (result[0]) {
  IsAdmin = this.constraint.RequestorManageUser(
    requestorRoleIDs,
    requestorID,
    result[0],
  );
  this.constraint.JustAdminCanUpdateManagerFieldOfUser(
    IsAdmin,
    result[0],
    updateUserDTO,
  );
}
```

Add Saler check after the admin check:
```typescript
let IsAdmin = 0;
if (result[0]) {
  IsAdmin = this.constraint.RequestorManageUser(
    requestorRoleIDs,
    requestorID,
    result[0],
  );
  
  // Also check if Saler can manage this user
  if (IsAdmin === 0 && requestorRoleIDs.includes(process.env.SALER_ROLEID ?? 'saler')) {
    this.constraint.SalerCanManageUser(
      requestorRoleIDs,
      requestorID,
      result[0],
    );
  }
  
  this.constraint.JustAdminCanUpdateManagerFieldOfUser(
    IsAdmin,
    result[0],
    updateUserDTO,
  );
}
```

---

## Task 4: Add TypeScript import for HttpStatus

**Files:**
- Modify: `src/services/constraints/user.helper.ts:1-10`

- [ ] **Step 1: Verify HttpStatus is imported**

Check that `HttpException, HttpStatus` is already imported at line 1. If not, add:
```typescript
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
```

---

## Verification Checklist

After implementation, verify:

1. Saler can assign CTV role to user with no roles and manager = Saler
2. Saler CANNOT assign CTV role to user who already has a role
3. Saler CANNOT assign CTV role to user whose manager is not Saler
4. Saler CAN edit info (name, phone, etc.) of users with manager = Saler
5. Saler CANNOT edit info of users who are Admin/SuperAdmin (even if manager is Saler)
6. Saler CANNOT edit role of user who already has any role
7. Admin/SuperAdmin flow unchanged
