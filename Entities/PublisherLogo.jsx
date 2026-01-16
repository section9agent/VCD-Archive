{
  "name": "PublisherLogo",
  "type": "object",
  "properties": {
    "publisher_name": {
      "type": "string",
      "description": "Publisher name (case-insensitive match)"
    },
    "logo_url": {
      "type": "string",
      "description": "URL to the publisher logo image"
    }
  },
  "required": [
    "publisher_name",
    "logo_url"
  ]
}