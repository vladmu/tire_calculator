import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

export const BadgeSuccess = styled(Box)(({ theme }) => ({
  borderRadius: '50%',
  height: 24,
  minHeight: 24,
  width: 24,
  minWidth: 24,
  padding: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 0,
  overflow: 'hidden',
  backgroundColor: theme.palette.success.main,
  color: theme.palette.success.contrastText
}));
