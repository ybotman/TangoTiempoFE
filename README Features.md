
# Tango Tiempo - National Tango Calendar App

## Overview

Tango Tiempo is a comprehensive calendar application designed to help tango dancers and organizers across the nation coordinate and manage tango events. The application provides multiple views (calendar, list, and upcoming map view) for users to browse events and includes advanced filtering options for a personalized experience.

Features

1. National Tango Event Calendar 

	•	Multiple Views: Displays events in monthly, weekly, daily, and list formats. (Mobile in monthly view as minimal month with DateClickable for the Lower half dayList)
	•	Interactive Events: Users can click on events to view detailed information in a modal popup.
	•	Category-Based Color Coding: Events are color-coded based on categories such as Milonga, Practica, Workshop, and more.

2. Region-Specific Filtering  (passed to Calendar Event API)

	•	Dynamic Filtering: The app supports filtering events by region.
	•	Region Selection: Users can select their region from a dropdown, updating the calendar to display only relevant events.
	

3. Category Filters (Filtered post API)

	•	Filtering: Allows users to show or hide events based on categories such as Milonga, Practica, Class, etc.
	•	User Customization: Users can easily toggle between categories to customize their event view.


4. Organizer Filters (Filtered post API)

	•	Advanced Filtering: Allows users to show or hide events based on selected Orgaziners.
	•	User Customization: Users can easily toggle between categories to customize their event view.

5. User Roles and Permissions.

	•	Role-Based Access: Supports multiple user roles including Anonymous, User, Region Organizer, Region Admin, and System Admin. Menu are role Aware
	•	Security and Permissions: Grants different levels of access and functionality based on user roles.
	•	Region-Specific Permissions: Security grants can be applied per region to ensure proper access control.
		•	this is selected in the SiteMenuBar

6. Firebase Authentication 
    •	of use via google