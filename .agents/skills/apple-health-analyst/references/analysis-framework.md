# Health Data Interpretation Framework

This document provides background knowledge for cross-metric health interpretation. All content is intended solely for generating health management advice, not for medical diagnosis.

## 1. Sleep and HRV Correlation

HRV (Heart Rate Variability) is a key indicator of autonomic nervous system activity. Research shows:

- **Insufficient sleep lowers HRV**: After < 6 hours of sleep, parasympathetic tone decreases, and HRV typically drops 10-20%.
- **Deep sleep proportion affects recovery**: Deep sleep (N3 stage) is when HRV is highest. Deep sleep below 15% suggests recovery quality may be limited.
- **Lag effect**: The HRV impact of one short night is most evident the following day. If short sleep persists for 2-3 consecutive days, HRV may remain depressed.

**Interpretation guide**: If `crossMetric.sleepRecoveryLink.hrvDropOnPoorSleep` exceeds -10%, this person's autonomic nervous system is relatively sensitive to sleep deprivation — prioritize ensuring adequate sleep duration.

## 2. Resting Heart Rate and HRV Coherence

RHR and HRV reflect two sides of the sympathetic/parasympathetic balance:

- **RHR down + HRV up** = Recovery improving, autonomic balance shifting toward parasympathetic dominance.
- **RHR up + HRV down** = Dual stress signal, potentially from: overtraining, insufficient sleep, psychological stress, or pre-illness.
- **RHR down + HRV down** = Mixed signal, possibly medication effects or measurement noise.
- **RHR stable + HRV stable** = Physiological state is steady with no significant external disruption.

**Interpretation guide**: Check `crossMetric.recoveryCoherence.aligned`. If misaligned, reason about possible causes in the narrative.

## 3. Training Load and Recovery Balance

Referenced from WHOOP and Oura methodology:

- **Appropriate load**: HRV returns to baseline within 1-2 days after a high-exercise day, indicating sufficient recovery capacity.
- **Overload**: HRV remains below baseline for 2+ days after high exercise, or 4+ consecutive high-exercise days without rest.
- **WHO recommendation**: 150 minutes/week of moderate-intensity aerobic exercise, or 75 minutes of vigorous exercise.
- **Weekend warrior risk**: Concentrating a week's exercise into 1-2 weekend days carries higher cardiovascular event risk than even distribution.

**Interpretation guide**: When `crossMetric.activityRecoveryBalance.recoveryAdequate` is false, recommend reducing consecutive high-intensity days and adding recovery days.

## 4. Schedule Regularity

Research suggests that sleep schedule regularity may have a greater health impact than total sleep duration:

- **Regular bedtime/wake times** strengthen circadian rhythm, improving deep sleep proportion and hormone secretion patterns.
- **Bedtime standard deviation > 60 minutes** is considered "social jet lag," equivalent to frequent time zone travel.
- **Fixed wake time** is the most effective anchor for establishing a regular schedule, as light exposure directly regulates melatonin secretion.

**Interpretation guide**: When `crossMetric.sleepConsistency.regularity` is "low," prioritize recommending a fixed wake time rather than an earlier bedtime.

## 5. Common Behavioral Patterns and Health Impact

### Weekend Warrior
- **Characteristics**: Minimal exercise on weekdays, concentrated heavy exercise on weekends
- **Risk**: Higher musculoskeletal injury risk; weaker cardiovascular protection than evenly distributed exercise
- **Recommendation**: Add 15-20 minutes of walking or light exercise on weekdays

### Night Owl Drift
- **Characteristics**: Bedtime gradually shifting later (15-30 minutes later per week)
- **Impact**: Decreased deep sleep proportion, lower HRV, increased daytime sleepiness
- **Recommendation**: Increase morning outdoor light exposure (at least 10 minutes), reduce evening blue light

### Sleep Compensation (Weekend Catch-up)
- **Characteristics**: Weekdays < 6.5 hours, weekends > 8 hours
- **Issue**: Research shows weekend catch-up sleep only partially restores cognitive function and cannot fully repay metabolic and immune deficits
- **Recommendation**: Ensure at least 7 hours on weekdays; reduce reliance on weekend compensation

### Recovery Deficit
- **Characteristics**: 4+ consecutive days of high exercise volume with no light recovery days
- **Risk**: Overtraining syndrome, sustained low HRV, declining athletic performance
- **Recommendation**: Schedule a light day (walking, stretching, yoga) every 2-3 days

## 6. Composite Score Interpretation

The scoring algorithm is transparent and explainable:

- **Sleep Score** = Duration (40%) + Regularity (30%) + Deep Sleep % (30%)
- **Recovery Score** = HRV Trend (40%) + RHR Trend (30%) + Sleep Adequacy (30%)
- **Activity Score** = Exercise Volume (50%) + Consistency (50%)

The value of scores lies not in precise numbers but in the **relative differences between dimensions**. For example:
- Sleep 45 / Recovery 80 / Activity 70 → Sleep is the bottleneck; prioritize improvement
- Sleep 80 / Recovery 40 / Activity 85 → Training is strong but recovery is insufficient; add recovery days

## 7. Safety Boundary Reminders

The following situations warrant a medical consultation recommendation (conservative phrasing):

- Resting heart rate persistently > 100 bpm or sustained increase > 10 bpm
- HRV declining significantly and persistently without obvious lifestyle changes
- Blood oxygen persistently ≤ 93%
- Sudden noticeable decline in exercise tolerance
- Weight loss > 3 kg within 2 weeks without intentional fat loss

These do not constitute diagnoses. Use phrasing like "if this persists, consider consulting a doctor."
