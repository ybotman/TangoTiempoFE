/**
 * TIEMPO-187 Regional Admin Permission Test Automation
 * 
 * This script helps automate testing of RA permissions for event editing.
 * Run this in the browser console while logged in as different test users.
 */

class RAPermissionTester {
  constructor() {
    this.results = [];
    this.currentUser = null;
  }

  async init() {
    // Get current user info from AuthContext
    const authContext = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.values()?.next()?.value?.getFiberRoots()?.values()?.next()?.value?.current;
    
    if (!authContext) {
      console.error('❌ Cannot access React context. Make sure React DevTools is installed.');
      return false;
    }

    // Find AuthContext in the component tree
    let node = authContext;
    while (node) {
      if (node.memoizedProps?.value?.user) {
        this.currentUser = node.memoizedProps.value.user;
        break;
      }
      node = node.child || node.sibling || node.return;
    }

    console.log('✅ Test initialized for user:', this.currentUser?.email);
    console.log('📍 Allowed cities:', this.currentUser?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds);
    return true;
  }

  /**
   * Test 1: Check if edit button visibility is correct
   */
  async testEditButtonVisibility(eventId) {
    console.group(`🧪 Test 1: Edit Button Visibility for Event ${eventId}`);
    
    try {
      // Fetch event details
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/id/${eventId}?appId=${process.env.NEXT_PUBLIC_APPLICATION_ID}`
      );
      const event = await response.json();
      
      console.log('📄 Event details:', {
        title: event.title,
        masteredCityId: event.masteredCityId,
        venueMasteredCityID: event.venueMasteredCityID
      });

      // Check if user should have access
      const userCities = this.currentUser?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds || [];
      const eventCityId = event.masteredCityId?._id || event.masteredCityId || event.venueMasteredCityID;
      const shouldHaveAccess = userCities.includes(eventCityId);

      console.log('✓ Expected access:', shouldHaveAccess);
      console.log('🏙️ User cities:', userCities);
      console.log('🎯 Event city:', eventCityId);

      this.results.push({
        test: 'Edit Button Visibility',
        eventId,
        expected: shouldHaveAccess,
        actual: null, // Will be set when modal opens
        passed: null
      });

      console.groupEnd();
      return { event, shouldHaveAccess };
    } catch (error) {
      console.error('❌ Test failed:', error);
      console.groupEnd();
      return null;
    }
  }

  /**
   * Test 2: Try to directly edit an event
   */
  async testDirectEditAccess(eventId) {
    console.group(`🧪 Test 2: Direct Edit Access for Event ${eventId}`);
    
    try {
      // Attempt to open edit modal directly
      const editModalEvent = new CustomEvent('openEditModal', {
        detail: { eventId, editMode: true }
      });
      
      console.log('🚀 Attempting to open edit modal directly...');
      window.dispatchEvent(editModalEvent);

      // Wait a bit for modal to potentially open
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if error message appeared
      const errorAlert = document.querySelector('.MuiAlert-root.MuiAlert-standardError');
      const hasError = errorAlert?.textContent?.includes('permission');

      console.log('🔍 Error alert found:', hasError);
      if (errorAlert) {
        console.log('📝 Error message:', errorAlert.textContent);
      }

      this.results.push({
        test: 'Direct Edit Access',
        eventId,
        expected: 'Should block if no city access',
        actual: hasError ? 'Blocked' : 'Allowed',
        passed: null // Depends on whether user should have access
      });

      console.groupEnd();
      return !hasError;
    } catch (error) {
      console.error('❌ Test failed:', error);
      console.groupEnd();
      return false;
    }
  }

  /**
   * Test 3: Attempt API call directly
   */
  async testAPIEndpoint(eventId) {
    console.group(`🧪 Test 3: API Endpoint Security for Event ${eventId}`);
    
    try {
      // First get the event to have data to send
      const getResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/id/${eventId}?appId=${process.env.NEXT_PUBLIC_APPLICATION_ID}`
      );
      const event = await getResponse.json();

      // Try to update the event
      const updateData = {
        title: event.title + ' [TEST EDIT]',
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        venueID: event.venueId || event.locationID,
        ownerOrganizerID: event.ownerOrganizerID,
        selectedRole: 'RegionalAdmin',
        allowedAdminMasteredCityIds: this.currentUser?.backendInfo?.localAdminInfo?.allowedAdminMasteredCityIds
      };

      console.log('📤 Attempting to update event via API...');
      
      const token = await this.getAuthToken();
      const updateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BE_URL}/api/events/ra/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        }
      );

      const status = updateResponse.status;
      const result = await updateResponse.json().catch(() => ({ error: 'Failed to parse response' }));

      console.log('📥 API Response:', { status, result });

      this.results.push({
        test: 'API Endpoint Security',
        eventId,
        expected: 'Should return 403 if no city access',
        actual: `Status ${status}: ${result.message || result.error || 'Success'}`,
        passed: null // Depends on whether user should have access
      });

      console.groupEnd();
      return status === 200;
    } catch (error) {
      console.error('❌ Test failed:', error);
      console.groupEnd();
      return false;
    }
  }

  /**
   * Get current auth token
   */
  async getAuthToken() {
    // Try to get token from Firebase
    if (window.firebase?.auth?.()?.currentUser) {
      return await window.firebase.auth().currentUser.getIdToken(true);
    }
    
    // Fallback: look for token in context
    return this.currentUser?.token || localStorage.getItem('authToken');
  }

  /**
   * Run all tests for a specific event
   */
  async runAllTests(eventId) {
    console.log(`\n🏃 Running all tests for event ${eventId}\n`);
    
    await this.testEditButtonVisibility(eventId);
    await this.testDirectEditAccess(eventId);
    await this.testAPIEndpoint(eventId);
    
    this.printResults();
  }

  /**
   * Print test results summary
   */
  printResults() {
    console.group('📊 Test Results Summary');
    console.table(this.results);
    
    const passed = this.results.filter(r => r.passed === true).length;
    const failed = this.results.filter(r => r.passed === false).length;
    const total = this.results.length;
    
    console.log(`\n✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⏸️  Pending: ${total - passed - failed}/${total}`);
    
    console.groupEnd();
  }

  /**
   * Helper to simulate user actions
   */
  async simulateEventClick(eventElement) {
    console.log('🖱️ Simulating click on event...');
    eventElement.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Usage Instructions
console.log(`
🧪 TIEMPO-187 Regional Admin Permission Tester
=============================================

Usage:
1. Initialize the tester:
   const tester = new RAPermissionTester();
   await tester.init();

2. Run tests for a specific event:
   await tester.runAllTests('EVENT_ID_HERE');

3. Run tests for multiple events:
   const eventIds = ['EVENT_1_ID', 'EVENT_2_ID', 'EVENT_3_ID'];
   for (const id of eventIds) {
     await tester.runAllTests(id);
   }

4. View results:
   tester.printResults();

Example Event IDs (replace with actual IDs):
- Boston Event: '6751f57e2e74d97609e7dca0'
- NYC Event: '6751f57e2e74d97609e7dca1'
- Philadelphia Event: '6751f57e2e74d97609e7dca2'
`);

// Export for use
window.RAPermissionTester = RAPermissionTester;