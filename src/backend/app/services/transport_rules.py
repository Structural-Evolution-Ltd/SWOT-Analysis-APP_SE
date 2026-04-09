UK_DEFAULT_CONSTRAINTS = [
    {
        "name": "max_standard_vehicle_width",
        "value": 2.9,
        "unit": "m",
        "description": "Practical baseline above which wide/abnormal checks are triggered.",
    },
    {
        "name": "max_standard_vehicle_length",
        "value": 18.75,
        "unit": "m",
        "description": "Typical articulated vehicle length baseline.",
    },
    {
        "name": "escort_trigger_width",
        "value": 3.5,
        "unit": "m",
        "description": "Operational trigger where escort planning is commonly required.",
    },
    {
        "name": "notice_trigger_width",
        "value": 3.0,
        "unit": "m",
        "description": "Width threshold for additional route and authority notifications.",
    },
]


def get_default_constraints() -> list[dict]:
    return UK_DEFAULT_CONSTRAINTS
