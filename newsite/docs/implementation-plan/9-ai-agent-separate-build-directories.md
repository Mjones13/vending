# Implementation Plan: AI Agent Separate Build Directories

## Background/Motivation

Following the successful port separation implementation, a new issue was discovered: when AI agents run build commands while the developer's dev server is running, it corrupts the shared `.next` build directory. This causes `ENOENT` errors and breaks the developer's active session.

The root cause is that both developer and AI agent commands write to the same `.next` directory, causing file conflicts and corruption when both run simultaneously.

## Key Challenges

1. **Shared Build Artifacts**: Both dev and build commands use the same `.next` directory
2. **File System Conflicts**: Build process overwrites/deletes files the dev server is actively using
3. **Next.js Configuration**: Need to configure Next.js to use different build directories
4. **Environment Isolation**: Ensure complete separation of build artifacts
5. **Backwards Compatibility**: Maintain existing developer workflow unchanged

## Technical Approach

### Solution Strategy
1. **Configure Next.js** to use `.next-ai` directory for AI agent builds
2. **Update AI Commands** to use the custom build directory
3. **Add Cleanup Commands** for managing separate build directories
4. **Test Isolation** to ensure no interference between environments
5. **Update Documentation** with new build isolation guidelines

### Implementation Details
- Create `next.config.ai.js` with custom `distDir` configuration
- Update AI agent commands to use the AI-specific config
- Ensure `.next-ai` is added to `.gitignore`
- Implement cleanup utilities for both directories
- Test concurrent builds and dev servers

## High-Level Task Breakdown

### Phase 1: Next.js Configuration Setup ✅ **COMPLETE**
- [x] **Task 1.1**: Create `next.config.ai.js` with `.next-ai` as build directory
- [x] **Task 1.2**: Update `.gitignore` to exclude `.next-ai` directory
- [x] **Task 1.3**: Test configuration with manual build commands
- [x] **Task 1.4**: Verify build artifacts are correctly separated

### Phase 2: Package.json AI Commands Update ✅ **COMPLETE**
- [x] **Task 2.1**: Re-add AI agent commands with custom config
- [x] **Task 2.2**: Update `dev:ai` to use AI config (if needed)
- [x] **Task 2.3**: Update `build:ai` to use `next.config.ai.js`
- [x] **Task 2.4**: Update `start:ai` to serve from `.next-ai`
- [x] **Task 2.5**: Add cleanup commands for both build directories

### Phase 3: Testing and Validation
- [ ] **Task 3.1**: Test developer workflow remains unchanged
- [ ] **Task 3.2**: Test AI build creates artifacts in `.next-ai`
- [ ] **Task 3.3**: Test concurrent dev + AI build (no interference)
- [ ] **Task 3.4**: Test production start commands work correctly
- [ ] **Task 3.5**: Verify no cross-contamination of build artifacts

### Phase 4: Documentation and Cleanup
- [ ] **Task 4.1**: Update CLAUDE.md with build isolation details
- [ ] **Task 4.2**: Add troubleshooting guide for build issues
- [ ] **Task 4.3**: Document cleanup procedures
- [ ] **Task 4.4**: Commit and push all changes

## Acceptance Criteria

### Build Isolation Requirements:
- [ ] Developer builds use `.next` directory (unchanged)
- [ ] AI agent builds use `.next-ai` directory (completely separate)
- [ ] No file conflicts when both run simultaneously
- [ ] Both environments can build and run independently

### Command Requirements:
- [ ] `npm run build` continues to work as before
- [ ] `npm run build:ai` uses separate build directory
- [ ] `npm run start:ai` serves from AI build directory
- [ ] Cleanup commands available for both directories

### Functionality Requirements:
- [ ] Zero interference between developer and AI workflows
- [ ] Build artifacts completely isolated
- [ ] No performance degradation
- [ ] Clear error messages if configuration issues occur

### Documentation Requirements:
- [ ] CLAUDE.md updated with build isolation explanation
- [ ] Clear instructions for AI agents
- [ ] Troubleshooting guide for common issues
- [ ] Cleanup procedures documented

## Implementation Strategy

### Configuration Approach:
1. **Extend existing config**: Import base config and override `distDir`
2. **Environment detection**: Use environment variables if needed
3. **Minimal changes**: Keep developer workflow exactly the same
4. **Clear separation**: Obvious directory naming (`.next` vs `.next-ai`)

### Command Design:
```bash
# Developer (unchanged)
npm run build         # Uses .next/
npm run dev          # Uses .next/
npm run start        # Serves from .next/

# AI Agent (with isolation)
npm run build:ai     # Uses .next-ai/
npm run dev:ai       # Uses port 3001 (may use .next-ai/)
npm run start:ai     # Serves from .next-ai/ on port 3001
```

### Error Prevention:
- Add pre-build checks to warn about active servers
- Include cleanup in error scenarios
- Provide clear error messages for configuration issues

## Project Status Board

### Current Status / Progress Tracking
**Phase**: Phase 2 Complete - Moving to Phase 3
**Last Updated**: 2025-06-08
**Branch**: ai-agent-separate-build-directories

| Task | Status | Notes |
|------|--------|-------|
| Implementation plan creation | ✅ Complete | Comprehensive plan for build isolation |
| Branch creation | ✅ Complete | Working on ai-agent-separate-build-directories |
| Phase 1: Next.js Configuration | ✅ Complete | AI config created, .gitignore updated, build script working |
| Phase 2: Package.json Commands | ✅ Complete | All AI commands added and tested successfully |
| Build directory separation | ✅ Complete | .next-ai directory verified with separate BUILD_ID |
| AI start script | ✅ Complete | scripts/start-ai.js serves from .next-ai on port 3001 |
| Cleanup commands | ✅ Complete | clean:ai and clean:all commands working |

### Next Steps:
1. Create Next.js AI configuration file
2. Implement and test build isolation
3. Update package.json with enhanced AI commands
4. Document the new build isolation system

### Executor's Feedback or Assistance Requests
- Ready to implement build directory separation
- Will ensure zero impact on existing developer workflow
- Focus on complete isolation of build artifacts

---

**Status**: Ready for implementation