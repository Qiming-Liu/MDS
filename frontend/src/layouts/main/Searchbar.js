import { useState } from 'react';
import { Link } from 'react-router-dom';
// material
import { styled, alpha } from '@mui/material/styles';
import { Input, Slide, Button, IconButton, InputAdornment } from '@mui/material';
// component
import Iconify from '../../components/Iconify';

// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 76;

const SearchbarStyle = styled('div')(({ theme }) => ({
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: APPBAR_MOBILE,
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  backgroundColor: `${alpha(theme.palette.background.default, 0.72)}`,
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar() {

  const [isOpen, setOpen] = useState(true);
  const [searchText, setSearchText] = useState('');

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    // <ClickAwayListener onClickAway={handleClose}>
    <>
      <div>
        {!isOpen && (
          <IconButton onClick={handleOpen}>
            <Iconify icon="eva:search-fill" width={20} height={20} />
          </IconButton>
        )}

        <Slide direction="down" in={isOpen} mountOnEnter unmountOnExit>
          <SearchbarStyle>
            <Input
              // autoFocus
              fullWidth
              disableUnderline
              placeholder="Search…"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
              }}
              startAdornment={
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                </InputAdornment>
              }
              sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
            />
            <Button variant="contained" component={Link} to={'/?search=' + searchText} color="primary">
              Search
            </Button>
          </SearchbarStyle>
        </Slide>
      </div>
    </>
  );
}
