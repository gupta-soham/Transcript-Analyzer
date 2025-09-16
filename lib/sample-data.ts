/**
 * Sample transcript data for testing the transcript analyzer
 */
export const SAMPLE_TRANSCRIPT_CONTENT = `- 00:00:15 introduction Welcome everyone to today's product planning meeting. I'm Sarah, the product manager, and we'll be discussing our Q2 roadmap priorities.

- 00:01:30 agenda Today we'll cover three main areas: user feedback analysis, feature prioritization, and resource allocation for the upcoming quarter.

- 00:02:45 user-feedback Let me start with the user feedback we've collected. We received over 500 responses to our recent survey, and the results are quite interesting.

- 00:03:20 user-feedback The top requested feature is dark mode support, mentioned by 78% of respondents. This is significantly higher than we anticipated.

- 00:04:10 user-feedback Second most requested is improved mobile performance, particularly on older devices. About 65% of users reported slow loading times.

- 00:05:00 technical-discussion From a technical perspective, implementing dark mode shouldn't be too complex. We already have the design system in place.

- 00:05:45 technical-discussion However, the mobile performance issue is more challenging. We'll need to optimize our bundle size and implement lazy loading.

- 00:06:30 concerns I'm a bit concerned about the timeline. Dark mode could take 2-3 weeks, but mobile optimization might need 6-8 weeks of development time.

- 00:07:15 prioritization Given our Q2 deadline, I suggest we prioritize dark mode first since it has higher user demand and lower implementation complexity.

- 00:08:00 agreement That makes sense. The engineering team agrees that dark mode is more feasible within our current sprint capacity.

- 00:08:45 resource-planning For resources, we'll need two frontend developers for dark mode and potentially three developers plus a performance specialist for mobile optimization.

- 00:09:30 timeline So our proposed timeline is: dark mode in Sprint 1-2, mobile performance optimization in Sprint 3-4, assuming we can secure the additional resources.

- 00:10:15 stakeholder-input The design team has already prepared dark mode mockups, so we're ready to start implementation as soon as this meeting concludes.

- 00:11:00 concerns One concern from the QA team: we'll need comprehensive testing across different devices and browsers for both features.

- 00:11:45 testing-strategy We should plan for at least one week of testing for dark mode and two weeks for mobile performance, given the complexity.

- 00:12:30 budget-discussion From a budget perspective, the additional performance specialist will cost approximately $15,000 for the two-month engagement.

- 00:13:15 approval The budget looks reasonable given the potential impact on user satisfaction. I approve moving forward with this plan.

- 00:14:00 action-items Let me summarize our action items: Sarah will create detailed tickets, the design team will finalize dark mode assets, and engineering will start sprint planning.

- 00:14:45 next-steps Our next check-in will be in two weeks to review dark mode progress and confirm the mobile optimization timeline.

- 00:15:30 conclusion Thank you everyone for a productive meeting. I'm excited to see these improvements come to life and address our users' top concerns.`;

/**
 * Creates a File object from the sample transcript content
 * This simulates a user uploading a .txt file
 */
export function createSampleTranscriptFile(): File {
    const blob = new Blob([SAMPLE_TRANSCRIPT_CONTENT], { type: 'text/plain' });
    return new File([blob], 'sample-transcript.txt', { type: 'text/plain' });
}

/**
 * Gets the sample transcript content as a string
 */
export function getSampleTranscriptContent(): string {
    return SAMPLE_TRANSCRIPT_CONTENT;
}