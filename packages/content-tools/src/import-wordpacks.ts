import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

type WordItem = {
  word: string;
  phonetic: string;
  meaning_zh: string;
  meaning_en: string;
  part_of_speech: string;
  example_sentence: string;
  example_sentence_zh: string;
  image_url: string;
  audio_url: string;
  difficulty_level: number;
  theme_category: string;
  age_min: number;
  age_max: number;
};

async function run() {
  const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../");
  const packs = [
    {
      slug: "age10-core-v1",
      path: resolve(rootDir, "content/wordpacks/age10/base.json"),
      ageTrack: "AGE_10" as const
    },
    {
      slug: "age13-core-v1",
      path: resolve(rootDir, "content/wordpacks/age13/base.json"),
      ageTrack: "AGE_13" as const
    }
  ];

  for (const pack of packs) {
    const content = JSON.parse(readFileSync(pack.path, "utf-8")) as WordItem[];

    const upsertedPack = await prisma.wordPack.upsert({
      where: { slug: pack.slug },
      update: { status: "ACTIVE", ageTrack: pack.ageTrack },
      create: {
        slug: pack.slug,
        name: pack.slug,
        ageTrack: pack.ageTrack,
        version: "v1",
        status: "ACTIVE"
      }
    });

    for (const item of content) {
      const word = await prisma.word.upsert({
        where: { word_ageTrack: { word: item.word.toLowerCase(), ageTrack: pack.ageTrack } },
        update: {
          phonetic: item.phonetic,
          meaningZh: item.meaning_zh,
          meaningEn: item.meaning_en,
          partOfSpeech: item.part_of_speech,
          exampleSentence: item.example_sentence,
          exampleSentenceZh: item.example_sentence_zh,
          imageUrl: item.image_url,
          audioUrl: item.audio_url,
          difficultyLevel: item.difficulty_level,
          themeCategory: item.theme_category
        },
        create: {
          word: item.word.toLowerCase(),
          ageTrack: pack.ageTrack,
          phonetic: item.phonetic,
          meaningZh: item.meaning_zh,
          meaningEn: item.meaning_en,
          partOfSpeech: item.part_of_speech,
          exampleSentence: item.example_sentence,
          exampleSentenceZh: item.example_sentence_zh,
          imageUrl: item.image_url,
          audioUrl: item.audio_url,
          difficultyLevel: item.difficulty_level,
          themeCategory: item.theme_category
        }
      });

      await prisma.wordPackItem.upsert({
        where: { wordPackId_wordId: { wordPackId: upsertedPack.id, wordId: word.id } },
        update: {},
        create: { wordPackId: upsertedPack.id, wordId: word.id }
      });
    }
  }

  console.log("Word packs imported.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
