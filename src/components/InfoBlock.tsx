import React from "react";
import { Alert, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Tooltip } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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

  const [open, setOpen] = React.useState(false);

  return (
    <Box mb={2}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Tooltip title="Інформація">
          <IconButton aria-label="Інформація" onClick={() => setOpen((v) => !v)} size="small" disableRipple disableTouchRipple>
            <InfoOutlinedIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {open && (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography component="div" variant="body2">
              <strong>Умови розрахунку:</strong> Максимально можливий диск з мінімальною дельтою. Обмеження дельти: не більше ±2%. Профіль ≥ 20% з кроком 5%. Діаметр диска ≤ 25 дюймів (ціле число).
            </Typography>
            <Typography component="div" variant="body2" sx={{ mt: 1 }}>
              Основний варіант: збільшення радіусу без зміни ширини (W). Два додаткові для порівняння: W+10 та W+20 мм; серед трьох підсвічується потенційно найкращий за мінімальною |дельтою| діаметра.
            </Typography>
            <Typography component="div" variant="body2" sx={{ mt: 1 }}>
              Альтернативний варіант: за потреби може бути показаний поза основним діапазоном ширин (±40 мм від базової, крок 10 мм) як окрема картка, якщо знайдено допустимий розмір.
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
        </>
      )}
    </Box>
  );
};
