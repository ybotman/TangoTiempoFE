//app/auth/login/page.js

"use client";

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Paper } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
    const router = useRouter();
    const { user, loading, error, authenticateWithGoogle } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleGoogleLogIn = async () => {
        setIsRedirecting(true);
        const result = await authenticateWithGoogle();
        if (result) {
            router.push('/calendar');
        } else {
            setIsRedirecting(false);
        }
    };

    if (loading || isRedirecting) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography>Error: {error}</Typography>;
    }

    if (user) {
        return (
            <Container component="main" maxWidth="xs">
                <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography component="h1" variant="h5" gutterBottom>
                            You are already logged in!
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ cursor: 'pointer', mt: 2 }}
                            onClick={() => router.push('/calendar')}
                        >
                            Go to Calendar
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography component="h1" variant="h5" gutterBottom>
                        Log In
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" paragraph>
                        Log in with your Google account to access your Tango events calendar.
                    </Typography>
                    <Box
                        component="img"
                        src="/web_light_rd_ctn@1x.png"
                        alt="Log in with Google"
                        sx={{ cursor: 'pointer', mt: 2, mb: 2 }}
                        onClick={handleGoogleLogIn}
                    />
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;
