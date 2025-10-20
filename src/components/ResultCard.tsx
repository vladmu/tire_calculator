import React from "react";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { SingleProfileResult } from "../types/types";

interface Props {
  result: SingleProfileResult;
  isBestInMain?: boolean;
  isAlternative?: boolean;
  baseWidth: number;
  maxDeltaPercent: number;
}

export const ResultCard: React.FC<Props> = ({ result, isBestInMain, isAlternative, baseWidth, maxDeltaPercent }) => {
  const widthDelta = result.W_new - baseWidth;
  const widthLabel = widthDelta > 0 ? 'Збільшення ширини' : widthDelta < 0 ? 'Зменшення ширини' : 'Без зміни ширини';

  return (
    <Card
      variant="outlined"
      sx={{
        flex: '1 1 280px',
        '&:hover': { transform: 'translateY(-3px)' },
        borderWidth: isBestInMain ? 3 : isAlternative ? 3 : 1,
        borderColor: isBestInMain ? 'success.main' : isAlternative ? 'warning.main' : 'divider',
        backgroundColor: isBestInMain ? 'success.50' : isAlternative ? 'warning.50' : 'background.paper'
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" color="primary" fontWeight={700}>
            {isAlternative ? 'НАЙКРАЩА АЛЬТЕРНАТИВА' : `Варіант W${widthDelta >= 0 ? '+' : ''}${widthDelta} (${result.W_new} мм)`}
          </Typography>
          <Stack direction="row" gap={1}>
            {isBestInMain && <Chip color="success" size="small" label="Best" />}
            {isAlternative && <Chip color="warning" size="small" label="Alt" />}
          </Stack>
        </Stack>
        <Typography variant="subtitle1" fontWeight={800} color={isBestInMain ? 'success.main' : 'text.primary'}>
          {result.newSize}
        </Typography>
        <Typography variant="body2"><strong>{widthLabel}:</strong> {Math.abs(widthDelta)} мм</Typography>
        <Typography variant="body2"><strong>Макс. диск (R):</strong> {result.R_new} дюймів</Typography>
        <Typography variant="body2"><strong>Фактичний профіль:</strong> {result.V_new}% (Розрахунковий: {result.V_needed_float?.toFixed(2)}%)</Typography>
        <Typography variant="body2"><strong>Фінальний діаметр:</strong> {result.D_total_new.toFixed(1)} мм</Typography>
        <Typography variant="body2">
          <strong>Дельта діаметра:</strong> {result.delta.toFixed(1)} мм (
          <span style={{ color: `var(--mui-palette-${Math.abs(result.delta_percent) <= maxDeltaPercent ? 'success' : 'error'}-main)` }}>
            {result.delta_percent.toFixed(2)}%
          </span>)
        </Typography>
      </CardContent>
    </Card>
  );
};
