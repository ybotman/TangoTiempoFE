// Edge case test scenarios for TIEMPO-187
// Tests various RA configurations and data formats

const testScenarios = [
  {
    name: "RA with no cities assigned",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: []
        }
      }
    },
    event: {
      masteredCityId: { _id: "city123", cityName: "Boston" }
    },
    expected: "Should deny access - no cities assigned"
  },
  
  {
    name: "RA with null allowedCities",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: null
        }
      }
    },
    event: {
      masteredCityId: { _id: "city123", cityName: "Boston" }
    },
    expected: "Should deny access - null cities array"
  },
  
  {
    name: "RA with string format cities",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: ["city123", "city456"]
        }
      }
    },
    event: {
      masteredCityId: { _id: "city123", cityName: "Boston" }
    },
    expected: "Should allow access - city123 is in allowed list"
  },
  
  {
    name: "RA with object format cities",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: [
            { _id: "city123", cityName: "Boston" },
            { _id: "city456", cityName: "New York" }
          ]
        }
      }
    },
    event: {
      masteredCityId: { _id: "city123", cityName: "Boston" }
    },
    expected: "Should allow access - city object matches"
  },
  
  {
    name: "RA with mixed format cities (edge case)",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: [
            "city123",
            { _id: "city456", cityName: "New York" }
          ]
        }
      }
    },
    event: {
      masteredCityId: { _id: "city123", cityName: "Boston" }
    },
    expected: "Should allow access - handles mixed formats"
  },
  
  {
    name: "Event with null masteredCityId",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: ["city123", "city456"]
        }
      }
    },
    event: {
      masteredCityId: null
    },
    expected: "Should deny access - no city ID on event"
  },
  
  {
    name: "Event with string masteredCityId",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: ["city123", "city456"]
        }
      }
    },
    event: {
      masteredCityId: "city123" // String instead of object
    },
    expected: "Should allow access - handles string city ID"
  },
  
  {
    name: "RA with undefined in cities array",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: ["city123", undefined, "city456"]
        }
      }
    },
    event: {
      masteredCityId: { _id: "city123", cityName: "Boston" }
    },
    expected: "Should allow access - ignores undefined entries"
  },
  
  {
    name: "Single-city RA (potential issue case)",
    user: {
      backendInfo: {
        localAdminInfo: {
          allowedAdminMasteredCityIds: ["city123"] // Only one city
        }
      }
    },
    event: {
      masteredCityId: { _id: "city123", cityName: "Boston" },
      // But venueMasteredCityID might be null after transform
      venueMasteredCityID: null
    },
    expected: "Should check original masteredCityId if venueMasteredCityID is null"
  }
];

// Test function that simulates the validation logic
function testRAValidation(scenario) {
  console.log(`\\n=== Testing: ${scenario.name} ===`);
  
  const user = scenario.user;
  const event = scenario.event;
  
  // Get allowed cities
  const raAllowedCities = user?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || [];
  
  // Extract city ID (mimicking the modal logic)
  const eventCityId = event.masteredCityId?._id || 
                     event.masteredCityId || 
                     event.venueMasteredCityID ||
                     event.venueMasteredCityId;
  
  // Check access (using the fixed logic)
  const hasAccess = eventCityId && raAllowedCities.some(city => {
    if (typeof city === 'string') {
      return city === eventCityId;
    } else if (city && typeof city === 'object') {
      return city._id === eventCityId || city.id === eventCityId;
    }
    return false;
  });
  
  console.log('Allowed Cities:', raAllowedCities);
  console.log('Event City ID:', eventCityId);
  console.log('Has Access:', hasAccess);
  console.log('Expected:', scenario.expected);
  console.log('PASS:', hasAccess === scenario.expected.includes('allow'));
}

// Run all tests
console.log('TIEMPO-187 Edge Case Tests');
console.log('==========================');
testScenarios.forEach(testRAValidation);

// Export for use in browser console
window.TIEMPO187Tests = {
  scenarios: testScenarios,
  test: testRAValidation,
  runAll: () => testScenarios.forEach(testRAValidation)
};