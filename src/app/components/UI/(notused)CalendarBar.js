// src/components/UI/CalendarBar.js
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import ViewListIcon from '@mui/icons-material/ViewList';

const CalendarBar = ({ events, handleEventClick, handleDatesSet }) => {
    const fullCalendarRef = useRef(null);

    return (
        <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            }}
            customButtons={{
                dayGridMonth: {
                    text: '',
                    click: () => fullCalendarRef.current.getApi().changeView('dayGridMonth'),
                    icon: <CalendarMonthIcon />
                },
                timeGridWeek: {
                    text: '',
                    click: () => fullCalendarRef.current.getApi().changeView('timeGridWeek'),
                    icon: <CalendarViewWeekIcon />
                },
                listWeek: {
                    text: '',
                    click: () => fullCalendarRef.current.getApi().changeView('listWeek'),
                    icon: <ViewListIcon />
                }
            }}
            buttonText={{
                dayGridMonth: '',
                timeGridWeek: '',
                listWeek: ''
            }}
            events={events}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            ref={fullCalendarRef}
        />
    );
};

export default CalendarBar;