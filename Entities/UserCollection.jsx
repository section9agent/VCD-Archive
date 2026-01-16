{
  "name": "UserCollection",
  "type": "object",
  "properties": {
    "release_id": {
      "type": "string",
      "description": "Reference to the release"
    },
    "status": {
      "type": "string",
      "enum": [
        "have",
        "want"
      ],
      "description": "Whether user has or wants this release"
    },
    "user_rating": {
      "type": "number",
      "description": "User's personal rating (1-5)"
    },
    "notes": {
      "type": "string",
      "description": "Personal notes about this copy"
    },
    "condition": {
      "type": "string",
      "enum": [
        "Mint",
        "Near Mint",
        "Very Good Plus",
        "Very Good",
        "Good Plus",
        "Good",
        "Fair",
        "Poor"
      ],
      "description": "Physical condition"
    }
  },
  "required": [
    "release_id",
    "status"
  ],
  "rls": {
    "create": {
      "created_by": "{{user.email}}"
    },
    "read": {
      "created_by": "{{user.email}}"
    },
    "update": {
      "created_by": "{{user.email}}"
    },
    "delete": {
      "created_by": "{{user.email}}"
    }
  }
}