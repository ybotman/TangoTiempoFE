import { useState, useEffect, useRef } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { filterEvents } from '@/utils/filterEvents';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import useOrganizers from '@/hooks/useOrganizers';
import { useRegions } from '@/hooks/useRegions';
import { useAuth } from '@/hooks/useAuth';

export const useCalendarPage = () => {
    const {
        selectedRole,
        isRegionalOrganizer,
        isNamedUser,
        isSystemOwner,
        isAnonymous,

    } = useAuth();  // Handle role-based logic here

    const regions = useRegions();
    const categories = useCategories();
    const [activeCategories, setActiveCategories] = useState([]);
    const [selectedOrganizers, setSelectedOrganizers] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isRegionalOrgDateClickModalOpen, setRegionalOrgDateClickModalOpen] = useState(false);
    const [isNoRegionSelectedModalOpen, setNoRegionSelectedModalOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedDivision, setSelectedDivision] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarStart, setCalendarStart] = useState(null);
    const [calendarEnd, setCalendarEnd] = useState(null);
    const calendarRef = useRef(null);


    // Ensure that the component re-renders when selectedRole changes
    useEffect(() => {
        console.log("Selected Role changed:", selectedRole);
    }, [selectedRole]);

    // Boolean to track if a region has been selected
    //const regionSelected = !!selectedRegion;
    const isRegionSelected = !!selectedRegion;

    const handleDatesSet = (rangeInfo) => {
        setCalendarStart(rangeInfo.start);
        setCalendarEnd(rangeInfo.end);
        console.log('Dates Set: ', rangeInfo.start, rangeInfo.end);
    };

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


    // Handle date click event
    const handleDateClick = (clickInfo) => {
        console.log('handleDateClick role', selectedRole);
        if (isRegionalOrganizer) {
            if (!isRegionSelected) {  // Check if a region is selected
                setNoRegionSelectedModalOpen(true);  // Open NoRegionSelectedModal if no region selected
            } else {
                setSelectedDate(clickInfo.dateStr);  // Set selected date
                setRegionalOrgDateClickModalOpen(true);  // Open RegionalOrgDateClickModal
            }
        } else {
            console.log('User is not a Regional Organizer.');
        }
    };

    // Modify handleEventClick to check region selection and role
    const handleEventClick = (clickInfo) => {
        if (!isRegionSelected) {
            setNoRegionSelectedModalOpen(true); // Open modal if no region is selected
        } else {
            setSelectedEvent(clickInfo.event);

            if (isRegionalOrganizer) {
                setCreateModalOpen(true); // Allow editing for Regional Organizers
            }
        }
    };

    const handleOrganizerChange = (value) => {
        if (value === "none") {
            setSelectedOrganizers([]);
        } else {
            setSelectedOrganizers([value]);
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

    return {
        regions,
        categories,
        activeCategories,
        selectedOrganizers,
        selectedEvent,
        isCreateModalOpen,
        isNoRegionSelectedModalOpen,  // Return state for NoRegionSelected modal
        selectedRegion,
        selectedDivision,
        selectedCity,
        selectedDate,
        calendarStart,
        calendarEnd,
        events,
        organizers: useOrganizers(selectedRegion),
        calendarRef,
        setSelectedEvent,
        setSelectedRegion,
        setSelectedDivision,
        setSelectedCity,
        setSelectedDate,
        setCreateModalOpen,
        setNoRegionSelectedModalOpen,  // Add setter for modal
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
        isRegionSelected  // Return the boolean for region selection
    };
};