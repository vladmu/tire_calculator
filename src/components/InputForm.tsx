import React from "react";
import { observer } from "mobx-react-lite";
import { calculatorStore } from "../stores/CalculatorStore";
import { Box, Button, TextField, IconButton } from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { MIN_R, MAX_R } from "../services/calculator";

export const InputForm: React.FC = observer(() => {
  const s = calculatorStore;

  const [focused, setFocused] = React.useState<'R'|'W'|'V'>('R');
  const rRef = React.useRef<HTMLInputElement>(null);
  const wRef = React.useRef<HTMLInputElement>(null);
  const vRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    s.calculate();
  };

  const arrowColor = (field: 'R'|'W'|'V'): 'primary' | 'default' => (focused === field ? 'primary' : 'default');
  const focusField = (field: 'R'|'W'|'V') => {
    setFocused(field);
    const map = { R: rRef, W: wRef, V: vRef } as const;
    map[field].current?.focus();
  };

  const rVal = s.currentR;
  const wVal = Number.parseInt(s.W_old, 10);
  const vVal = Number.parseInt(s.V_old, 10);

  const lessRDisabled = rVal <= MIN_R;
  const moreRDisabled = rVal >= MAX_R;
  const lessWDisabled = Number.isNaN(wVal) ? false : wVal <= s.currentMinW;
  const moreWDisabled = Number.isNaN(wVal) ? false : wVal >= s.currentMaxW;
  const lessVDisabled = Number.isNaN(vVal) ? false : vVal <= s.currentMinV;
  const moreVDisabled = Number.isNaN(vVal) ? false : vVal >= s.currentMaxV;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {/* R field with arrows */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="less R" color={arrowColor('R')} onClick={() => { focusField('R'); s.decrementR(); }} disableRipple disableTouchRipple disabled={lessRDisabled}>
            <PlayArrowIcon sx={{ transform: 'rotate(180deg)' }} />
          </IconButton>
          <TextField
            label="Діаметр диска (R, дюйми)"
            type="number"
            value={s.R_old}
            inputRef={rRef}
            onFocus={() => setFocused('R')}
            slotProps={{ input: { inputProps: { min: 12, max: 25, step: 1, readOnly: true } } }}
            fullWidth
          />
          <IconButton aria-label="more R" color={arrowColor('R')} onClick={() => { focusField('R'); s.incrementR(); }} disableRipple disableTouchRipple disabled={moreRDisabled}>
            <PlayArrowIcon />
          </IconButton>
        </Box>

        {/* W field with arrows */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="less W" color={arrowColor('W')} onClick={() => { focusField('W'); s.decrementW(); }} disableRipple disableTouchRipple disabled={lessWDisabled}>
            <PlayArrowIcon sx={{ transform: 'rotate(180deg)' }} />
          </IconButton>
          <TextField
            label="Ширина шини (W, мм)"
            type="number"
            value={s.W_old}
            inputRef={wRef}
            onFocus={() => setFocused('W')}
            slotProps={{ input: { inputProps: { min: s.currentMinW, max: s.currentMaxW, step: 10, readOnly: true } } }}
            fullWidth
          />
          <IconButton aria-label="more W" color={arrowColor('W')} onClick={() => { focusField('W'); s.incrementW(); }} disableRipple disableTouchRipple disabled={moreWDisabled}>
            <PlayArrowIcon />
          </IconButton>
        </Box>

        {/* V field with arrows */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: 1 }}>
          <IconButton aria-label="less V" color={arrowColor('V')} onClick={() => { focusField('V'); s.decrementV(); }} disableRipple disableTouchRipple disabled={lessVDisabled}>
            <PlayArrowIcon sx={{ transform: 'rotate(180deg)' }} />
          </IconButton>
          <TextField
            label="Профіль (V, %)"
            type="number"
            value={s.V_old}
            inputRef={vRef}
            onFocus={() => setFocused('V')}
            slotProps={{ input: { inputProps: { min: s.currentMinV, max: s.currentMaxV, step: 5, readOnly: true } } }}
            fullWidth
          />
          <IconButton aria-label="more V" color={arrowColor('V')} onClick={() => { focusField('V'); s.incrementV(); }} disableRipple disableTouchRipple disabled={moreVDisabled}>
            <PlayArrowIcon />
          </IconButton>
        </Box>
      </Box>
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disableRipple disableTouchRipple>
        Розрахувати нові розміри
      </Button>
    </Box>
  );
});
