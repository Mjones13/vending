# Scratchpad: Smarter Vending Replica Website

## References to Implementation Plans
- [docs/implementation-plan/replicate-smarter-vending.md](implementation-plan/replicate-smarter-vending.md)

## Lessons Learned
- [2024-12-23] When updating content with exact text from reference sites, always escape apostrophes and quotes using HTML entities (&apos;, &ldquo;, &rdquo;) to avoid ESLint errors in React/Next.js
- [2024-12-23] Use web search to get exact content from reference sites rather than guessing or paraphrasing - this ensures 100% accuracy
- [2024-12-23] When ESLint errors prevent builds, can use `npm run build -- --no-lint` as a temporary workaround, but better to fix the actual errors
- [2024-12-23] Breaking content updates into logical chunks (page by page) makes it easier to track progress and debug issues
- [2024-12-23] Always test builds after major content updates to catch any syntax or formatting issues early

## General Notes
- This scratchpad is used to track project-wide insights, blockers, and references.
- All main pages now contain exact content from smartervendinginc.com
- Application builds successfully and is ready for final review and deployment 