"use client";

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { useRouter } from 'next/navigation';
import { Box, Typography, Container, Paper } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

const SignUpPage = () => {
    const router = useRouter();
    const { user, loading, error, authenticateWithGoogle } = useAuth();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const handleGoogleSignUp = async () => {
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
                        Sign Up
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" paragraph>
                        Sign up with your Google account to start organizing and managing Tango events.
                    </Typography>
                    <Box
                        component="img"
                        src="/web_light_rd_SU@1x.png"
                        alt="Sign up with Google"
                        sx={{ cursor: 'pointer', mt: 2, mb: 2 }}
                        onClick={handleGoogleSignUp}
                    />
                </Box>
            </Paper>
        </Container>
    );
};

export default SignUpPage;
