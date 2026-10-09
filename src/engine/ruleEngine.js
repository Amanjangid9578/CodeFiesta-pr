// EXAMGUARD Natural Language Rule Builder Engine
// Parses natural language rules into structured, executable constraints

export const RULE_TYPES = {
  DEPARTMENT_SEPARATION: 'DEPARTMENT_SEPARATION',
  SUBJECT_SEPARATION: 'SUBJECT_SEPARATION',
  ACCESSIBILITY_GROUND_FLOOR: 'ACCESSIBILITY_GROUND_FLOOR',
  INVIGILATOR_NEUTRALITY: 'INVIGILATOR_NEUTRALITY',
  MINIMUM_SEAT_SPACING: 'MINIMUM_SEAT_SPACING',
  MAX_INVIGILATOR_DUTIES: 'MAX_INVIGILATOR_DUTIES',
};

/**
 * Parses freeform natural language text into a structured operational constraint rule
 */
export function parseNaturalLanguageRule(text) {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Pattern 1: Department Separation
  // e.g. "CSE and ECE students should not sit next to each other"
  const deptRegex = /(cse|ece|me|ce|it)\s*(?:and|&|,)\s*(cse|ece|me|ce|it)\s*(?:students)?\s*(?:should not|must not|cannot|never)\s*(?:sit next to|be adjacent|sit together)/i;
  const deptMatch = clean.match(deptRegex);
  if (deptMatch) {
    const deptA = deptMatch[1].toUpperCase();
    const deptB = deptMatch[2].toUpperCase();
    return {
      success: true,
      rule: {
        id: `RULE-${Date.now()}`,
        name: `${deptA} & ${deptB} Separation`,
        type: RULE_TYPES.DEPARTMENT_SEPARATION,
        departmentA: deptA,
        departmentB: deptB,
        minDistance: 1,
        priority: 'HIGH',
        rawText: clean,
        active: true,
        explanation: `Enforces that candidates enrolled in ${deptA} and ${deptB} departments maintain a minimum orthogonal buffer of 1 seat.`,
      }
    };
  }

  // Pattern 2: Subject / Same Paper Anti-Cheating
  // e.g. "Students appearing for the same paper must not sit adjacent"
  if (lower.includes('same paper') || lower.includes('same subject') || lower.includes('identical paper')) {
    return {
      success: true,
      rule: {
        id: `RULE-${Date.now()}`,
        name: 'Anti-Cheating Paper Dispersion',
        type: RULE_TYPES.SUBJECT_SEPARATION,
        minDistance: 1,
        priority: 'HIGH',
        rawText: clean,
        active: true,
        explanation: 'Forbids candidates appearing for identical examination papers from occupying adjacent seats in the same row.',
      }
    };
  }

  // Pattern 3: Accessibility Ground Floor Strictness
  // e.g. "Wheelchair students must be assigned ground floor"
  if (lower.includes('wheelchair') || lower.includes('mobility') || lower.includes('ground floor')) {
    return {
      success: true,
      rule: {
        id: `RULE-${Date.now()}`,
        name: 'Ground Floor Accessibility Strictness',
        type: RULE_TYPES.ACCESSIBILITY_GROUND_FLOOR,
        priority: 'CRITICAL',
        rawText: clean,
        active: true,
        explanation: 'Enforces hard verification that examinees with wheelchair or mobility impairment are strictly routed to ground floor halls.',
      }
    };
  }

  // Pattern 4: Invigilator Department Neutrality
  // e.g. "CSE invigilators should not supervise CSE exams"
  if (lower.includes('invigilator') && (lower.includes('neutral') || lower.includes('own department') || lower.includes('home department'))) {
    return {
      success: true,
      rule: {
        id: `RULE-${Date.now()}`,
        name: 'Invigilator Department Neutrality',
        type: RULE_TYPES.INVIGILATOR_NEUTRALITY,
        priority: 'MEDIUM',
        rawText: clean,
        active: true,
        explanation: 'Soft constraint prioritizing that professors do not proctor examination papers from their own native academic department.',
      }
    };
  }

  // Pattern 5: Seat Spacing / Buffer
  // e.g. "Keep 1 empty seat between students"
  const spacingMatch = lower.match(/(?:keep|leave|maintain)\s*(\d+)\s*(?:empty seat|blank seat|seat spacing)/i);
  if (spacingMatch || lower.includes('checkerboard')) {
    const spacing = spacingMatch ? parseInt(spacingMatch[1], 10) : 1;
    return {
      success: true,
      rule: {
        id: `RULE-${Date.now()}`,
        name: `Buffer Spacing (${spacing} Seat)`,
        type: RULE_TYPES.MINIMUM_SEAT_SPACING,
        minDistance: spacing,
        priority: 'HIGH',
        rawText: clean,
        active: true,
        explanation: `Mandates minimum physical gap of ${spacing} empty seat(s) between examinees across hall matrices.`,
      }
    };
  }

  // Fallback: Generic heuristic rule
  return {
    success: true,
    rule: {
      id: `RULE-${Date.now()}`,
      name: 'Custom Examination Policy',
      type: 'CUSTOM_HEURISTIC',
      priority: 'MEDIUM',
      rawText: clean,
      active: true,
      explanation: `Parsed operational guideline: "${clean}" applied to master scheduling constraint validator.`,
    }
  };
}
