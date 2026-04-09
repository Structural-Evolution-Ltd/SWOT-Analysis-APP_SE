DEFAULT_FRP_CRITERIA: list[dict] = [
    # Structural
    {"name": "Fatigue performance", "category": "Structural", "weight": 1.0, "direction": "higher_better"},
    {"name": "Buckling robustness", "category": "Structural", "weight": 1.0, "direction": "higher_better"},
    {"name": "Local joint efficiency", "category": "Structural", "weight": 1.0, "direction": "higher_better"},
    {"name": "Vibration comfort", "category": "Structural", "weight": 1.0, "direction": "higher_better"},
    {"name": "Redundancy / resilience", "category": "Structural", "weight": 1.0, "direction": "higher_better"},
    {"name": "Torsional stiffness", "category": "Structural", "weight": 1.0, "direction": "higher_better"},
    # Transport
    {"name": "Module length compatibility", "category": "Transport", "weight": 1.0, "direction": "higher_better"},
    {"name": "Abnormal load restrictions", "category": "Transport", "weight": 1.0, "direction": "lower_better"},
    {"name": "Escort requirements", "category": "Transport", "weight": 1.0, "direction": "lower_better"},
    {"name": "Delivery route flexibility", "category": "Transport", "weight": 1.0, "direction": "higher_better"},
    {"name": "Site offloading simplicity", "category": "Transport", "weight": 1.0, "direction": "higher_better"},
    # Installation
    {"name": "Need for temporary works", "category": "Installation", "weight": 1.0, "direction": "lower_better"},
    {"name": "Alignment tolerance sensitivity", "category": "Installation", "weight": 1.0, "direction": "lower_better"},
    {"name": "Joint assembly complexity", "category": "Installation", "weight": 1.0, "direction": "lower_better"},
    {"name": "Site labour intensity", "category": "Installation", "weight": 1.0, "direction": "lower_better"},
    {"name": "Weather sensitivity during installation", "category": "Installation", "weight": 1.0, "direction": "lower_better"},
    {"name": "Requirement for environmental control tents", "category": "Installation", "weight": 1.0, "direction": "lower_better"},
    {"name": "Site plant availability", "category": "Installation", "weight": 1.0, "direction": "higher_better"},
    # Durability / lifecycle
    {"name": "UV durability", "category": "Durability", "weight": 1.0, "direction": "higher_better"},
    {"name": "Water ingress risk", "category": "Durability", "weight": 1.0, "direction": "lower_better"},
    {"name": "Replaceability of modules", "category": "Durability", "weight": 1.0, "direction": "higher_better"},
    {"name": "Ease of inspection of joints", "category": "Durability", "weight": 1.0, "direction": "higher_better"},
    {"name": "Through-life maintenance burden", "category": "Durability", "weight": 1.0, "direction": "lower_better"},
    # Commercial
    {"name": "Supply chain confidence", "category": "Commercial", "weight": 1.0, "direction": "higher_better"},
    {"name": "Fabrication lead time", "category": "Commercial", "weight": 1.0, "direction": "lower_better"},
    {"name": "Installation programme certainty", "category": "Commercial", "weight": 1.0, "direction": "higher_better"},
    {"name": "Whole-life cost", "category": "Commercial", "weight": 1.0, "direction": "lower_better"},
    {"name": "Initial CAPEX certainty", "category": "Commercial", "weight": 1.0, "direction": "higher_better"},
    # Risk
    {"name": "Design maturity", "category": "Risk", "weight": 1.0, "direction": "higher_better"},
    {"name": "Approval / stakeholder risk", "category": "Risk", "weight": 1.0, "direction": "lower_better"},
    {"name": "Construction sequencing risk", "category": "Risk", "weight": 1.0, "direction": "lower_better"},
    {"name": "Tolerance accumulation risk", "category": "Risk", "weight": 1.0, "direction": "lower_better"},
    {"name": "Interface risk with substructure", "category": "Risk", "weight": 1.0, "direction": "lower_better"},
]
