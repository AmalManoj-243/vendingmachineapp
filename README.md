# 369AI Project Documentation

This project is a comprehensive Expo React Native application for mobile platforms that integrates various features such as CRM, inventory, and API handling. This documentation provides an overview of the project structure, key components, and API integrations.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Directory Overview](#directory-overview)
3. [Components](#components)
4. [API Integration](#api-integration)
5. [Assets](#assets)
6. [Scripts and Configurations](#scripts-and-configurations)
7. [Usage](#usage)
8. [Running the Application](#running-the-application)

---

## Project Structure

The following is the structure of the project that provides an organized overview of directories and files:

```
project structure 

```

### 1. **App.js**:
   The entry point of the React Native app.

### 2. **app.json**:
   Configuration file for the Expo application.

### 3. **assets**:
   This directory contains the application's static assets like icons, images, fonts, and animations.
   - **android/**: Icons for Android devices.
   - **animations/**: Lottie JSON files for app animations.
   - **fonts/**: Urbanist font family used for text rendering.
   - **icons/**: Various categories for bottom tabs, modals, etc.
   - **images/**: General app imagery like empty states, headers, banners, logos, etc.

### 4. **src**:
   This is the main source directory that contains all the logic and components.
   
   - **api/**:
     Handles API configuration and requests.
     - `config/`: API configuration files.
     - `details/`: API related to fetching detailed information.
     - `dropdowns/`: API for dropdown-related data.
     - `endpoints/`: Centralized endpoints.
     - `services/`: General API services used across the app.
     - `uploads/`: API for handling file uploads.
     - `utils/`: Utility functions like error handling.

   - **components/**:
     This folder contains all the reusable components for the application.
     - **Calendar/**: Calendar-related components like `CalendarScreen` and `VerticalScrollableCalendar`.
     - **Categories/**: Components related to categories, like `CategoryList`.
     - **Common/**: Contains common reusable components for the application.
        - **`BottomSheets/`**: Dropdown Components Single selection `DropdwonSheet` & Multiple selection `MultiSelectDropdownSheet` and styles for various bottom sheets used for displaying like additional information or options.
        - **`Button/`**: Components related to button likes `FABButton` , `LoadingButton` ,  `PressableInput` including different styles and also loading variations used across the application.
        - **`CheckBox/`**: Components for checkbox elements, including custom checkboxes and related functionality.
        - **`Detail/`**: Components for displaying detailed information, such as `DetailField` , `DetailCheckBox`, `ProductDetail` .
        - **`TextInput/`**: Components for text input fields, including variations like password fields and search inputs.
        - **`empty/`**: Components for empty listing & fill the empty space.

 - **CRM/**: Components handling CRM functionalities like `FollowUpList`, `Meetingslist`, and `VisitList`.
 - **Header/**: Components for headers including `NavigationHeader` and `BottomSheetHeader`.
- **Loader/**: Loading animations and overlays like `AnimatedLoader` and `OverlayLoader`.
- **Modal/**: Various modals like `ActionModal`,  `AddUpdateModal`, `ConfirmationModal`, `CustomListModal`, `LogoutModal` and more.
- **Options/**: Components for handling different options or list items.
- **Product/**: Components for displaying product-related data.
- **Scanner/**: Barcode and other scanner-related components.
- **containers/**: Containers for managing layouts like `RoundedScrollContainer`, `SafeAreaView`, and more.

---

## Directory Overview

### **assets/**
Includes images, icons, fonts, and animations used throughout the app.

### **src/api**
Here, we define all the API-related files that handle network requests. This includes configurations for handling responses, API endpoints, and services.

### **src/components/**
This is where all the building blocks of the UI live. It contains several subfolders that house reusable components.


---

## Components

Each component in this project is reusable and designed for flexibility this can be easily integrated into any React Native project. Below is a detailed breakdown of each component, including prop descriptions and default values. 

1. [CalendarScreen](#calendarscreen)
2. [VerticalScrollableCalendar](#verticalscrollablecalendar)
3. [DropdownSheet](#dropdownsheet)
4. [MultiSelectDropdownSheet](#multiselectdropdownsheet)
5. [Button](#button)
6. [FABButton](#fabbutton)
7. [LoadingButton](#loadingbutton)
8. [PressableInput](#pressableinput)
9. [CheckBox](#checkbox)
10. [SafeAreaView](#safeareaview)
11. [SearchContainer](#searchcontainer)
12. [RoundedContainer](#roundedcontainer)
13. [RoundedScrollContainer](#roundedscrollcontainer)
14. [BottomSheetHeader](#bottomsheetheader)
15. [NavigationHeader](#navigationheader)
16. [AnimatedLoader](#animatedloader)
17. [OverlayLoader](#overlayloader)
18. [CustomTabBar](#customtabbar)
19. [DetailField](#detailfield)
20. [TextInput](#textinput)

---

## 1. CalendarScreen

A scrollable calendar interface.

### Usage
Import the CalendarScreen component in your React Native file:
```jsx
import { CalendarScreen } from '@components/Calendar';
```
Use the CalendarScreen component in your JSX code:
```jsx
<CalendarScreen 
  markedDates={{ '2024-09-05': { marked: true } }} 
  onDayPress={(day) => console.log(day)}
  theme={{ selectedDayBackgroundColor: 'blue' }} 
/>
```

### Props

| Prop           | Type     | Description                                      | Default Value |
| -------------- | -------- | ------------------------------------------------ | ------------- |
| `markedDates`  | Object   | Object containing marked dates                   | `{}`          |
| `onDayPress`   | Function | Function called when a date is pressed            | `() => {}`    |
| `theme`        | Object   | Custom theme for calendar appearance             | `{}`          |
| `style`        | Object   | Additional styles for the calendar component      | `{}`          |

---

## 2. VerticalScrollableCalendar

A vertical scrollable calendar interface.

### Usage

Import the VerticalScrollableCalendar component in your React Native file:

```jsx
import { VerticalScrollableCalendar } from '@components/Calendar';
```
Use the VerticalScrollableCalendar component in your JSX code:
```jsx
<VerticalScrollableCalendar 
  date={new Date()} 
  onChange={(day) => console.log(day)} 
/>
```

### Props

| Prop         | Type     | Description                                    | Default Value |
| ------------ | -------- | ---------------------------------------------- | ------------- |
| `date`       | Date     | The current selected date                      | `new Date()`  |
| `onChange`   | Function | Function called when the user selects a new day | `() => {}`    |

---

## 3. DropdownSheet

A bottom sheet dropdown for selecting options.

### Usage
```jsx
import DropdownSheet from '@components/DropdownSheet';

<DropdownSheet 
  isVisible={true} 
  items={[{ label: 'Option 1' }, { label: 'Option 2' }]} 
  onValueChange={(item) => console.log(item)} 
  title="Select Option" 
  onClose={() => console.log('Sheet closed')} 
/>
```

### Props

| Prop            | Type      | Description                                             | Default Value   |
| --------------- | --------- | ------------------------------------------------------- | --------------- |
| `isVisible`     | Boolean   | Controls the visibility of the bottom sheet             | `false`         |
| `items`         | Array     | Array of items to display in the dropdown               | `[]`            |
| `onValueChange` | Function  | Function called when an item is selected                | `() => {}`      |
| `title`         | String    | Title to display at the top of the dropdown             | `''`            |
| `onClose`       | Function  | Function called when the sheet is closed                | `() => {}`      |

---

## 4. MultiSelectDropdownSheet

A bottom sheet dropdown for selecting multiple options.

### Usage
```jsx
import MultiSelectDropdownSheet from '@components/MultiSelectDropdownSheet';

<MultiSelectDropdownSheet 
  isVisible={true} 
  items={[{ label: 'Option 1' }, { label: 'Option 2' }]} 
  onValueChange={(selectedItems) => console.log(selectedItems)} 
  title="Select Multiple" 
  previousSelections={['Option 1']} 
  onClose={() => console.log('Sheet closed')} 
/>
```

### Props

| Prop                | Type      | Description                                                   | Default Value   |
| ------------------- | --------- | ------------------------------------------------------------- | --------------- |
| `isVisible`         | Boolean   | Controls the visibility of the bottom sheet                   | `false`         |
| `items`             | Array     | Array of items to display in the dropdown                     | `[]`            |
| `onValueChange`     | Function  | Function called when items are selected                       | `() => {}`      |
| `title`             | String    | Title to display at the top of the dropdown                   | `''`            |
| `previousSelections`| Array     | List of items selected previously                             | `[]`            |
| `onClose`           | Function  | Function called when the sheet is closed                      | `() => {}`      |

---

## 5. Button

A reusable button component.

### Usage
```jsx
import Button from '@components/common/Button';

<Button 
  title="Click me" 
  onPress={() => console.log('Button clicked')} 
  disabled={false} 
/>
```

### Props

| Prop       | Type      | Description                       | Default Value |
| ---------- | --------- | --------------------------------- | ------------- |
| `title`    | String    | Button text                       | `''`          |
| `onPress`  | Function  | Function to call on button press   | `() => {}`    |
| `disabled` | Boolean   | Whether the button is disabled     | `false`       |

---

## 6. FABButton

A floating action button component.

### Usage
```jsx
import FABButton from '@components/common/FABButton';

<FABButton 
  onPress={() => console.log('FAB clicked')} 
  icon="plus" 
/>
```

### Props

| Prop       | Type      | Description                        | Default Value |
| ---------- | --------- | ---------------------------------- | ------------- |
| `onPress`  | Function  | Function to call on button press    | `() => {}`    |
| `icon`     | String    | Icon to display inside the FAB      | `''`          |

---

## 7. LoadingButton

A button that shows a loading indicator when pressed.

### Usage
```jsx
import LoadingButton from '@components/common/LoadingButton';

<LoadingButton 
  title="Submit" 
  loading={true} 
  onPress={() => console.log('Loading button clicked')} 
/>
```

### Props

| Prop       | Type      | Description                         | Default Value |
| ---------- | --------- | ----------------------------------- | ------------- |
| `title`    | String    | Button text                         | `''`          |
| `loading`  | Boolean   | Whether to show the loading spinner | `false`       |
| `onPress`  | Function  | Function to call on button press     | `() => {}`    |

---

## Other Components

Please refer to the respective code files for usage examples and prop details for the following components:

- `PressableInput`
- `CheckBox`
- `SafeAreaView`
- `SearchContainer`
- `RoundedContainer`
- `RoundedScrollContainer`
- `BottomSheetHeader`
- `NavigationHeader`
- `AnimatedLoader`
- `OverlayLoader`
- `CustomTabBar`
- `DetailField`
- `TextInput`

---

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yourproject.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the app:
```bash
npm start
```

---

## License

This project is licensed under the MIT License.

---

This `README.md` provides clear, professional, and reusable component documentation along with prop descriptions and default values. Each component has a dedicated section explaining its usage and customization options. You can further expand the details for each component as needed.

---

## API Integration

The project integrates APIs via the `src/api` folder, where different services are modularized to handle various operations:
- **detailApi.js**: Manages fetching detailed data from the server.
- **dropdownApi.js**: Fetches dropdown options dynamically.
- **generalApi.js**: Contains general service APIs for interacting with external data.

---

## Assets

The assets folder contains all static resources:
- **Animations**: JSON files for animated elements.
- **Fonts**: Font files, mainly the Urbanist font family.
- **Icons**: Various icons for bottom tabs, modals, and common elements.
- **Images**: Images categorized into sections like `EmptyData`, `Home`, `Profile`, etc.

---

## Scripts and Configurations

### 1. **babel.config.js**:
   Babel configuration file for compiling the app.

### 2. **package.json**:
   Contains all the dependencies and scripts needed to run the app.

### 3. **eas.json**:
   Configuration for Expo Application Services (EAS).

---

## Usage

### Importing Components
Each component can be imported from the `src/components` folder and reused across the application:

```js
import CalendarScreen from './components/Calendar/CalendarScreen';
import DropdownSheet from './components/common/BottomSheets/DropdownSheet';
```

### API Integration Example
To make an API call from a component, import the necessary function from `src/api`:

```js
import { getDetailData } from '../api/details/detailApi';
```

---

## Running the Application

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/369ai.git
   cd 369ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo server:
   ```bash
   npx expo start
   ```

---

This is an overview of the structure and workflow for your React Native project. For more detailed explanations of specific components, check their individual documentation or component files.

---

This README will provide clarity on your project's architecture and serve as a professional guide for onboarding new developers. Let me know if you'd like to expand on any specific sections or add more detailed descriptions for components!
]([url]([url]([url]([url](url)))))
