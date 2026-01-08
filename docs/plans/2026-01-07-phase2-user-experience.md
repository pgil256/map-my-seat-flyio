# Phase 2: User Experience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the app faster and more intuitive for teachers through better onboarding, form UX, and responsive design.

**Architecture:** Incremental UX improvements to existing components. Add new shared components for empty states, progress tracking, and mobile navigation. Enhance forms with inline validation and autosave. All changes use existing Chakra UI patterns.

**Tech Stack:** React 18, Chakra UI, React Router v6, localStorage for user preferences

---

## Task 1: Create Empty State Component

**Files:**
- Create: `frontend/src/common/EmptyState.jsx`

**Step 1: Create the EmptyState component**

```jsx
import { VStack, Text, Button, Box } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction
}) {
  return (
    <VStack
      spacing={4}
      py={12}
      px={6}
      bg="gray.50"
      borderRadius="lg"
      border="2px dashed"
      borderColor="gray.200"
    >
      {icon && (
        <Box color="gray.400" fontSize="4xl">
          {icon}
        </Box>
      )}
      <Text fontSize="lg" fontWeight="semibold" color="gray.600">
        {title}
      </Text>
      {description && (
        <Text color="gray.500" textAlign="center" maxW="sm">
          {description}
        </Text>
      )}
      {actionLabel && (actionTo || onAction) && (
        <Button
          as={actionTo ? RouterLink : undefined}
          to={actionTo}
          onClick={onAction}
          colorScheme="blue"
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </VStack>
  );
}

export default EmptyState;
```

**Step 2: Verify the file was created**

Run: `ls frontend/src/common/EmptyState.jsx`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/common/EmptyState.jsx
git commit -m "feat(ui): add EmptyState component for empty list states

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Add Empty State to PeriodForm

**Files:**
- Modify: `frontend/src/periods/PeriodForm.jsx`

**Step 1: Add import for EmptyState**

Add at top of file with other imports:

```jsx
import EmptyState from "../common/EmptyState";
```

**Step 2: Replace empty grid with EmptyState**

Find the periods mapping section (around line 140-160) and wrap it with a conditional:

Replace:
```jsx
<SimpleGrid columns={3} gap={6}>
  {periods.map((p) => (
```

With:
```jsx
{periods.length === 0 ? (
  <EmptyState
    title="No periods yet"
    description="Create your first class period to start adding students and generating seating charts."
    actionLabel="Create Period"
    onAction={() => document.getElementById("period-title")?.focus()}
  />
) : (
  <SimpleGrid columns={3} gap={6}>
    {periods.map((p) => (
```

And close the conditional after the SimpleGrid closing tag:
```jsx
    ))}
  </SimpleGrid>
)}
```

**Step 3: Add id to title input for focus**

Find the Input for period title and add an id:

```jsx
<Input
  id="period-title"
  name="title"
  value={formData.title}
```

**Step 4: Test manually**

Run: `npm run dev`
Expected: When logged in with no periods, shows "No periods yet" empty state with button

**Step 5: Commit**

```bash
git add frontend/src/periods/PeriodForm.jsx
git commit -m "feat(ui): add empty state to periods list

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Add Empty State to StudentForm

**Files:**
- Modify: `frontend/src/students/StudentForm.jsx`

**Step 1: Add import for EmptyState**

Add at top of file:

```jsx
import EmptyState from "../common/EmptyState";
```

**Step 2: Add empty state for students list**

Find where students are mapped in the right panel (the SimpleGrid with student cards) and wrap with conditional.

Find the student cards mapping section and replace the SimpleGrid wrapper:

```jsx
{students.length === 0 ? (
  <EmptyState
    title="No students yet"
    description="Add students individually using the form, or upload a CSV file with your class roster."
    actionLabel="Add First Student"
    onAction={() => document.getElementById("student-name")?.focus()}
  />
) : (
  <SimpleGrid columns={2} spacing={4}>
    {students.map((s) => (
      // ... existing student card code
    ))}
  </SimpleGrid>
)}
```

**Step 3: Add id to student name input**

Find the Input for student name and add an id:

```jsx
<Input
  id="student-name"
  name="name"
  value={formData.name}
```

**Step 4: Test manually**

Run: `npm run dev`
Expected: Period with no students shows "No students yet" empty state

**Step 5: Commit**

```bash
git add frontend/src/students/StudentForm.jsx
git commit -m "feat(ui): add empty state to students list

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Welcome Modal Component

**Files:**
- Create: `frontend/src/common/WelcomeModal.jsx`

**Step 1: Create the WelcomeModal component**

```jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  HStack,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const WELCOME_SHOWN_KEY = "seating-welcome-shown";

function WelcomeModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [hasShown, setHasShown] = useState(true);

  useEffect(() => {
    const shown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!shown) {
      setHasShown(false);
      onOpen();
    }
  }, [onOpen]);

  const handleClose = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setHasShown(true);
    onClose();
  };

  if (hasShown && !isOpen) return null;

  const steps = [
    {
      number: "1",
      title: "Set Up Classes",
      description: "Create class periods and add your student roster",
    },
    {
      number: "2",
      title: "Design Classroom",
      description: "Configure your room layout with desks and teacher desk",
    },
    {
      number: "3",
      title: "Generate Charts",
      description: "Create optimized seating arrangements for each class",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center" pt={6}>
          Welcome to Map My Seat!
        </ModalHeader>
        <ModalBody>
          <VStack spacing={6} align="stretch">
            <Text textAlign="center" color="gray.600">
              Create optimized seating charts for your classroom in three simple steps:
            </Text>

            <VStack spacing={4} align="stretch">
              {steps.map((step) => (
                <HStack key={step.number} spacing={4} align="start">
                  <Box
                    bg="blue.500"
                    color="white"
                    borderRadius="full"
                    w={8}
                    h={8}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    flexShrink={0}
                  >
                    {step.number}
                  </Box>
                  <Box>
                    <Text fontWeight="semibold">{step.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {step.description}
                    </Text>
                  </Box>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="center" pb={6}>
          <Button colorScheme="blue" size="lg" onClick={handleClose}>
            Get Started
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default WelcomeModal;
```

**Step 2: Verify the file was created**

Run: `ls frontend/src/common/WelcomeModal.jsx`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/common/WelcomeModal.jsx
git commit -m "feat(ui): add WelcomeModal for first-time user onboarding

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Integrate WelcomeModal into Home Page

**Files:**
- Modify: `frontend/src/home/Home.jsx`

**Step 1: Add import for WelcomeModal**

Add at top of file:

```jsx
import WelcomeModal from "../common/WelcomeModal";
```

**Step 2: Add WelcomeModal to logged-in view**

Find the return statement for logged-in users (where it shows "Welcome, {name}") and add the WelcomeModal component inside the fragment or container.

Add `<WelcomeModal />` right after the opening fragment or container for the logged-in view:

```jsx
{currentUser ? (
  <>
    <WelcomeModal />
    <Flex
```

**Step 3: Test manually**

Run: `npm run dev`
- Clear localStorage or use incognito
- Sign up/login as new user
Expected: Welcome modal appears on first visit, doesn't appear on subsequent visits

**Step 4: Commit**

```bash
git add frontend/src/home/Home.jsx
git commit -m "feat(ui): show welcome modal for first-time users

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Setup Progress Component

**Files:**
- Create: `frontend/src/common/SetupProgress.jsx`

**Step 1: Create the SetupProgress component**

```jsx
import {
  Box,
  HStack,
  VStack,
  Text,
  Progress,
  Circle,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

function SetupProgress({ hasPeriods, hasStudents, hasClassroom, username }) {
  const steps = [
    {
      label: "Create Period",
      done: hasPeriods,
      link: `/periods/${username}`,
    },
    {
      label: "Add Students",
      done: hasStudents,
      link: hasPeriods ? `/periods/${username}` : null,
    },
    {
      label: "Setup Classroom",
      done: hasClassroom,
      link: `/classrooms/${username}`,
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progressPercent = (completedCount / steps.length) * 100;

  if (completedCount === steps.length) {
    return null;
  }

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      maxW="md"
      w="full"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="semibold" color="gray.700">
            Getting Started
          </Text>
          <Text fontSize="sm" color="gray.500">
            {completedCount} of {steps.length} complete
          </Text>
        </HStack>

        <Progress
          value={progressPercent}
          colorScheme="green"
          borderRadius="full"
          size="sm"
        />

        <VStack spacing={3} align="stretch">
          {steps.map((step) => (
            <HStack key={step.label} spacing={3}>
              <Circle
                size={6}
                bg={step.done ? "green.500" : "gray.200"}
                color="white"
              >
                {step.done && <CheckIcon boxSize={3} />}
              </Circle>
              {step.link && !step.done ? (
                <Text
                  as={RouterLink}
                  to={step.link}
                  color="blue.500"
                  _hover={{ textDecoration: "underline" }}
                  fontSize="sm"
                >
                  {step.label}
                </Text>
              ) : (
                <Text
                  fontSize="sm"
                  color={step.done ? "gray.500" : "gray.600"}
                  textDecoration={step.done ? "line-through" : "none"}
                >
                  {step.label}
                </Text>
              )}
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}

export default SetupProgress;
```

**Step 2: Verify the file was created**

Run: `ls frontend/src/common/SetupProgress.jsx`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/common/SetupProgress.jsx
git commit -m "feat(ui): add SetupProgress component for onboarding checklist

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Integrate SetupProgress into Home Page

**Files:**
- Modify: `frontend/src/home/Home.jsx`

**Step 1: Add imports**

Add at top of file:

```jsx
import SetupProgress from "../common/SetupProgress";
import { useState, useEffect } from "react";
import SeatingApi from "../api";
```

**Step 2: Add state and data fetching**

Add inside the Home component, after getting currentUser from context:

```jsx
const [setupStatus, setSetupStatus] = useState({
  hasPeriods: false,
  hasStudents: false,
  hasClassroom: false,
  loading: true,
});

useEffect(() => {
  async function fetchSetupStatus() {
    if (!currentUser) return;

    try {
      const [periods, classroom] = await Promise.all([
        SeatingApi.getPeriods(currentUser.username),
        SeatingApi.getClassroom(currentUser.username).catch(() => null),
      ]);

      const hasPeriods = periods && periods.length > 0;
      const hasStudents = periods && periods.some(p => p.students && p.students.length > 0);
      const hasClassroom = classroom && classroom.seatingConfig;

      setSetupStatus({
        hasPeriods,
        hasStudents,
        hasClassroom,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch setup status:", err);
      setSetupStatus(prev => ({ ...prev, loading: false }));
    }
  }

  fetchSetupStatus();
}, [currentUser]);
```

**Step 3: Add SetupProgress to the logged-in view**

Add the SetupProgress component in the logged-in view, after the welcome text and before the instructions list. Wrap it in a centered container:

```jsx
{!setupStatus.loading && (
  <Box mt={6} display="flex" justifyContent="center">
    <SetupProgress
      hasPeriods={setupStatus.hasPeriods}
      hasStudents={setupStatus.hasStudents}
      hasClassroom={setupStatus.hasClassroom}
      username={currentUser.username}
    />
  </Box>
)}
```

**Step 4: Test manually**

Run: `npm run dev`
Expected:
- New user sees progress checklist with 0/3 complete
- Completing steps updates the progress
- Progress hides when all steps done

**Step 5: Commit**

```bash
git add frontend/src/home/Home.jsx
git commit -m "feat(ui): add setup progress tracker to home page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create useFormValidation Hook

**Files:**
- Create: `frontend/src/hooks/useFormValidation.js`

**Step 1: Create the validation hook**

```javascript
import { useState, useCallback } from "react";

function useFormValidation(initialValues, validationRules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback(
    (fieldName, fieldValue) => {
      const rules = validationRules[fieldName];
      if (!rules) return "";

      for (const rule of rules) {
        const error = rule(fieldValue, values);
        if (error) return error;
      }
      return "";
    },
    [validationRules, values]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validate(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validate]);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === "checkbox" ? checked : value;

      setValues((prev) => ({ ...prev, [name]: fieldValue }));

      if (touched[name]) {
        const error = validate(name, fieldValue);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validate]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validate(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validate]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setFieldValue,
    setValues,
  };
}

export const validators = {
  required: (message = "This field is required") => (value) =>
    !value || (typeof value === "string" && !value.trim()) ? message : "",

  minLength: (min, message) => (value) =>
    value && value.length < min
      ? message || `Must be at least ${min} characters`
      : "",

  maxLength: (max, message) => (value) =>
    value && value.length > max
      ? message || `Must be no more than ${max} characters`
      : "",

  email: (message = "Invalid email address") => (value) =>
    value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : "",

  pattern: (regex, message = "Invalid format") => (value) =>
    value && !regex.test(value) ? message : "",

  number: (message = "Must be a number") => (value) =>
    value && isNaN(Number(value)) ? message : "",

  min: (min, message) => (value) =>
    value && Number(value) < min
      ? message || `Must be at least ${min}`
      : "",

  max: (max, message) => (value) =>
    value && Number(value) > max
      ? message || `Must be no more than ${max}`
      : "",
};

export default useFormValidation;
```

**Step 2: Verify the file was created**

Run: `ls frontend/src/hooks/useFormValidation.js`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/hooks/useFormValidation.js
git commit -m "feat(ui): add useFormValidation hook with common validators

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Update LoginForm with Inline Validation

**Files:**
- Modify: `frontend/src/auth/LoginForm.jsx`

**Step 1: Read current file to understand structure**

Read the file first to see exact structure.

**Step 2: Add imports**

Add to imports:

```jsx
import useFormValidation, { validators } from "../hooks/useFormValidation";
import { FormControl, FormLabel, FormErrorMessage } from "@chakra-ui/react";
```

**Step 3: Replace form state with useFormValidation**

Replace the existing formData state and handleChange with:

```jsx
const validationRules = {
  username: [validators.required("Username is required")],
  password: [validators.required("Password is required")],
};

const {
  values: formData,
  errors,
  handleChange,
  handleBlur,
  validateAll,
} = useFormValidation({ username: "", password: "" }, validationRules);
```

**Step 4: Update handleSubmit**

Add validation check at start of handleSubmit:

```jsx
if (!validateAll()) {
  return;
}
```

**Step 5: Update form inputs with error display**

Wrap each input with FormControl and add FormErrorMessage:

```jsx
<FormControl isInvalid={!!errors.username}>
  <FormLabel htmlFor="username">Username</FormLabel>
  <Input
    id="username"
    name="username"
    value={formData.username}
    onChange={handleChange}
    onBlur={handleBlur}
  />
  <FormErrorMessage>{errors.username}</FormErrorMessage>
</FormControl>
```

**Step 6: Test manually**

Run: `npm run dev`
Expected: Leaving fields empty shows validation errors

**Step 7: Commit**

```bash
git add frontend/src/auth/LoginForm.jsx
git commit -m "feat(ui): add inline validation to login form

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Update SignupForm with Inline Validation

**Files:**
- Modify: `frontend/src/auth/SignupForm.jsx`

**Step 1: Read current file to understand structure**

Read the file first.

**Step 2: Add imports**

```jsx
import useFormValidation, { validators } from "../hooks/useFormValidation";
import { FormControl, FormErrorMessage } from "@chakra-ui/react";
```

**Step 3: Replace form state with useFormValidation**

```jsx
const validationRules = {
  username: [
    validators.required("Username is required"),
    validators.minLength(3, "Username must be at least 3 characters"),
    validators.pattern(/^[^.]+$/, "Username cannot contain periods"),
  ],
  password: [
    validators.required("Password is required"),
    validators.minLength(5, "Password must be at least 5 characters"),
  ],
  email: [
    validators.required("Email is required"),
    validators.email("Please enter a valid email"),
  ],
  firstName: [validators.required("First name is required")],
  lastName: [validators.required("Last name is required")],
};

const {
  values: formData,
  errors,
  handleChange,
  handleBlur,
  validateAll,
} = useFormValidation(
  {
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    title: "Mr.",
  },
  validationRules
);
```

**Step 4: Update handleSubmit**

Add validation check:

```jsx
if (!validateAll()) {
  return;
}
```

**Step 5: Wrap inputs with FormControl**

For each input field, wrap with FormControl and add onBlur and FormErrorMessage.

**Step 6: Test manually**

Run: `npm run dev`
Expected: Signup form shows inline validation errors

**Step 7: Commit**

```bash
git add frontend/src/auth/SignupForm.jsx
git commit -m "feat(ui): add inline validation to signup form

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Add Loading States to Auth Forms

**Files:**
- Modify: `frontend/src/auth/LoginForm.jsx`
- Modify: `frontend/src/auth/SignupForm.jsx`

**Step 1: Update LoginForm**

Add state:
```jsx
const [isSubmitting, setIsSubmitting] = useState(false);
```

Update handleSubmit:
```jsx
async function handleSubmit(evt) {
  evt.preventDefault();
  if (!validateAll()) return;

  setIsSubmitting(true);
  try {
    let result = await login(formData);
    if (result.success) {
      navigate("/");
    } else {
      setFormErrors(result.errors);
    }
  } finally {
    setIsSubmitting(false);
  }
}
```

Update Button:
```jsx
<Button
  type="submit"
  colorScheme="blue"
  w="full"
  isLoading={isSubmitting}
  loadingText="Logging in..."
>
  Log In
</Button>
```

**Step 2: Update SignupForm similarly**

Add isSubmitting state, wrap handleSubmit with try/finally, update Button with isLoading.

**Step 3: Test manually**

Run: `npm run dev`
Expected: Buttons show loading state during submission

**Step 4: Commit**

```bash
git add frontend/src/auth/LoginForm.jsx frontend/src/auth/SignupForm.jsx
git commit -m "feat(ui): add loading states to auth form buttons

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Create Mobile Navigation Component

**Files:**
- Create: `frontend/src/navigation/MobileNav.jsx`

**Step 1: Create the MobileNav component**

```jsx
import {
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Button,
  useDisclosure,
  Box,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";

function MobileNav({ currentUser, logout }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const NavLink = ({ to, children }) => (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      w="full"
      justifyContent="flex-start"
      onClick={onClose}
    >
      {children}
    </Button>
  );

  return (
    <Box display={{ base: "block", md: "none" }}>
      <IconButton
        aria-label="Open menu"
        icon={<HamburgerIcon />}
        onClick={onOpen}
        variant="ghost"
        color="white"
        _hover={{ bg: "teal.500" }}
      />

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={2} align="stretch" mt={4}>
              <NavLink to="/">Home</NavLink>

              {currentUser ? (
                <>
                  <NavLink to={`/periods/${currentUser.username}`}>
                    Set Up Classes
                  </NavLink>
                  <NavLink to={`/classrooms/${currentUser.username}`}>
                    Create Classroom
                  </NavLink>
                  <NavLink to={`/profile/${currentUser.username}`}>
                    Profile
                  </NavLink>
                  <Button
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={handleLogout}
                    color="red.500"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Log In</NavLink>
                  <NavLink to="/signup">Sign Up</NavLink>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default MobileNav;
```

**Step 2: Verify the file was created**

Run: `ls frontend/src/navigation/MobileNav.jsx`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/navigation/MobileNav.jsx
git commit -m "feat(ui): add mobile navigation drawer component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Update Navigation with Mobile Support

**Files:**
- Modify: `frontend/src/navigation/Navigation.jsx`

**Step 1: Read current file**

Read Navigation.jsx to understand current structure.

**Step 2: Add imports**

```jsx
import { Box, Flex } from "@chakra-ui/react";
import MobileNav from "./MobileNav";
```

**Step 3: Wrap desktop nav in responsive container**

Wrap the existing navigation content in a Box that hides on mobile:

```jsx
<Box display={{ base: "none", md: "flex" }}>
  {/* existing nav links */}
</Box>
```

**Step 4: Add MobileNav component**

Add MobileNav alongside the desktop nav, inside a Flex container for proper spacing:

```jsx
<Flex justify="space-between" align="center" w="full">
  <Box display={{ base: "none", md: "flex" }}>
    {/* desktop links */}
  </Box>
  <MobileNav currentUser={currentUser} logout={logout} />
</Flex>
```

**Step 5: Test manually**

Run: `npm run dev`
- Resize browser to mobile width
Expected: Hamburger menu appears, opens drawer with nav links

**Step 6: Commit**

```bash
git add frontend/src/navigation/Navigation.jsx
git commit -m "feat(ui): add responsive navigation with mobile drawer

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Create useAutosave Hook

**Files:**
- Create: `frontend/src/hooks/useAutosave.js`

**Step 1: Create the autosave hook**

```javascript
import { useEffect, useRef, useCallback } from "react";

function useAutosave(value, onSave, delay = 1000, enabled = true) {
  const timeoutRef = useRef(null);
  const previousValueRef = useRef(value);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (JSON.stringify(value) === JSON.stringify(previousValueRef.current)) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (isMountedRef.current) {
        previousValueRef.current = value;
        await onSave(value);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, delay, enabled]);

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    previousValueRef.current = value;
    await onSave(value);
  }, [value, onSave]);

  return { saveNow };
}

export default useAutosave;
```

**Step 2: Verify the file was created**

Run: `ls frontend/src/hooks/useAutosave.js`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/hooks/useAutosave.js
git commit -m "feat(ui): add useAutosave hook for debounced auto-saving

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Add Autosave to Classroom Designer

**Files:**
- Modify: `frontend/src/classroom/ClassroomForm.jsx`

**Step 1: Read current file**

Read ClassroomForm.jsx to understand structure.

**Step 2: Add imports**

```jsx
import { useCallback } from "react";
import useAutosave from "../hooks/useAutosave";
import { useAppToast } from "../common/ToastContext";
```

**Step 3: Add autosave logic**

Inside the component:

```jsx
const toast = useAppToast();

const handleAutosave = useCallback(async (config) => {
  if (!classroom?.classroomId) return;

  try {
    await SeatingApi.updateClassroom(username, classroom.classroomId, {
      seatingConfig: JSON.stringify(config),
    });
    toast.info("Layout auto-saved");
  } catch (err) {
    console.error("Autosave failed:", err);
  }
}, [classroom?.classroomId, username, toast]);

useAutosave(
  seatingConfig,
  handleAutosave,
  2000,
  !!classroom?.classroomId
);
```

**Step 4: Test manually**

Run: `npm run dev`
Expected: Changing classroom layout triggers autosave after 2 seconds

**Step 5: Commit**

```bash
git add frontend/src/classroom/ClassroomForm.jsx
git commit -m "feat(ui): add autosave for classroom layout changes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Create useKeyboardShortcuts Hook

**Files:**
- Create: `frontend/src/hooks/useKeyboardShortcuts.js`

**Step 1: Create the keyboard shortcuts hook**

```javascript
import { useEffect, useCallback } from "react";

function useKeyboardShortcuts(shortcuts, deps = []) {
  const handleKeyDown = useCallback(
    (event) => {
      if (
        event.target.tagName === "INPUT" ||
        event.target.tagName === "TEXTAREA" ||
        event.target.isContentEditable
      ) {
        if (event.key !== "Escape") {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const { key, ctrl, shift, alt, handler } = shortcut;

        const keyMatches = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatches = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shift ? event.shiftKey : !event.shiftKey;
        const altMatches = alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          handler(event);
          return;
        }
      }
    },
    [shortcuts, ...deps]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
```

**Step 2: Verify the file was created**

Run: `ls frontend/src/hooks/useKeyboardShortcuts.js`
Expected: File exists

**Step 3: Commit**

```bash
git add frontend/src/hooks/useKeyboardShortcuts.js
git commit -m "feat(ui): add useKeyboardShortcuts hook

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Add Escape to Cancel in StudentForm

**Files:**
- Modify: `frontend/src/students/StudentForm.jsx`

**Step 1: Add import**

```jsx
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
```

**Step 2: Add keyboard shortcuts**

Add inside the component, create a reset function and bind Escape:

```jsx
const resetForm = useCallback(() => {
  setSelectedStudent(null);
  setFormData({
    name: "",
    grade: "",
    gender: "",
    isESE: false,
    has504: false,
    isELL: false,
    isEBD: false,
  });
}, []);

useKeyboardShortcuts([
  {
    key: "Escape",
    handler: resetForm,
  },
], [resetForm]);
```

**Step 3: Test manually**

Run: `npm run dev`
Expected: Pressing Escape clears the form and selection

**Step 4: Commit**

```bash
git add frontend/src/students/StudentForm.jsx
git commit -m "feat(ui): add Escape key to cancel editing in student form

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 18: Improve LoadingSpinner Component

**Files:**
- Modify: `frontend/src/common/LoadingSpinner.jsx`

**Step 1: Read current file**

Read LoadingSpinner.jsx to see current implementation.

**Step 2: Replace with Chakra UI spinner**

```jsx
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Center h="200px">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text color="gray.500">{message}</Text>
      </VStack>
    </Center>
  );
}

export default LoadingSpinner;
```

**Step 3: Test manually**

Run: `npm run dev`
Expected: Loading states show improved spinner

**Step 4: Commit**

```bash
git add frontend/src/common/LoadingSpinner.jsx
git commit -m "feat(ui): improve LoadingSpinner with Chakra UI spinner

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 19: Add Desk Count Display to Classroom Designer

**Files:**
- Modify: `frontend/src/classroom/Classroom.jsx`

**Step 1: Read current file**

Read Classroom.jsx to understand structure.

**Step 2: Add imports**

```jsx
import { HStack, Text } from "@chakra-ui/react";
```

**Step 3: Add desk count calculation**

Inside the component, add:

```jsx
const deskCount = seatingConfig.flat().filter(cell => cell === "desk").length;
const teacherDeskCount = seatingConfig.flat().filter(cell => cell === "teacher-desk").length;
```

**Step 4: Add desk count display**

Add after the desk selection buttons, before the table:

```jsx
<HStack spacing={4} mb={4} fontSize="sm" color="gray.600">
  <Text>
    Student Desks: <strong>{deskCount}</strong>
  </Text>
  <Text>
    Teacher Desk: <strong>{teacherDeskCount}</strong>
  </Text>
</HStack>
```

**Step 5: Test manually**

Run: `npm run dev`
Expected: Desk counts display above the classroom grid

**Step 6: Commit**

```bash
git add frontend/src/classroom/Classroom.jsx
git commit -m "feat(ui): add desk count display to classroom designer

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 20: Add Print Styles for Seating Chart

**Files:**
- Create: `frontend/src/seating/SeatingChart.css`
- Modify: `frontend/src/seating/SeatingChart.jsx`

**Step 1: Create print stylesheet**

```css
@media print {
  nav,
  button,
  .no-print {
    display: none !important;
  }

  body {
    margin: 0;
    padding: 0;
  }

  .seating-chart-container {
    width: 100%;
    max-width: none;
    page-break-inside: avoid;
  }

  .seating-chart-container table {
    border-collapse: collapse;
  }

  .seating-chart-container td {
    border: 1px solid #333 !important;
    background: white !important;
    color: black !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .seating-chart-container td.desk {
    background: #e0e0e0 !important;
  }

  .seating-chart-container td.teacher-desk {
    background: #bdbdbd !important;
  }
}
```

**Step 2: Read SeatingChart.jsx**

Read the file to understand current structure.

**Step 3: Import CSS in SeatingChart.jsx**

Add at top:
```jsx
import "./SeatingChart.css";
```

**Step 4: Add print button**

Add next to Export PDF button:
```jsx
<Button
  onClick={() => window.print()}
  colorScheme="gray"
  className="no-print"
>
  Print
</Button>
```

**Step 5: Wrap chart in container**

Wrap the chart table in a div with class:
```jsx
<div className="seating-chart-container">
  {/* existing table */}
</div>
```

**Step 6: Test manually**

Run: `npm run dev`
Expected: Print button works, print preview shows clean chart

**Step 7: Commit**

```bash
git add frontend/src/seating/SeatingChart.css frontend/src/seating/SeatingChart.jsx
git commit -m "feat(ui): add print-optimized styles for seating chart

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 21: Add Visual Indicators for Student Accommodations

**Files:**
- Modify: `frontend/src/seating/SeatingChart.jsx`

**Step 1: Add imports**

```jsx
import { HStack, Box } from "@chakra-ui/react";
```

**Step 2: Create AccommodationIndicators component**

Add inside the file, before the main component:

```jsx
function AccommodationIndicators({ student }) {
  const indicators = [];

  if (student.isESE) indicators.push({ label: "ESE", color: "purple.400" });
  if (student.has504) indicators.push({ label: "504", color: "blue.400" });
  if (student.isELL) indicators.push({ label: "ELL", color: "green.400" });
  if (student.isEBD) indicators.push({ label: "EBD", color: "orange.400" });

  if (indicators.length === 0) return null;

  return (
    <HStack spacing={0.5} mt={0.5} justify="center" flexWrap="wrap">
      {indicators.map(({ label, color }) => (
        <Box
          key={label}
          bg={color}
          color="white"
          fontSize="6px"
          px={0.5}
          borderRadius="sm"
          lineHeight="1.2"
        >
          {label}
        </Box>
      ))}
    </HStack>
  );
}
```

**Step 3: Use AccommodationIndicators in desk cells**

In the cell rendering where student names are displayed, add after the name:

```jsx
<AccommodationIndicators student={studentInDesk} />
```

**Step 4: Test manually**

Run: `npm run dev`
Expected: Students with accommodations show colored badges

**Step 5: Commit**

```bash
git add frontend/src/seating/SeatingChart.jsx
git commit -m "feat(ui): add visual accommodation indicators to seating chart

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 22: Run Frontend Lint and Fix Issues

**Step 1: Run linter**

Run: `cd frontend && npm run lint`

**Step 2: Fix any lint errors**

Address any issues reported.

**Step 3: Verify lint passes**

Run: `cd frontend && npm run lint`
Expected: No errors

**Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix(lint): fix lint errors in Phase 2 components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 23: Run Tests and Verify No Regressions

**Step 1: Run all tests**

Run: `npm test`

**Step 2: Fix any failing tests**

Address any test failures caused by the changes.

**Step 3: Verify all tests pass**

Run: `npm test`
Expected: All tests pass

**Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix(test): fix tests for Phase 2 changes

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 24: Manual Testing Verification

**Step 1: Start the application**

Run: `npm run dev`

**Step 2: Test all new features**

Verify the following:

1. **Empty States**
   - [ ] New user with no periods sees empty state
   - [ ] Period with no students shows empty state

2. **Onboarding**
   - [ ] First-time user sees welcome modal
   - [ ] Welcome modal doesn't reappear
   - [ ] Setup progress shows on home page
   - [ ] Progress updates as steps complete

3. **Form UX**
   - [ ] Login form shows inline validation
   - [ ] Signup form shows inline validation
   - [ ] Submit buttons show loading state
   - [ ] Escape key cancels student editing

4. **Mobile Navigation**
   - [ ] Desktop shows full nav
   - [ ] Mobile shows hamburger menu
   - [ ] Drawer opens and closes

5. **Classroom Designer**
   - [ ] Desk count displays
   - [ ] Autosave works

6. **Seating Chart**
   - [ ] Print button works
   - [ ] Accommodation indicators show

**Step 3: Document any issues**

Note any bugs for follow-up.

---

## Summary

After completing all tasks, Phase 2 will include:

1. **Onboarding Flow**
   - Welcome modal for first-time users
   - Setup progress indicator
   - Empty state components with CTAs

2. **Form UX Improvements**
   - useFormValidation hook with validators
   - Inline validation on auth forms
   - Loading states on submit buttons
   - Keyboard shortcuts (Escape to cancel)
   - Autosave for classroom layout

3. **Responsive Design**
   - Mobile navigation drawer
   - Responsive nav adapts to screen size

4. **Seating Chart Improvements**
   - Print-optimized CSS
   - Visual accommodation indicators

5. **Classroom Designer Improvements**
   - Desk count display

Run all tasks sequentially. Test frequently throughout implementation.
