# Telegram speech bot

Turn telegram message history into an audio file for listening

## Technical details

* Uses Azure speech API for text-to-speech
* ffmpeg to combine individual mp3 files to a single file

## Development

Requires `ffmpeg`. Install using `homebrew` for example.

Also requires patching of `bingspeech-api-client`. `yarn patch-package`
