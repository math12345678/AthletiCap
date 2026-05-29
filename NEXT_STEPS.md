# AthletiCap - Next Implementation Steps

## Quick Win Fixes (1-2 hours each)

### 1. Settings Page - Navigation Links
**Issue:** About, Terms of Service, and Privacy Policy buttons don't navigate anywhere.

**Solution:**
- Create `/src/pages/About.tsx` with project information
- Create `/src/pages/Legal.tsx` with Terms of Service and Privacy Policy
- Add routes to App.tsx for `/about` and `/legal`
- Update Settings.tsx button links to navigate to these pages

**Effort:** 30 minutes

---

### 2. School Matcher - Implement Sort Feature
**Issue:** Sort dropdown doesn't actually filter/sort schools.

**Solution:**
- Add sorting logic to SchoolMatcher.tsx component
- Implement sort options:
  - By fit score (high to low)
  - By athletic scholarship % (high to low)
  - By cost (low to high)
  - By distance from preferred location
- Apply filter/sort before rendering school cards

**Effort:** 45 minutes

---

### 3. School Matcher - "Learn More" Modal
**Issue:** Currently just restates existing information.

**Solution:**
- Create SchoolDetailModal component that shows:
  - School's academic requirements (GPA, test scores)
  - Athletic scholarship typical range
  - Program details and coaching staff
  - Student life and campus info
  - Link to school website
- Trigger modal from "Learn More" button
- Fetch additional school data from API or mock database

**Effort:** 1 hour

---

## Medium Effort Fixes (2-3 hours each)

### 4. School Watchlist - Data Persistence
**Issue:** Watchlist is returned from demo but not stored in backend.

**Solution:**
- Create watchlist storage in backend (similar to expenses/offers)
- Add endpoints:
  - `POST /api/schools/watchlist` - Add school to watchlist
  - `DELETE /api/schools/watchlist/:schoolId` - Remove school
  - `GET /api/schools/watchlist` - Fetch user's watchlist
- Store watchlist associations in-memory Map or database
- Update frontend to use these endpoints
- Ensure watchlist persists across sessions

**Effort:** 2 hours

---

### 5. School Offers - Debug Loading Issue
**Issue:** Offers page doesn't load/render properly.

**Solution:**
- Check API endpoint for errors
- Verify offer data structure matches component expectations
- Test error handling in OffersV2.tsx
- Add loading/error states
- Verify button styling after color fix

**Effort:** 1 hour

---

### 6. Monte Carlo Visualization Improvement
**Issue:** User reports projections don't look realistic.

**Solution:**
- Review current Monte Carlo algorithm in BudgetAdvisor
- Options for improvement:
  - Add variance/standard deviation to projections
  - Show confidence intervals (10th, 50th, 90th percentiles)
  - Visualize multiple simulation runs instead of single projection
  - Add market volatility factors
- Update visualization to show distribution, not just point estimate

**Effort:** 2-3 hours

---

## Feature Completions (3-5 hours each)

### 7. Notifications System
**Issue:** No notifications despite bell icon in navigation.

**Solution:**
- Define notification types (offer received, deadline approaching, etc.)
- Add notifications storage to backend
- Create notification center page or dropdown
- Trigger notifications for key events:
  - New offer received
  - Milestone approaching deadline
  - Important dates
- Display unread count on notification bell

**Effort:** 3-4 hours

---

### 8. Enhanced Demo Profile
**Issue:** Demo profile could be more complete.

**Enhancement Ideas:**
- Add more schools to watchlist (currently 10, could be 20)
- Add milestones with some marked as complete
- Add more realistic contact stage distribution
- Include some "in progress" states rather than just initial
- Add family profile notes/preferences

**Effort:** 1 hour

---

## Testing & Validation

### User Flow Testing
After implementing fixes, test this complete flow:
1. Load demo profile (should show family data, milestones, offers)
2. View dashboard (verify financial readiness section)
3. Go to Financial Readiness (verify family profile is there)
4. Update family profile on dashboard
5. Return to Financial Readiness (verify update persists)
6. View Milestones (should show soccer milestones)
7. Click School Matcher and use sort feature
8. Create new profile (verify optional fields work)

### Browser Testing
- Test on mobile (375px width)
- Test on tablet (768px width)
- Test on desktop (1280px width)
- Test button visibility on all screens

---

## Recommended Priority Order

**Phase 1 (Today):**
1. ✅ Settings navigation links (quick win)
2. ✅ School Matcher sort feature (quick win)
3. ✅ School Offers debug (quick win)

**Phase 2 (Tomorrow):**
4. School Matcher "Learn More" modal
5. School Watchlist data persistence
6. Test complete user flow

**Phase 3 (Later):**
7. Notifications system (nice to have)
8. Monte Carlo improvements (nice to have)

---

## Key Files to Watch

- `/src/pages/` - Main page components
- `/src/contexts/` - Global state (now includes FamilyProfileContext)
- `/src/components/` - Reusable components
- `/apps/api/src/app.ts` - Backend endpoints and data

---

## Performance Notes

- All family profile data is stored in localStorage for quick access
- Milestones are auto-created on first fetch if missing
- Demo profile loads all related data in single endpoint call
- Form validation now properly handles optional numeric fields

---

## Known Limitations to Address

1. **School data completeness** - Matcher shows basic info, could use more detail
2. **Watchlist capacity** - Demo has 10 schools, user might want 20+
3. **Notifications** - Currently only toast messages, no persistent notification system
4. **Mobile UX** - Some pages might need mobile-specific layout adjustments
5. **Accessibility** - Could improve keyboard navigation and screen reader support

---

## Dependencies to Check

- React Router - for new page routes
- React Query - for data fetching (if using hooks)
- Recharts - for visualizations (already used)
- Tailwind CSS - for styling (color variables updated)
- Zod - for form validation (already improved)

---

**Estimated Total Time to Complete All Fixes:** 15-20 hours

**Critical Path (to make app fully functional):** 4-5 hours
