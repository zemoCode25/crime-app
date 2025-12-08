# Dashboard KPI Cards - Improvement Plan

## Current State Analysis

### Existing Metrics
1. **Total Reported Crimes** ✅ - Working with trend
2. **Crime Rate** ✅ - Working with trend (crimes/day)
3. **Under Investigation** ✅ - Working with trend
4. **Settled Case** ✅ - Working with trend
5. **Emergency Reports** ❌ - Hardcoded to 0 (not implemented)
6. **Detected Heat Zones** ❌ - Hardcoded to 0 (not implemented)

### Current Trend Implementation
```typescript
interface DashboardTrend {
  value: number;          // Absolute change
  percentage: number;     // Percentage change
  isPositive: boolean;    // Whether trend is good or bad
}
```

**How it works:**
- Compares current period with previous period of same length
- Calculates absolute change and percentage
- Determines "positive" based on metric type:
  - Crimes: down is good
  - Settled cases: up is good

**Display:**
- Shows trend arrow (up/down)
- Shows change value and percentage
- Color-coded: green (positive) / red (negative)

---

## Problems & Opportunities

### 1. Missing Implementations

#### Emergency Reports (Currently: 0)
**Potential Definitions:**
- Option A: Recent urgent crimes (last 24-48 hours)
- Option B: Crimes with high-priority status ("open")
- Option C: Specific high-priority crime types
- Option D: Crimes requiring immediate attention (no investigator assigned)

**Recommendation:** Option B + D combination
- Count crimes with status = "open" (urgent, unassigned)
- These need immediate triage and assignment
- Actionable metric for dispatchers

#### Detected Heat Zones (Currently: 0)
**Available Resources:**
- ML heatmap API at `/api/bigquery/heatmap`
- Returns grid cells with `predicted_is_high_risk = true`
- Has risk probability scores

**Potential Definitions:**
- Option A: Count of high-risk grid cells from ML predictions
- Option B: Number of location clusters with high crime density
- Option C: Barangays with crime count above threshold

**Recommendation:** Option A
- Count ML-predicted high-risk zones for current time/day
- Aligns with existing ML infrastructure
- Updates based on temporal patterns

### 2. Trend Context Issues

**Current Problems:**
- No time period label ("vs. last week" unclear)
- Users don't know what period is being compared
- No indication of statistical significance
- Small numbers can show dramatic percentages (e.g., 1 → 2 = +100%)

**Improvements Needed:**
- Add period labels: "vs. previous 7 days", "vs. previous month"
- Add significance indicators for small sample sizes
- Show absolute numbers in context (e.g., "5 of 50 cases")

### 3. Missing Visual Context

**Current:**
- Single number with trend arrow
- No historical visualization
- No context for "normal" ranges

**Opportunities:**
- Add sparkline mini-charts (7-day/30-day trend)
- Add benchmark indicators (average, target)
- Add progress bars for goals
- Add drill-down links to detailed views

### 4. Limited Actionability

**Current:**
- Metrics are passive (just numbers)
- No clear actions to take
- No alerts or thresholds

**Improvements:**
- Add threshold alerts (e.g., "Emergency reports high!")
- Add action buttons ("View cases", "Assign investigator")
- Add status indicators (🔴 Critical, 🟡 Warning, 🟢 Good)

---

## Proposed Improvements

### Phase 1: Implement Missing Metrics (Priority: HIGH)

#### 1.1 Emergency Reports
**Definition:** Count of crimes with status = "open" (unassigned, urgent)

**Implementation:**
```typescript
// In getDashboardMetrics()
const emergencyReports = await countCases(client, {
  startDate,
  endDate,
  status: "open"
});
```

**Benefits:**
- Actionable metric (shows work queue)
- Trend indicates workload changes
- Helps with resource planning

#### 1.2 Detected Heat Zones
**Definition:** Count of ML-predicted high-risk grid cells

**Implementation:**
- Create new query to fetch heatmap predictions
- Count cells where `predicted_is_high_risk = true`
- Cache results (expensive ML query)
- Update periodically (hourly)

```typescript
async function getHeatZoneCount(client, params) {
  // Fetch from BigQuery heatmap API
  // Count high-risk cells
  // Return count with trend
}
```

**Benefits:**
- Proactive crime prevention metric
- Shows areas needing patrol
- Data-driven resource allocation

### Phase 2: Enhanced Trend Context (Priority: MEDIUM)

#### 2.1 Add Period Labels
```typescript
interface DashboardTrend {
  value: number;
  percentage: number;
  isPositive: boolean;
  periodLabel: string; // NEW: "vs. last 7 days"
  comparisonPeriod: {  // NEW
    start: Date;
    end: Date;
  };
}
```

**Display:**
```
Under Investigation
42
↓ -5 (10.6%) vs. last 7 days
```

#### 2.2 Statistical Significance
```typescript
interface DashboardTrend {
  // ... existing fields
  isSignificant: boolean; // NEW: true if sample size > threshold
  confidenceLevel?: number; // NEW: 0-100
}
```

**Logic:**
- Flag low sample sizes (< 10 cases)
- Show "insufficient data" for very small numbers
- Avoid misleading percentages

### Phase 3: Visual Enhancements (Priority: LOW)

#### 3.1 Sparkline Charts
**Component:**
```tsx
<MetricCard
  title="Total Reported Crimes"
  value={145}
  trend={...}
  sparkline={[120, 125, 130, 135, 140, 145]} // 7-day history
/>
```

**Implementation:**
- Use simple SVG path or recharts mini-chart
- Show 7-day or 30-day history
- Hover shows exact values

#### 3.2 Status Indicators
```tsx
<MetricCard
  title="Emergency Reports"
  value={23}
  status="warning" // "critical" | "warning" | "good"
  threshold={20} // Warning if > 20
/>
```

#### 3.3 Drill-Down Links
```tsx
<MetricCard
  title="Under Investigation"
  value={42}
  actionLink="/crime/cases?status=under-investigation"
  actionLabel="View Cases"
/>
```

### Phase 4: Additional Metrics (Priority: LOW)

Consider adding:
1. **Average Resolution Time** - Days from report to settled
2. **Case Assignment Rate** - % of cases with assigned investigator
3. **Top Crime Type** - Most frequent crime this period
4. **Hottest Barangay** - Location with most crimes
5. **Response Rate** - Cases with responder assigned / total

---

## Implementation Recommendations

### Recommended Approach: Phased Rollout

**Week 1: Critical Fixes**
- ✅ Implement Emergency Reports metric
- ✅ Implement Detected Heat Zones metric
- ✅ Add period labels to trends

**Week 2: Enhanced Context**
- Add statistical significance indicators
- Improve trend explanations
- Add tooltips with detailed info

**Week 3: Visual Polish**
- Add sparkline charts (optional)
- Add status indicators
- Add drill-down links

**Week 4: Additional Metrics**
- Evaluate which additional metrics provide value
- Implement 1-2 high-value metrics
- User feedback and iteration

### Technical Considerations

#### Emergency Reports Implementation
**Pros:**
- Simple SQL query (just filter by status)
- No external dependencies
- Real-time accurate

**Cons:**
- Depends on proper status updates
- May fluctuate rapidly

**Complexity:** LOW

#### Detected Heat Zones Implementation
**Pros:**
- Leverages existing ML infrastructure
- Predictive/proactive metric
- Sophisticated

**Cons:**
- Depends on BigQuery availability
- Expensive queries (need caching)
- Requires error handling

**Complexity:** MEDIUM-HIGH

**Recommendation:** Implement with caching strategy:
```typescript
// Cache heatmap results for 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
let cachedHeatZones = null;
let cacheTimestamp = 0;

async function getHeatZoneCount() {
  if (Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedHeatZones;
  }

  // Fetch new data
  const zones = await fetchHeatmapPredictions();
  cachedHeatZones = zones.filter(z => z.predicted_is_high_risk).length;
  cacheTimestamp = Date.now();

  return cachedHeatZones;
}
```

### Alternative Approaches

#### For Emergency Reports:
**Alternative 1:** Count crimes from last 24 hours
- More objective (time-based)
- Doesn't depend on status updates
- But: Less actionable (includes already-assigned cases)

**Alternative 2:** Count by crime type severity
- Weight serious crimes higher
- Create "emergency" crime type category
- But: Requires crime type severity scoring

**Recommendation:** Stick with status-based (most actionable)

#### For Detected Heat Zones:
**Alternative 1:** Simple geospatial clustering
- Cluster crimes by location (DBSCAN algorithm)
- Count clusters as "zones"
- Faster than ML predictions

**Alternative 2:** Barangay-based hotspots
- Count barangays with crime count > threshold
- Simpler to understand
- But: Less granular than grid-based

**Recommendation:** ML predictions for sophistication, fallback to clustering if BigQuery unavailable

---

## User Experience Considerations

### Trend Interpretation
**Current Issue:** Users may misinterpret trends
- Is -10% crime rate good or bad? (Good!)
- Is +15% settled cases good or bad? (Good!)

**Solution:** Better labeling
```tsx
<MetricCard
  title="Total Reported Crimes"
  value={120}
  trend={{
    value: -12,
    percentage: -10,
    label: "↓ 10% decrease" // Clearer than just "↓ -10%"
    sentiment: "positive"   // Explicit good/bad
  }}
/>
```

### Time Period Selection
**Enhancement:** Show how date range affects metrics

```tsx
<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  comparisonPeriod="auto" // Shows comparison automatically
/>

// Display: "Jan 1-7, 2025 (vs. Dec 25-31, 2024)"
```

### Mobile Responsiveness
**Current:** Grid layout adapts
**Enhancement:** Stack metrics vertically on mobile, prioritize top KPIs

---

## Success Metrics

### How to measure if improvements work:

1. **Completeness:** All 6 KPIs show real data (not 0)
2. **Clarity:** Users understand what trends mean
3. **Actionability:** Users take action based on metrics
4. **Performance:** Dashboard loads in < 2s
5. **Accuracy:** Metrics match manual queries

### User Feedback Questions:

1. "Which metric is most useful for your daily work?"
2. "Do you understand what the trends indicate?"
3. "What metric is missing that you need?"
4. "How often do you check the dashboard?"

---

## Next Steps

1. **Decide on approach** for Emergency Reports and Heat Zones
2. **Estimate effort** for Phase 1 implementation
3. **Create tasks** for each improvement
4. **Implement Phase 1** (missing metrics + labels)
5. **Gather feedback** before proceeding to Phase 2

### Questions for Product Owner:

1. **Emergency Reports:** Should we count "open" status or last 24 hours?
2. **Heat Zones:** Is BigQuery dependency acceptable? Need fallback?
3. **Trends:** Which time periods are most relevant? (daily, weekly, monthly?)
4. **Additional Metrics:** Which Phase 4 metrics provide most value?
5. **Thresholds:** What values should trigger warnings/alerts?