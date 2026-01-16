{
  "name": "Release",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "VCD title"
    },
    "cover_art": {
      "type": "string",
      "description": "URL to the cover art image"
    },
    "back_art": {
      "type": "string",
      "description": "URL to the back cover image"
    },
    "disc_images": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "URLs to disc art images (up to 4)"
    },
    "additional_images": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Additional images URLs"
    },
    "number_of_discs": {
      "type": "number",
      "description": "Number of discs"
    },
    "year": {
      "type": "number",
      "description": "Year of release"
    },
    "audio_language": {
      "type": "string",
      "description": "Audio language"
    },
    "audio_language_2": {
      "type": "string",
      "description": "Second audio language"
    },
    "subtitle_language": {
      "type": "string",
      "description": "Subtitle language"
    },
    "subtitle_language_2": {
      "type": "string",
      "description": "Second subtitle language"
    },
    "subtitle_language_3": {
      "type": "string",
      "description": "Third subtitle language"
    },
    "country": {
      "type": "string",
      "description": "Country of release"
    },
    "publisher": {
      "type": "string",
      "description": "Publisher name"
    },
    "download_link": {
      "type": "string",
      "description": "Download link URL"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes"
    },
    "average_rating": {
      "type": "number",
      "description": "Average user rating"
    },
    "rating_count": {
      "type": "number",
      "description": "Number of ratings"
    }
  },
  "required": [
    "title"
  ],
  "rls": {
    "delete": {
      "user_condition": {
        "role": "admin"
      }
    }
  }
}