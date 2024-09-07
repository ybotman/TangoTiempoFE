import { useState, useRef } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { filterEvents } from '@/utils/filterEvents';
import { transformEvents } from '@/utils/transformEvents';
import { categoryColors } from '@/utils/categoryColors';
import useCategories from '@/hooks/useCategories';
import useOrganizers from '@/hooks/useOrganizers';
import { useRegions } from '@/hooks/useRegions';
import { useAuth } from '@/hooks/useAuth';  // Import for role handling

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

    // Get user and roles for role-based checks
    const { user, roles } = useAuth();
    const selectedRole = roles[0] || "";
    const isRegionalOrganizer = selectedRole === "RegionalOrganizer";

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
        console.log('handleCategoryChange called with:', newCategories);
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

    // Modify handleDateClick to check role
    const handleDateClick = (clickInfo) => {
        if (isRegionalOrganizer) {
            setSelectedDate(clickInfo.date);
            setCreateModalOpen(true); // Only allow opening CRUD modal for Regional Organizers
        } else {
            console.log("User is not authorized to create events");
        }
    };

    // Modify handleEventClick to check role
    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);

        if (isRegionalOrganizer) {
            setCreateModalOpen(true); // Allow editing for Regional Organizers
        } else {
            console.log("User can only view event details");
        }
    };

    const handleOrganizerChange = (value) => {
        if (value === "none") {
            setSelectedOrganizers([]);
        } else {
            setSelectedOrganizers([value]);
        }
    };

    console.log('events Data', selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd);
    const { events, refreshEvents } = useEvents(selectedRegion, selectedDivision, selectedCity, calendarStart, calendarEnd);
    console.log('events', events);
    const transformedEvents = transformEvents(events);
    console.log('transformEvents', transformedEvents);
    console.log('enteringfitlerEvent', transformedEvents, activeCategories);

    const filteredEvents = filterEvents(transformedEvents, activeCategories, selectedOrganizers);
    console.log('filteredEvents', filteredEvents);

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
        refreshEvents,
        handleCategoryChange,
        handleDatesSet,
        handlePrev,
        handleNext,
        handleToday,
        handleDateClick, // Updated to be role-aware
        handleEventClick, // Updated to be role-aware
        handleEventCreated,
        handleOrganizerChange,
        coloredFilteredEvents
    };
};