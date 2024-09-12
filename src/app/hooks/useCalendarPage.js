import { useState, useEffect, useRef } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { filterEvents } from '@/utils/filterEvents';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import useOrganizers from '@/hooks/useOrganizers';
import { useRegions } from '@/hooks/useRegions';
//import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';  // Import the hook
import { useAuth } from '@/hooks/useAuth';

export const useCalendarPage = () => {
    const regions = useRegions();
    const categories = useCategories();
    const [activeCategories, setActiveCategories] = useState([]);
    const [selectedOrganizers, setSelectedOrganizers] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarStart, setCalendarStart] = useState(null);
    const [calendarEnd, setCalendarEnd] = useState(null);
    const calendarRef = useRef(null);
    //const [roleState, setRoleState] = useState({});

    const {
        selectedRole,
        isAnonymous,
        isRegionalOrganizer,
        isRegionalAdmin,
        isSystemOwner,
        isNamedUser
    } = useAuth();

    useEffect(() => {
        console.log('useEffect returning', {
            selectedRole,
            AN: isAnonymous,
            RO: isRegionalOrganizer,
            RA: isRegionalAdmin,
            SO: isSystemOwner,
            NU: isNamedUser
        });
    }, [isAnonymous, isRegionalOrganizer, isRegionalAdmin, isSystemOwner, isNamedUser, selectedRole]);


    const handleDatesSet = (rangeInfo) => {
        setCalendarStart(rangeInfo.start);
        setCalendarEnd(rangeInfo.end);
        console.log('Dates Set: ', rangeInfo.start, rangeInfo.end);
    };

    const regionSelected = !!selectedRegion;

    const handleEventCreated = async () => {
        try {
            await refreshEvents(); // Manually trigger a refresh of the events
        } catch (error) {
            console.error('Error refreshing events after creation:', error);
        }
    };

    const handleCategoryChange = (newCategories) => {
        setActiveCategories(newCategories);
    };

    const handlePrev = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.prev();
    };

    const handleNext = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.next();
    };

    const handleToday = () => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.today();
    };


    const handleOrganizerChange = (value) => {
        if (value === "none") {
            setSelectedOrganizers([]);
        } else {
            setSelectedOrganizers([value]);
        }
    };

    // Handle date click event and log any true roles
    const handleDateClick = (clickInfo) => {
        console.log('Date Clicked:', clickInfo.dateStr);

        console.log('handleDateClick:', {
            selectedRole,
            AN: isAnonymous,
            RO: isRegionalOrganizer,
            RA: isRegionalAdmin,
            SO: isSystemOwner,
            NU: isNamedUser
        });
        if (isRegionalOrganizer) {  // Check if the user is a Regional Organizer
            if (!selectedRegion) {
                //              setNoRegionSelectedModalOpen(true);  // Open NoRegionSelectedModal if no region selected
            } else {
                setSelectedDate(clickInfo.dateStr);  // Set selected date
                //              setRegionalOrgDateClickModalOpen(true);  // Open RegionalOrgDateClickModal
            }
        } else {
            console.log('User is not a Regional Organizer.');
        }
    };

    const handleEventClick = (clickInfo) => {
        if (!selectedRegion) {
            //        setNoRegionSelectedModalOpen(true); // Open modal if no region is selected
        } else {
            setSelectedEvent(clickInfo.event);
            if (isRegionalOrganizer) {
                setCreateModalOpen(true); // Allow editing for Regional Organizers
            }
        }
    };

    const { events, refreshEvents } = useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd);
    const transformedEvents = transformEvents(events);
    const filteredEvents = filterEvents(transformedEvents, activeCategories, selectedOrganizers);

    const coloredFilteredEvents = filteredEvents.map(event => {
        const categoryColor = categoryColors[event.extendedProps.categoryFirst] || 'lightGrey';
        return {
            ...event,
            backgroundColor: categoryColor,
            textColor: event.extendedProps.categoryFirst === 'Milonga' ? 'white' : 'black',
            borderColor: categoryColor
        };
    });

    console.log('useCalendarPage end is returning', {
        selectedRole,
        AN: isAnonymous,
        RO: isRegionalOrganizer,
        RA: isRegionalAdmin,
        SO: isSystemOwner,
        NU: isNamedUser
    });
    return {
        regions,
        categories,
        activeCategories,
        selectedOrganizers,
        selectedEvent,
        isCreateModalOpen,
        //     isNoRegionSelectedModalOpen,  // Return state for NoRegionSelected modal
        selectedRegion,
        selectedDivision,
        selectedCity,
        selectedDate,
        calendarStart,
        calendarEnd,
        events,
        organizers: useOrganizers(selectedRegion),
        calendarRef,
        isNamedUser,            // Ensure this is returned
        isRegionalOrganizer,     // Ensure this is returned
        isRegionalAdmin,         // Ensure this is returned
        isSystemOwner,
        selectedRole,
        setSelectedEvent,
        setSelectedRegion,
        setSelectedDivision,
        setSelectedCity,
        setSelectedDate,
        setCreateModalOpen,
        //     setNoRegionSelectedModalOpen,  // Add setter for modal
        refreshEvents,
        handleCategoryChange,
        handleDatesSet,
        handlePrev,
        handleNext,
        handleToday,
        handleDateClick,
        handleEventClick,
        handleEventCreated,
        handleOrganizerChange,
        coloredFilteredEvents,
        regionSelected,  // Return the boolean for region selection
    };
};