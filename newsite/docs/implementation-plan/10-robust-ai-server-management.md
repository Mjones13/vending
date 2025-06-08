# Implementation Plan: Robust AI Server Management

## Background/Motivation

The current AI server testing and management system has critical flaws causing:
- **Orphaned processes**: Background servers that don't shut down cleanly
- **Port conflicts**: Servers remain running on port 3001 after tests
- **Unreliable cleanup**: `pkill` commands that don't consistently work
- **Race conditions**: Tests that pass/fail inconsistently due to timing issues

The root cause is the problematic `npm run test:ai` command using background processes (`&`) with weak cleanup mechanisms.

## Key Challenges

1. **Process Lifecycle Management**: Background processes aren't properly tracked or terminated
2. **Port Management**: Need reliable port cleanup and conflict detection
3. **Test Reliability**: Current test command has race conditions and weak error handling
4. **Cross-Platform Compatibility**: Commands must work reliably on macOS, Linux, and Windows
5. **Signal Handling**: Ensure proper SIGTERM/SIGINT handling for clean shutdowns

## Technical Approach

### Solution Strategy
1. **Replace fragile shell commands** with robust Node.js scripts
2. **Implement proper process tracking** with PID files and signal handling
3. **Add port verification** before starting servers
4. **Create dedicated test utilities** for server lifecycle management
5. **Enhance cleanup procedures** with multiple fallback strategies

## High-Level Task Breakdown

### Phase 1: Create Robust Server Management Scripts ✅ **COMPLETE**
- [x] **Task 1.1**: Create `scripts/ai-server-manager.js` for centralized server control
- [x] **Task 1.2**: Implement port checking and cleanup utilities
- [x] **Task 1.3**: Add PID file tracking for process management
- [x] **Task 1.4**: Create graceful shutdown with timeout and force-kill fallbacks

### Phase 2: Replace Fragile Package.json Commands ✅ **COMPLETE**
- [x] **Task 2.1**: Replace `test:ai` with robust Node.js script call
- [x] **Task 2.2**: Update `start:ai` to use server manager for better lifecycle control
- [x] **Task 2.3**: Add `stop:ai` command for explicit server shutdown
- [x] **Task 2.4**: Create `status:ai` command to check server state

### Phase 3: Enhanced Testing and Validation
- [ ] **Task 3.1**: Create comprehensive AI server lifecycle tests
- [ ] **Task 3.2**: Test concurrent developer + AI server scenarios
- [ ] **Task 3.3**: Validate cleanup procedures work reliably
- [ ] **Task 3.4**: Test cross-platform compatibility (if applicable)

### Phase 4: Documentation and Integration
- [ ] **Task 4.1**: Update CLAUDE.md with new server management commands
- [ ] **Task 4.2**: Add troubleshooting guide for server management issues
- [ ] **Task 4.3**: Document best practices for AI server usage
- [ ] **Task 4.4**: Commit and push all improvements

## Detailed Technical Design

### Server Manager Script (`scripts/ai-server-manager.js`)
```javascript
// Core functionality:
// - checkPort(port) - verify port availability
// - startServer(options) - start with proper tracking
// - stopServer(pid) - graceful shutdown with fallbacks
// - getServerStatus() - check running state
// - cleanup() - emergency cleanup all AI processes
```

### Enhanced Package.json Commands
```json
{
  "test:ai": "node scripts/ai-server-manager.js test",
  "start:ai": "node scripts/ai-server-manager.js start",
  "stop:ai": "node scripts/ai-server-manager.js stop",
  "status:ai": "node scripts/ai-server-manager.js status",
  "cleanup:ai": "node scripts/ai-server-manager.js cleanup"
}
```

### Process Tracking Strategy
- **PID files**: Store server process IDs in `.next-ai/server.pid`
- **Health checks**: Regular port connectivity verification
- **Timeout handling**: 10-second graceful shutdown before force-kill
- **Multiple cleanup methods**: SIGTERM → SIGKILL → port-based process search

## Acceptance Criteria

### Reliability Requirements:
- [ ] Zero orphaned processes after test completion
- [ ] 100% reliable port cleanup
- [ ] No race conditions in server startup/shutdown
- [ ] Consistent behavior across multiple test runs

### Command Requirements:
- [ ] `npm run test:ai` - reliable server test with guaranteed cleanup
- [ ] `npm run start:ai` - tracked server start with PID management
- [ ] `npm run stop:ai` - explicit server shutdown command
- [ ] `npm run status:ai` - server state verification
- [ ] `npm run cleanup:ai` - emergency cleanup for stuck processes

### Error Handling Requirements:
- [ ] Clear error messages for port conflicts
- [ ] Automatic cleanup on script interruption (Ctrl+C)
- [ ] Fallback strategies when primary cleanup methods fail
- [ ] Detailed logging for troubleshooting

### Performance Requirements:
- [ ] Server startup within 5 seconds
- [ ] Graceful shutdown within 3 seconds
- [ ] Force-kill fallback within 10 seconds total
- [ ] Port availability check under 1 second

## Implementation Strategy

### Phase 1 Focus: Rock-Solid Foundation
- **Single responsibility**: One script handles all server lifecycle operations
- **Defensive programming**: Multiple fallback strategies for every operation
- **Comprehensive logging**: Track all operations for debugging
- **Signal handling**: Proper cleanup on script interruption

### Phase 2 Focus: Command Integration
- **Backward compatibility**: Maintain existing command interfaces where possible
- **Enhanced functionality**: Add new commands for better control
- **Clear naming**: Obvious command purposes and behaviors
- **Documentation**: Update all references immediately

### Error Prevention Strategy:
- **Pre-flight checks**: Verify port availability before starting
- **Process verification**: Confirm server actually started successfully
- **Health monitoring**: Continuous connectivity checks during tests
- **Cleanup verification**: Confirm processes actually terminated

## Project Status Board

### Current Status / Progress Tracking
**Phase**: Planning Complete - Ready for Implementation
**Last Updated**: 2025-06-08
**Branch**: ai-agent-separate-build-directories (will create new branch)

| Task | Status | Notes |
|------|--------|-------|
| Problem analysis | ✅ Complete | Identified root causes in current test:ai command |
| Implementation planning | ✅ Complete | Comprehensive plan for robust server management |
| Technical design | ✅ Complete | Server manager script architecture defined |
| Acceptance criteria | ✅ Complete | Clear requirements for reliability and functionality |

### Next Steps:
1. Create robust server management script
2. Replace fragile package.json commands
3. Test comprehensive server lifecycle scenarios
4. Update documentation with new management approach

### Critical Success Factors:
- **Zero tolerance for orphaned processes**
- **100% reliable cleanup procedures**
- **Comprehensive error handling and fallbacks**
- **Clear, actionable error messages**

---

**Status**: Ready for implementation - High priority fix for development workflow stability