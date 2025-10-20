import { styled, alpha } from '@mui/material/styles';
import { Card } from '@mui/material';

export interface StyledResultCardProps {
  isBestInMain?: boolean;
  isAlternative?: boolean;
}

export const StyledResultCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isBestInMain' && prop !== 'isAlternative'
})<StyledResultCardProps>(({ theme, isBestInMain, isAlternative }) => {
  const isBest = !!isBestInMain;
  const isAlt = !!isAlternative;
  const borderColor = isBest
    ? theme.palette.success.main
    : isAlt
    ? theme.palette.warning.main
    : theme.palette.divider;
  const bgColor = isBest
    ? alpha(theme.palette.success.main, 0.08)
    : isAlt
    ? alpha(theme.palette.warning.main, 0.08)
    : theme.palette.background.paper;

  return {
    flex: '1 1 280px',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor,
    backgroundColor: bgColor
  } as const;
});
