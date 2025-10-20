import React from "react";
import { CardContent, Stack, Typography, Tooltip } from "@mui/material";
import { SingleProfileResult } from "../types/types";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import { StyledResultCard } from './StyledResultCard';
import { BadgeSuccess } from './BadgeSuccess';
import { BadgeWarning } from './BadgeWarning';
import { DeltaOk } from './DeltaOk';
import { DeltaBad } from './DeltaBad';

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
    <StyledResultCard
      variant="outlined"
      isBestInMain={isBestInMain}
      isAlternative={isAlternative}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" color="primary" fontWeight={700}>
            {isAlternative ? 'НАЙКРАЩА АЛЬТЕРНАТИВА' : `Варіант W${widthDelta >= 0 ? '+' : ''}${widthDelta} (${result.W_new} мм)`}
          </Typography>
          <Stack direction="row" spacing={1}>
            {isBestInMain && (
              <Tooltip title="Найкращий">
                <BadgeSuccess aria-label="Найкращий">
                  <EmojiEventsIcon fontSize="small" titleAccess="Найкращий" />
                </BadgeSuccess>
              </Tooltip>
            )}
            {isAlternative && (
              <Tooltip title="Альтернатива">
                <BadgeWarning aria-label="Альтернатива">
                  <AltRouteIcon fontSize="small" titleAccess="Альтернатива" />
                </BadgeWarning>
              </Tooltip>
            )}
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
          {Math.abs(result.delta_percent) <= maxDeltaPercent ? (
            <DeltaOk>{result.delta_percent.toFixed(2)}%</DeltaOk>
          ) : (
            <DeltaBad>{result.delta_percent.toFixed(2)}%</DeltaBad>
          )}
          )
        </Typography>
      </CardContent>
    </StyledResultCard>
  );
};
