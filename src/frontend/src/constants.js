export const DEFAULT_THRESHOLDS = { S: 6, W: 6, O: 6, T: 6 }

export const INITIAL_CATEGORY_WEIGHTS = { S: 0.3, W: 0.2, O: 0.3, T: 0.2 }

export const PROJECT_STORAGE_KEY = 'swot_mcda_project_state_v1'

export const SWOT_OPTIONS = ['S', 'W', 'O', 'T']

export const SWOT_HEADINGS = {
  S: 'Strengths',
  W: 'Weaknesses',
  O: 'Opportunities',
  T: 'Threats',
}

export const SCORING_MODE = {
  SIMPLE: 'simple',
  ADVANCED: 'advanced',
}

export const STEP_ROUTES = [
  { path: '/brief', label: '1 Brief' },
  { path: '/criteria', label: '2 Criteria' },
  { path: '/library', label: '3 Library' },
  { path: '/constraints', label: '4 Constraints' },
  { path: '/weights', label: '5 Weights' },
  { path: '/scoring', label: '6 Scoring' },
  { path: '/run', label: '7 Run' },
]

export const ADDITIONAL_CRITERIA = [
  // Structural
  { id: 200001, title: 'Fatigue performance', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200002, title: 'Buckling robustness', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200003, title: 'Local joint efficiency', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200004, title: 'Vibration comfort', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200005, title: 'Redundancy / resilience', group: 'Structural', category: 'S', default_weight: 1.0 },
  { id: 200006, title: 'Torsional stiffness', group: 'Structural', category: 'S', default_weight: 1.0 },
  // Transport
  { id: 200007, title: 'Module length compatibility', group: 'Transport', category: 'O', default_weight: 1.0 },
  { id: 200008, title: 'Abnormal load restrictions', group: 'Transport', category: 'T', default_weight: 1.0 },
  { id: 200009, title: 'Escort requirements', group: 'Transport', category: 'T', default_weight: 1.0 },
  { id: 200010, title: 'Delivery route flexibility', group: 'Transport', category: 'O', default_weight: 1.0 },
  { id: 200011, title: 'Site offloading simplicity', group: 'Transport', category: 'S', default_weight: 1.0 },
  // Installation
  { id: 200012, title: 'Need for temporary works', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200013, title: 'Alignment tolerance sensitivity', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200014, title: 'Joint assembly complexity', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200015, title: 'Site labour intensity', group: 'Installation', category: 'W', default_weight: 1.0 },
  { id: 200016, title: 'Weather sensitivity during installation', group: 'Installation', category: 'T', default_weight: 1.0 },
  { id: 200017, title: 'Requirement for environmental control tents', group: 'Installation', category: 'T', default_weight: 1.0 },
  { id: 200018, title: 'Site plant availability', group: 'Installation', category: 'O', default_weight: 1.0 },
  // Durability / lifecycle
  { id: 200019, title: 'UV durability', group: 'Durability / lifecycle', category: 'S', default_weight: 1.0 },
  { id: 200020, title: 'Water ingress risk', group: 'Durability / lifecycle', category: 'W', default_weight: 1.0 },
  { id: 200021, title: 'Replaceability of modules', group: 'Durability / lifecycle', category: 'O', default_weight: 1.0 },
  { id: 200022, title: 'Ease of inspection of joints', group: 'Durability / lifecycle', category: 'S', default_weight: 1.0 },
  { id: 200023, title: 'Through-life maintenance burden', group: 'Durability / lifecycle', category: 'W', default_weight: 1.0 },
  // Commercial
  { id: 200024, title: 'Supply chain confidence', group: 'Commercial', category: 'O', default_weight: 1.0 },
  { id: 200025, title: 'Fabrication lead time', group: 'Commercial', category: 'W', default_weight: 1.0 },
  { id: 200026, title: 'Installation programme certainty', group: 'Commercial', category: 'O', default_weight: 1.0 },
  { id: 200027, title: 'Whole-life cost', group: 'Commercial', category: 'W', default_weight: 1.0 },
  { id: 200028, title: 'Initial CAPEX certainty', group: 'Commercial', category: 'O', default_weight: 1.0 },
  // Risk
  { id: 200029, title: 'Design maturity', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200030, title: 'Approval / stakeholder risk', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200031, title: 'Construction sequencing risk', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200032, title: 'Tolerance accumulation risk', group: 'Risk', category: 'T', default_weight: 1.0 },
  { id: 200033, title: 'Interface risk with substructure', group: 'Risk', category: 'T', default_weight: 1.0 },
  // Template-derived base criteria
  { id: 210001, title: 'Global deflection', group: 'Structural Performance', category: 'S', default_weight: 5.0 },
  { id: 210002, title: 'Dynamic response / vibration', group: 'Structural Performance', category: 'S', default_weight: 3.0 },
  { id: 210003, title: 'Buckling resistance', group: 'Structural Performance', category: 'S', default_weight: 2.0 },
  { id: 210004, title: 'Long-term creep', group: 'Structural Performance', category: 'W', default_weight: 3.0 },
  { id: 210005, title: 'Structural simplicity', group: 'Structural Performance', category: 'O', default_weight: 3.0 },
  { id: 210006, title: 'Future strengthening potential', group: 'Structural Performance', category: 'O', default_weight: 2.0 },
  { id: 210007, title: 'Manufacturing complexity', group: 'Fabrication', category: 'W', default_weight: 4.0 },
  { id: 210008, title: 'Tooling complexity', group: 'Fabrication', category: 'W', default_weight: 3.0 },
  { id: 210009, title: 'Material efficiency', group: 'Fabrication', category: 'O', default_weight: 2.0 },
  { id: 210010, title: 'Quality control risk', group: 'Fabrication', category: 'T', default_weight: 2.0 },
  { id: 210011, title: 'Manufacturing repeatability', group: 'Fabrication', category: 'S', default_weight: 2.0 },
  { id: 210012, title: 'Tolerance control', group: 'Fabrication', category: 'W', default_weight: 2.0 },
  { id: 210013, title: 'Module length vs road transport', group: 'Transport & Logistics', category: 'W', default_weight: 4.0 },
  { id: 210014, title: 'Module width vs abnormal load', group: 'Transport & Logistics', category: 'T', default_weight: 3.0 },
  { id: 210015, title: 'Module weight', group: 'Transport & Logistics', category: 'W', default_weight: 3.0 },
  { id: 210016, title: 'Transport complexity', group: 'Transport & Logistics', category: 'T', default_weight: 3.0 },
  { id: 210017, title: 'Lift complexity', group: 'Transport & Logistics', category: 'W', default_weight: 3.0 },
  { id: 210018, title: 'Handling damage risk', group: 'Transport & Logistics', category: 'T', default_weight: 2.0 },
  { id: 210019, title: 'Installation duration', group: 'Construction', category: 'O', default_weight: 3.0 },
  { id: 210020, title: 'Site assembly complexity', group: 'Construction', category: 'W', default_weight: 3.0 },
  { id: 210021, title: 'Requirement for site bonding', group: 'Construction', category: 'W', default_weight: 2.0 },
  { id: 210022, title: 'Tolerance fit-up risk', group: 'Construction', category: 'T', default_weight: 2.0 },
  { id: 210023, title: 'Crane requirements', group: 'Construction', category: 'W', default_weight: 3.0 },
  { id: 210024, title: 'Temporary supports', group: 'Construction', category: 'W', default_weight: 2.0 },
  { id: 210025, title: 'Foundation loads', group: 'Substructure Interaction', category: 'S', default_weight: 3.0 },
  { id: 210026, title: 'Number of piers', group: 'Substructure Interaction', category: 'W', default_weight: 3.0 },
  { id: 210027, title: 'Substructure complexity', group: 'Substructure Interaction', category: 'W', default_weight: 2.0 },
  { id: 210028, title: 'Hydraulic flow impact', group: 'Substructure Interaction', category: 'T', default_weight: 2.0 },
  { id: 210029, title: 'Corrosion resistance', group: 'Durability', category: 'S', default_weight: 2.0 },
  { id: 210030, title: 'Joint durability', group: 'Durability', category: 'W', default_weight: 3.0 },
  { id: 210031, title: 'Replaceable components', group: 'Durability', category: 'O', default_weight: 1.0 },
  { id: 210032, title: 'Inspection accessibility', group: 'Durability', category: 'O', default_weight: 1.0 },
  { id: 210033, title: 'Maintenance frequency', group: 'Durability', category: 'W', default_weight: 1.0 },
  { id: 210034, title: 'Fabrication cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210035, title: 'Transport cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210036, title: 'Installation cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210037, title: 'Substructure cost', group: 'Cost', category: 'W', default_weight: 1.0 },
  { id: 210038, title: 'Manufacturing lead time', group: 'Programme Risk', category: 'T', default_weight: 1.0 },
  { id: 210039, title: 'Supply chain risk', group: 'Programme Risk', category: 'T', default_weight: 1.0 },
  { id: 210040, title: 'Embodied carbon', group: 'Environmental', category: 'O', default_weight: 1.0 },
  { id: 210041, title: 'Floodplain disturbance', group: 'Environmental', category: 'T', default_weight: 1.0 },
  { id: 210042, title: 'Flood obstruction risk', group: 'Project Specific', category: 'T', default_weight: 3.0 },
  { id: 210043, title: 'Ramp curvature compatibility', group: 'Project Specific', category: 'W', default_weight: 2.0 },
]
