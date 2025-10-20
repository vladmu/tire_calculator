import { Box, Typography } from "@mui/material";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import React from "react";

export const Header: React.FC = () => {
  return (
    <Box textAlign="center" mb={2}>
      <Typography variant="h4" component="h1" color="primary" fontWeight={700} display="flex" alignItems="center" justifyContent="center" gap={1}>
        <DirectionsCarIcon /> Калькулятор підбору шин і дисків
      </Typography>
      <Typography variant="body1" color="text.secondary" mt={1}>
        Введіть поточні параметри шини.
      </Typography>
    </Box>
  );
};
