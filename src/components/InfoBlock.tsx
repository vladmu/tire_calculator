import React from "react";
import { Alert, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MAX_LIMITS, MIN_LIMITS } from "../services/calculator";

export const InfoBlock: React.FC = () => {
  const rows = Object.keys(MIN_LIMITS)
    .map(Number)
    .sort((a, b) => a - b)
    .map((r) => ({
      r,
      min: MIN_LIMITS[r],
      max: MAX_LIMITS[r]
    }));

  return (
    <Box mb={2}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography component="div" variant="body2">
          <strong>Умови розрахунку:</strong> Максимально можливий диск з мінімальною дельтою. Обмеження дельти: не більше ±2%. Профіль ≥ 20% з кроком 5%. Діаметр диска ≤ 25 дюймів (ціле число).
        </Typography>
        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
          Варіанти розрахунку: Основні варіанти W, W+10, W+20 мм. Альтернативний варіант (крок 10 мм) показується, якщо існує інша ширина (W 
          {"<"} W або W {">"} W+20), яка дає меншу абсолютну дельту діаметра.
        </Typography>
        <Typography component="div" variant="body2" sx={{ mt: 1 }}>
          <strong>(W — це Ширина шини в мм). УВАГА:</strong> Застосовуються мінімальні та максимальні ліміти ширини та профілю для кожного діаметра диска.
        </Typography>
      </Alert>

      <Accordion>
        <AccordionSummary disableRipple disableTouchRipple expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" fontWeight={700}>Мінімальні та Максимальні ліміти (натисніть для перегляду)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center" rowSpan={2}><strong>R (дюйми)</strong></TableCell>
                <TableCell align="center" colSpan={2}><strong>Мінімальний ліміт</strong></TableCell>
                <TableCell align="center" colSpan={2}><strong>Максимальний ліміт</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell align="center"><strong>W (мм)</strong></TableCell>
                <TableCell align="center"><strong>V (%)</strong></TableCell>
                <TableCell align="center"><strong>W (мм)</strong></TableCell>
                <TableCell align="center"><strong>V (%)</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ r, min, max }) => (
                <TableRow key={r}>
                  <TableCell align="center">{r}</TableCell>
                  <TableCell align="center">{min[0]}</TableCell>
                  <TableCell align="center">{min[1]}</TableCell>
                  <TableCell align="center">{max[0]}</TableCell>
                  <TableCell align="center">{max[1]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
