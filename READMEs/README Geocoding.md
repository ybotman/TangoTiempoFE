    1.	Address Entry and Geocoding:
    •	Organizers will occasionally enter new addresses for event locations.
    •	The application needs to convert these addresses into geocodes (latitude and longitude) to ensure precise location data.
    2.	Proximity Check for Duplicates:
    •	The system should check if a location within a configurable radius (e.g., 0.1 miles) already exists to prevent duplicate entries.
    •	Duplicate resolution may involve user intervention to confirm or merge similar locations.
    3.	Closest City Association:
    •	After geocoding, the application should automatically determine the nearest major city and associate the event location with this city in the database.
    4.	Map Visualization:
    •	Users should be able to view events on a map, allowing them to explore events visually and understand geographic distribution.

Tech/Plugin Recommendations

    1.	OpenCage (Geocoding Service):
    •	Purpose: Convert addresses entered by organizers into latitude and longitude.
    •	Advantages: Simple REST API, generous free tier, and reliable geocoding for global locations.
    •	Integration: Easy to integrate with Next.js using simple API calls.
    2.	Mapbox (Mapping and Visualization):
    •	Purpose: Provide interactive maps for viewing events and finding the nearest city.
    •	Advantages: High-quality maps, extensive documentation, and a free tier suitable for low-volume use.
    •	Integration: Works well with React, allowing for easy embedding of maps and performing geospatial queries.
    3.	MongoDB Geospatial Queries:
    •	Purpose: Perform proximity checks to prevent duplicate locations and find the nearest city.
    •	Advantages: Efficient handling of geospatial data within the same database, reducing complexity.
    •	Integration: Directly integrates with your existing MongoDB database, using geospatial indexing and queries.

General Lifecycle

    1.	Address Entry:
    •	The organizer enters a new address via the add location modal in the app.
    2.	Geocoding (OpenCage):
    •	The entered address is sent to OpenCage’s API, which returns the corresponding latitude and longitude.
    3.	Proximity Check (MongoDB Geospatial Queries):
    •	The geocoded location is checked against existing locations within a specified radius using MongoDB’s geospatial queries to prevent duplicates.
    4.	City Association (Mapbox & MongoDB):
    •	The system identifies the nearest major city from a predefined list and associates this city with the new location.
    5.	Map Visualization (Mapbox):
    •	The event is displayed on an interactive map, allowing users to explore the event locations visually.
    6.	Duplicate Resolution:
    •	If a potential duplicate is found, the system prompts the user to resolve it, either by confirming or merging the location.
