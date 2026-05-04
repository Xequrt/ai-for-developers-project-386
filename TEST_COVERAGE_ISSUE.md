## Test Coverage Issue - Priority List

### Analysis Summary

Analyzed codebase and test files, prioritized by:
1. **Dependents** - how many modules rely on this code
2. **Complexity** - line count and logic complexity  
3. **Exposure** - untested entry points

---

## Priority List (Highest to Lowest)

### P0 — Critical (No Direct Tests)

| Module | Dependents | Lines | Test Coverage |
|--------|-----------|-------|--------------|
| **database.py** | ALL routers, auth, main | 146 | NONE (integration only) |
| **auth.py** | owner router, auth router | 124 | Indirect only |

### P1 — High Priority

| Module | Dependents | Lines | Test Coverage |
|--------|-----------|-------|--------------|
| **slots.py** | public router | 81 | Indirect |
| **config.py** | database, auth | 51 | Minimal |

### P2 — Medium Priority

| Module | Dependents | Lines | Test Coverage |
|--------|-----------|-------|--------------|
| **models.py** | All routers | 127 | Indirect |

### P3 — Adequately Covered

| Module | Test Files |
|--------|-----------|
| `routers/auth.py` | test_auth_bugfix.py, test_auth_improvements.py |
| `routers/public.py` | test_guest.py |
| `routers/owner.py` | test_owner.py, test_occupancy.py |

---

## Recommended Tests to Add

### 1. database.py (NEW: test_database.py)
- test init_db() creates seed data
- test reset_db() clears/reinitializes
- test new_id() generates unique UUIDs
- test now_iso() returns valid ISO format
- test ORM model integrity

### 2. auth.py (NEW: test_auth_utils.py)
- test hash/verify_password roundtrip
- test create_access_token JWT generation
- test decode_token validation
- test cookie set/clear functions
- test get_current_user edge cases (invalid/expired tokens)

### 3. slots.py (NEW or extend test_guest.py)
- test generate_slots on disabled weekday
- test timezone handling edge cases
- test get_booked_intervals filtering

### 4. config.py (NEW: test_config.py)
- test default development values
- test env variable override
- test effective_jwt_secret production error

---

## Files to Create

```
backend/tests/
  ├── test_database.py   (~80 lines)
  ├── test_auth_utils.py (~60 lines)
  ├── test_slots.py      (~30 lines)
  └── test_config.py     (~30 lines)
```