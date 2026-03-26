import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Avatar, Tooltip, Snackbar, Alert, TextField, InputAdornment, Badge, keyframes } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MailIcon from '@mui/icons-material/Mail';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';
import { useMessages } from '@/hooks/useMessages';
import PostFilter from '@/components/UI/PostFilter';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import SiteMenuBarUserDrawer from './SiteMenuBarUserDrawer';
import MessagesModal from '@/components/Modals/Messages/MessagesModal';

// Pulse animation for new messages
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const SiteMenuBar = ({ activeCategories, handleCategoryChange, categories, searchTerm, onSearchChange, showDiscovered, onDiscoveredToggle, readOnly = false }) => {
  const { selectedRole, user, roles, handleRoleChange, logOut } = useSiteMenuBar();
  const { unreadMessages, unreadCount, hasUnread, acknowledgeMessage } = useMessages();

  const [sidebarDrawerOpen, setSidebarDrawerOpen] = useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [showSearchField, setShowSearchField] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Snackbar state for role change message
  const [roleMessageOpen, setRoleMessageOpen] = useState(false);
  const [selectedRoleName, setSelectedRoleName] = useState('');

  const showRoleMessage = (roleName) => {
    setSelectedRoleName(roleName);
    setRoleMessageOpen(true);
  };

  const handleRoleMessageClose = () => {
    setRoleMessageOpen(false);
  };


  const renderUserIcon = () =>
    user && (user.photoURL || user.displayName) ? (
      <Avatar
        alt={user.displayName || user.email}
        src={user.photoURL || '/defaultAvatar.png'}
        sx={{ width: 32, height: 32 }}
      />
    ) : (
      <AccountCircleIcon sx={{ width: 32, height: 32 }} />
    );

  return (
    <Box
      sx={{
        width: '100%',
        padding: '0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left Icons */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setSidebarDrawerOpen(!sidebarDrawerOpen)}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Center: Search field when open */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {showSearchField && (
          <TextField
            size="small"
            placeholder="Search events..."
            value={searchTerm || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            autoFocus
            sx={{
              flex: 1,
              maxWidth: '400px',
              mx: 1,
              transition: 'all 0.2s ease',
              '& .MuiOutlinedInput-root': {
                borderRadius: '16px',
                height: '32px',
                fontSize: '0.85rem',
              },
              '& .MuiOutlinedInput-input': {
                padding: '6px 0',
                fontSize: '0.85rem',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      onSearchChange?.('');
                      setShowSearchField(false);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>

      {/* Right: Search, Filter, AI, User */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {!showSearchField && (
          <Tooltip title="Search events" arrow>
            <IconButton onClick={() => setShowSearchField(true)}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}

        <PostFilter
          activeCategories={activeCategories}
          handleCategoryChange={handleCategoryChange}
          categories={categories}
        />

        <Tooltip title={showDiscovered ? "Hide BOT-Curated events" : "Show BOT-Curated events"} arrow>
          <IconButton
            onClick={onDiscoveredToggle}
            sx={{
              color: showDiscovered ? 'primary.main' : 'action.disabled',
            }}
          >
            <AutoAwesomeIcon />
          </IconButton>
        </Tooltip>

        {/* Messages Icon - only show for logged-in users */}
        {user && (
          <Tooltip title={hasUnread ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : "Messages"} arrow>
            <IconButton
              onClick={() => {
                setCurrentMessageIndex(0);
                setMessagesModalOpen(true);
              }}
              sx={{
                animation: hasUnread ? `${pulse} 2s ease-in-out infinite` : 'none',
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={9}
              >
                <MailIcon color={hasUnread ? 'primary' : 'inherit'} />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={!user ? "Login here!" : ""} arrow placement="left">
          <IconButton onClick={() => setUserDrawerOpen(true)}>{renderUserIcon()}</IconButton>
        </Tooltip>
      </Box>

      <SidebarDrawer open={sidebarDrawerOpen} onClose={() => setSidebarDrawerOpen(false)} />
      <SiteMenuBarUserDrawer
        userDrawerOpen={userDrawerOpen}
        handleUserDrawerClose={() => setUserDrawerOpen(false)}
        user={user}
        roles={roles}
        selectedRole={selectedRole}
        handleRoleChange={handleRoleChange}
        logOut={logOut}
        showRoleMessage={showRoleMessage}
        readOnly={readOnly}
      />

      <Snackbar
        open={roleMessageOpen}
        onClose={handleRoleMessageClose}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleRoleMessageClose} severity="info" sx={{ backgroundColor: 'green.300', color: 'black' }}>
          You have changed role to: {selectedRoleName}
        </Alert>
      </Snackbar>

      {/* Messages Modal */}
      <MessagesModal
        open={messagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        messages={unreadMessages}
        onAcknowledge={acknowledgeMessage}
        currentIndex={currentMessageIndex}
        onNext={() => setCurrentMessageIndex(prev => Math.min(prev + 1, unreadMessages.length - 1))}
        onPrevious={() => setCurrentMessageIndex(prev => Math.max(prev - 1, 0))}
      />
    </Box>
  );
};

SiteMenuBar.propTypes = {
  activeCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  handleCategoryChange: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      categoryName: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedOrganizer: PropTypes.string,
  searchTerm: PropTypes.string,
  onSearchChange: PropTypes.func,
  showDiscovered: PropTypes.bool,
  onDiscoveredToggle: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default SiteMenuBar;
