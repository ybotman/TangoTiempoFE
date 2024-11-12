// @/Styles/modalStyles.js
const modalStyle = (isMobile) => ({
  position: 'absolute',
  top: isMobile ? 0 : '50%',
  left: '50%',
  transform: isMobile ? 'none' : 'translate(-50%, -50%)',
  width: isMobile ? '100%' : '80%',
  maxWidth: '800px',
  height: isMobile ? '100%' : 'auto',
  maxHeight: isMobile ? 'none' : '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  overflowY: 'auto',
});

export default modalStyle;
