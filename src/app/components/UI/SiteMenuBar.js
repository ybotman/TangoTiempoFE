import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';
import { Box, IconButton, Avatar, Tooltip, Snackbar, Alert, TextField, InputAdornment, Badge, keyframes } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MailIcon from '@mui/icons-material/Mail';
import { useSiteMenuBar } from '@/hooks/useSiteMenuBar';
import { useMessages } from '@/hooks/useMessages';
import PostFilter from '@/components/UI/PostFilter';
import SidebarDrawer from '@/components/UI/SidebarDrawer';
import SiteMenuBarUserDrawer from './SiteMenuBarUserDrawer';
import MessagesModal from '@/components/Modals/Messages/MessagesModal';
import ModeToggle from '@/components/UI/ModeToggle'; // TIEMPO-402
import BrandMark from '@/components/UI/BrandMark'; // TIEMPO-408
import CityPill from '@/components/UI/CityPill'; // TIEMPO-408

// Pulse animation for new messages
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const SiteMenuBar = ({ activeCategories, handleCategoryChange, categories, searchTerm, onSearchChange, showDiscovered, onDiscoveredToggle, readOnly = false }) => {
  const { selectedRole, user, roles, handleRoleChange, logOut } = useSiteMenuBar();
  const { unreadMessages, unreadCount, hasUnread, acknowledgeMessage } = useMessages();
  const pathname = usePathname();
  // TIEMPO-408: /calendar/boston is a legacy iframe embed — keep its chrome as-is.
  const isBoston = pathname?.startsWith('/calendar/boston');
  const isExplorePage = pathname === '/explore';

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
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      {/* TIEMPO-408 Row 1 (primary chrome): brand · city · mode tabs.
          TIEMPO-415: Boston embed hides Row 1 entirely — legacy audience
          stays in their owned space; the TT email campaign pulls them
          forward. They still have sidebar/search via Row 2. */}
      {!isBoston && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            px: 1,
            py: 0.75,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0, flexShrink: 1 }}>
            <BrandMark size={isExplorePage ? 44 : 36} />
            {!isExplorePage && <CityPill />}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <ModeToggle />
          </Box>
        </Box>
      )}

      {/* TIEMPO-408 Row 2 (utility): menu · search · filter · ai · messages · user */}
      <Box
        sx={{
          width: '100%',
          padding: '0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
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
              opacity: showDiscovered ? 1 : 0.4,
            }}
          >
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>🤖</span>
              <span style={{
                position: 'absolute',
                top: '-4px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '0.5rem',
                fontWeight: 'bold',
                color: '#fff',
                background: showDiscovered ? '#1976d2' : '#999',
                borderRadius: '3px',
                padding: '0 3px',
                lineHeight: 1.3
              }}>AI</span>
            </span>
          </IconButton>
        </Tooltip>

        {/* Messages Icon - only show when there are unread messages */}
        {user && hasUnread && (
          <Tooltip title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`} arrow>
            <IconButton
              onClick={() => {
                setCurrentMessageIndex(0);
                setMessagesModalOpen(true);
              }}
              sx={{
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={9}
              >
                <MailIcon color="primary" />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={!user ? "Login here!" : ""} arrow placement="left">
          <IconButton onClick={() => setUserDrawerOpen(true)}>{renderUserIcon()}</IconButton>
        </Tooltip>
      </Box>
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
