# Merge Conflict Analysis: ai-agent-separate-build-directories → main

**Date**: 2025-06-08
**Branch**: ai-agent-separate-build-directories
**Merging**: origin/main into ai-agent-separate-build-directories

## Overview
This branch implements separate build directories (`.next-ai`) to prevent build corruption when AI agents and developers run simultaneously. When merging with main, we have conflicts due to main's newer robust server management implementation.

## Merge Conflict Summary

### Files with Conflicts:
1. **package.json** - Command definitions conflict
2. **.gitignore** - Minor formatting conflict

### Files that Merged Automatically:
1. **CLAUDE.md** - Both branches added content, auto-merged
2. **New files from main**:
   - docs/implementation-plan/10-robust-ai-server-management.md
   - scripts/ai-server-manager.js
   - scripts/test-ai-server-lifecycle.js
   - scripts/test-ai-cleanup-validation.js

### Unique Files in This Branch (ai-agent-separate-build-directories):
1. **Next.js Configurations**:
   - next.config.ai.js - Main AI configuration with distDir: '.next-ai'
   - next.config.ai-env.js - Environment-based configuration (experimental)

2. **Build Scripts** (multiple iterations):
   - scripts/build-ai.js - Initial version
   - scripts/build-ai-v2.js - Second iteration
   - scripts/build-ai-isolated.js - Isolation attempt
   - scripts/build-ai-env.js - Environment variable approach
   - scripts/build-ai-simple.js - Final working version (config swap)

3. **Start Script**:
   - scripts/start-ai.js - Serves from .next-ai directory on port 3001

4. **Implementation Plan**:
   - docs/implementation-plan/9-ai-agent-separate-build-directories.md

## Detailed Conflict Analysis

### 1. package.json Conflict
**Location**: Lines 45-60

**This branch (ai-agent-separate-build-directories) has:**
```json
"build:ai": "node scripts/build-ai-simple.js",
"start:ai": "node scripts/start-ai.js",
"test:ai": "npm run dev:ai & sleep 5 && curl -s http://localhost:3001 > /dev/null && echo 'AI server test passed' && pkill -f 'next dev.*3001'",
"test:ai:full": "npm run dev:ai & sleep 5 && npm run lint && npm run type-check && pkill -f 'next dev.*3001'",
"clean:ai": "rm -rf .next-ai",
"clean:all": "rm -rf .next .next-ai node_modules/.cache"
```

**Main branch has:**
```json
"start:ai": "node scripts/ai-server-manager.js start",
"stop:ai": "node scripts/ai-server-manager.js stop",
"status:ai": "node scripts/ai-server-manager.js status",
"test:ai": "node scripts/ai-server-manager.js test",
"cleanup:ai": "node scripts/ai-server-manager.js cleanup",
"test:ai:lifecycle": "node scripts/test-ai-server-lifecycle.js",
"test:ai:cleanup": "node scripts/test-ai-cleanup-validation.js"
```

**Resolution Strategy**:
- Keep build isolation commands from this branch (`build:ai`, `clean:ai`, `clean:all`)
- Replace problematic test commands with robust server manager versions from main
- Merge both sets of commands to get complete functionality

### 2. .gitignore Conflict
**Location**: Lines 21-25

**This branch has:**
```
/.next-ai/
```

**Main branch has:**
```
/.next-ai/
/.next-temp/
```

**Resolution Strategy**:
- Keep both entries (`.next-ai/` and `.next-temp/`)
- Simple additive merge

## Integration Plan

### Phase 1: Resolve Basic Conflicts
1. **package.json**:
   - Keep all build isolation commands from this branch
   - Keep all server management commands from main
   - Update `start:ai` to use new server manager but preserve build directory logic
   - Remove old problematic test commands with `&` and `pkill`

2. **.gitignore**:
   - Include both `.next-ai/` and `.next-temp/`

### Phase 2: Integration of Features
1. **Update build scripts to work with server manager**:
   - `scripts/build-ai-simple.js` - Already handles `.next-ai` directory
   - `scripts/start-ai.js` - May need updating to work with server manager

2. **Verify script compatibility**:
   - Ensure `ai-server-manager.js` can work with separate build directories
   - Test that PID file goes to `.next-ai/server.pid` (already configured)

### Phase 3: Command Reconciliation

**Proposed final command set**:
```json
"dev:ai": "next dev --turbopack --port 3001",
"build:ai": "node scripts/build-ai-simple.js",
"start:ai": "node scripts/ai-server-manager.js start",
"stop:ai": "node scripts/ai-server-manager.js stop", 
"status:ai": "node scripts/ai-server-manager.js status",
"test:ai": "node scripts/ai-server-manager.js test",
"cleanup:ai": "node scripts/ai-server-manager.js cleanup",
"clean:ai": "rm -rf .next-ai",
"clean:all": "rm -rf .next .next-ai node_modules/.cache",
"test:ai:lifecycle": "node scripts/test-ai-server-lifecycle.js",
"test:ai:cleanup": "node scripts/test-ai-cleanup-validation.js"
```

### Phase 4: Testing Requirements
After merge resolution:
1. Test build isolation still works
2. Test server management with build isolation
3. Verify no interference between `.next` and `.next-ai`
4. Ensure cleanup commands handle both server processes and build artifacts

## Key Decisions Needed

1. **start:ai command**: Should we:
   - Option A: Use `ai-server-manager.js` directly (current main approach)
   - Option B: Update `start-ai.js` to use server manager internally
   - **Recommendation**: Option A for consistency

2. **Build process**: The `build-ai-simple.js` script:
   - Currently swaps config files temporarily
   - Should continue to work independently of server manager
   - No changes needed

3. **Documentation**: CLAUDE.md will need:
   - Verification that merged content is coherent
   - Possible consolidation of duplicate sections
   - Clear explanation of build isolation + server management

## Risk Assessment

**Low Risk**:
- .gitignore merge (simple addition)
- Build scripts (remain independent)

**Medium Risk**:
- package.json command integration (needs careful testing)
- CLAUDE.md auto-merge (may have redundant sections)

**Mitigation**:
- Test each command individually after merge
- Review CLAUDE.md for duplicate/conflicting information
- Run full test suite to verify integration

## Next Steps

1. Abort current merge: `git merge --abort`
2. Create a clean working branch for integration
3. Manually resolve conflicts following this plan
4. Test thoroughly before merging to main
5. Update documentation to reflect combined functionality

---

**Status**: Analysis complete, ready for manual merge resolution

## Current State
- Branch is currently in a merge conflict state
- Run `git merge --abort` to reset before starting resolution
- Or manually resolve conflicts and commit to proceed

## Important Notes
1. The `build-ai-simple.js` is the final working version after several iterations
2. The server manager from main is more robust than the simple start script
3. Both solutions complement each other - build isolation + process management
4. Care needed to preserve both functionalities during merge