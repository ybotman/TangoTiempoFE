// src/app/components/Styles/modalStyles.js

const modalStyle = (isMobile) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  // Add padding to account for safe areas on mobile devices
  ...(isMobile && {
    paddingTop: 'env(safe-area-inset-top, 16px)',
    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
  }),
  // For desktop, center the modal
  ...(!isMobile && {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    height: 'auto',
    maxHeight: '90vh',
    overflowY: 'auto',
  }),
});

export default modalStyle;
