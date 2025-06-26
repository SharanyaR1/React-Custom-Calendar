# 📆 Custom Event Calendar

**🔗 Link to Calendar App** :  https://react-custom-calendar.vercel.app/

## Steps to set-up the project

####  1. Check Node.js Version
```bash
node -v
```

If Node.js is not installed, download the latest version from:

[Click here to install latest Node.js version](https://nodejs.org/en/download)

#### 2. Check Yarn Version
``` bash
yarn --version 
```

If Yarn is not installed, run this command in terminal
``` bash
npm install -g yarn
```

#### 3. Clone the repository
```bash
git clone https://github.com/SharanyaR1/React-Custom-Calendar.git
```

#### 4. Navigate to the folder
``` bash
cd React-Custom-Calendar
```

#### 5. Install dependencies
``` bash
yarn install
```

#### 5. Start the development server
```bash
yarn dev
```

#### 6. Open the app in your browser at :
http://localhost:5173


## **Features**

1. **Monthly View Calendar:**
    - Displays a traditional monthly calendar view.
    - Highlights the current day.
    - Allows users to navigate between months.
2. **Event Management:**
    - **Add Event:**
        - Users can add events by clicking on a specific day.
        - The event form includes the following fields:
            - Event Title
            - Date and Time (with time picker)
            - Description
            - Recurrence options (e.g., Daily, Weekly, Monthly, Custom)
            - Category selection
    - **Edit Event:**
        - Users can click on an event to open the edit form.
        - Allows users to update any of the event details.
    - **Delete Event:**
        - Provides an option to delete events from the event details form.
3. **Recurring Events:**
    - Implements support for recurring events with the following recurrence options:
        - **Daily**: Repeat every day.
        - **Weekly**: Repeat on selected days of the week.
        - **Monthly**: Repeat on a specific day each month (e.g., the 15th).
        - **Custom**: Allow users to set a custom recurrence pattern (e.g., every 2 days).
    - Ensures that recurring events are displayed correctly across all relevant days.
4. **Drag-and-Drop Rescheduling:**
    - Implements a drag-and-drop interface that allows users to reschedule events by dragging them to a different day on the calendar.
    - Handles edge cases such as dragging an event to a day that already has another event
5. **Event Conflict Management:**
    - Implements logic to handle event conflicts (e.g., overlapping events on the same day at the same time).
    - Displays warnings from creating conflicting events.
6. **Event Filtering and Searching:**
    - Allows users to filter events by category or search for events by title.
    - Implement a search bar that dynamically filters events as the user types.
7. **Event Persistence:**
    - Implements data persistence using local storage
    - Ensures that events remain saved even after the user refreshes the page or navigates away and returns later.
8. **Responsive Design:**
    - Ensure the calendar is responsive and works well on different screen sizes, including mobile devices.

