import { theme } from './theme';
import { blue } from '@mui/material/colors';

test('default theme is used (no customizations)', () => {
  expect(theme.palette.primary.main).toBe(blue[700]);
  expect(theme.shape.borderRadius).toBe(4);
});
