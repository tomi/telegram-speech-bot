import * as path from "path";
import { tmpdir } from "os";
import { createWriteStream, createReadStream, ReadStream, mkdir } from "fs";
import { promisify } from "util";
import { v4 } from "uuid";
import { BingSpeechClient } from "bingspeech-api-client";
import ffmpeg from "fluent-ffmpeg";

const mkdirAsync = promisify(mkdir);

export const API_MAX_LEN = 800;
const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
if (!AZURE_KEY) {
  throw new Error("AZURE_KEY env variable must configured");
}

const client = new BingSpeechClient(AZURE_KEY);

/**
 * Converts given texts to a single mp3 audio file
 *
 * @param texts
 */
export async function getAudio(texts: string[]): Promise<ReadStream> {
  const targetDir = await _createTempDir();

  const audioFilePaths = await _createIndividualAudioFiles(targetDir, texts);

  const combinedFilename = await _combineAudioFiles(targetDir, audioFilePaths);

  return createReadStream(combinedFilename);
}

/**
 * Creates audio files from given texts
 *
 * @param targetDir Target directory where audio files are placed
 * @param texts Texts to turn into audio
 */
async function _createIndividualAudioFiles(
  targetDir: string,
  texts: string[]
): Promise<string[]> {
  const audioFilePaths = [];
  let orderNumber = 1;

  for (const text of texts) {
    const audioFile = await _getAudioForText(orderNumber++, targetDir, text);

    audioFilePaths.push(audioFile);
  }

  return audioFilePaths;
}

/**
 * Combines multiple audio files into single file
 *
 * @param targetDir target directory where output file is placed
 * @param audioFilePaths array of audio file paths that are combined into single file
 */
async function _combineAudioFiles(
  targetDir: string,
  audioFilePaths: string[]
): Promise<string> {
  if (audioFilePaths.length === 1) {
    return audioFilePaths[0];
  }

  let combineStream = ffmpeg();
  for (const filePath of audioFilePaths) {
    combineStream = combineStream.input(filePath);
  }

  return new Promise((resolve, reject) => {
    combineStream.on("error", error => {
      reject(error);
    });

    const outputFilename = path.join(targetDir, "out.mp3");
    combineStream.on("end", () => resolve(outputFilename));

    combineStream.mergeToFile(outputFilename);
  }) as Promise<string>;
}

async function _getAudioForText(
  orderNumber: number,
  targetDir: string,
  text: string
) {
  const filename = _getTempFileName(orderNumber, targetDir);

  const audioStream = await client.synthesizeStream(text, "fi-fi");
  const writeStream = createWriteStream(filename);
  audioStream.pipe(writeStream);

  return new Promise((resolve, reject) => {
    writeStream.on("close", () => {
      resolve(filename);
    });

    audioStream.on("response", resp => {
      if (resp.statusCode !== 200) {
        audioStream.unpipe(writeStream);

        const errorMsg = `Non 200 status response: ${resp.statusMessage}`;
        const error = new Error(errorMsg);

        console.error(errorMsg);
        writeStream.destroy(error);
        reject(error);
      }
    });

    audioStream.on("error", error => {
      writeStream.destroy(error);
      reject(error);
    });
  }) as Promise<string>;
}

async function _createTempDir() {
  const tempDirName = path.join(tmpdir(), v4());

  await mkdirAsync(tempDirName);

  return tempDirName;
}

function _getTempFileName(orderNumber: number, targetDir: string) {
  return path.join(targetDir, _pad(orderNumber, 5) + ".mp3");
}

function _pad(num, size) {
  let s = num + "";

  while (s.length < size) {
    s = "0" + s;
  }

  return s;
}
