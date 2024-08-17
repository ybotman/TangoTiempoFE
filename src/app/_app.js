// pages/_app.js
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function MyApp({ Component, pageProps }) {


    return (

        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Component {...pageProps} />
        </LocalizationProvider>
    );
}
