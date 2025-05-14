GeoLocationContext
    - Purpose: A unified location system that handles both the user's actual geographic location AND the selected location for filtering
  content
    - Key State:
        - userLocation: The user's actual physical coordinates (from IP-based geolocation)
      - selectedLocation: The location for filtering content (city, division, region structure)
    - Role:
        - Acts as the high-level context that both stores the user's physical location
      - Manages the selected filtering location (which may be different from where the user is)
      - Gradually replacing RegionsContext with more modern functionality

  The functional differences are:
  1. GeoLocationContext manages what the UI displays and what location is used for filtering content
  2. MasteredLocationContext ensures locations match the canonical database structure
  3. RegionsContext (deprecated) was an older way to manage location selection:
