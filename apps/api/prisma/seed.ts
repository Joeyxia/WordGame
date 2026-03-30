import { PrismaClient, Role, PackStatus, AgeTrack } from "@prisma/client";

const prisma = new PrismaClient();

async function seedWordPack(ageTrack: AgeTrack, slug: string, words: string[]) {
  const pack = await prisma.wordPack.upsert({
    where: { slug },
    update: { status: PackStatus.ACTIVE },
    create: {
      slug,
      name: slug,
      version: "v1",
      ageTrack,
      status: PackStatus.ACTIVE
    }
  });

  for (const word of words) {
    const item = await prisma.word.upsert({
      where: { word_ageTrack: { word, ageTrack } },
      update: {},
      create: {
        word,
        ageTrack,
        phonetic: `/${word}/`,
        meaningZh: `${word} 的中文释义`,
        meaningEn: `${word} meaning`,
        partOfSpeech: "noun",
        exampleSentence: `I can use ${word} in a sentence.`,
        exampleSentenceZh: `我可以在句子里使用 ${word}。`,
        imageUrl: `/assets/images/${word}.png`,
        audioUrl: `/assets/audio/${word}.mp3`,
        difficultyLevel: ageTrack === AgeTrack.AGE_10 ? 1 : 2,
        themeCategory: ageTrack === AgeTrack.AGE_10 ? "school" : "science"
      }
    });

    await prisma.wordPackItem.upsert({
      where: { wordPackId_wordId: { wordPackId: pack.id, wordId: item.id } },
      update: {},
      create: {
        wordPackId: pack.id,
        wordId: item.id
      }
    });
  }
}

async function main() {
  const adminEmail = "xiayiping@gmail.com";
  const parent = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, displayName: "Primary Admin" },
    create: {
      email: adminEmail,
      displayName: "Primary Admin",
      role: Role.ADMIN
    }
  });

  const household = await prisma.household.create({
    data: {
      name: "Demo Family",
      parentId: parent.id,
      settings: {
        create: {
          defaultDailyNewWords10: 20,
          defaultDailyNewWords13: 20,
          dailyWindowStart: "18:00",
          dailyWindowEnd: "21:00",
          dailyMaxMinutes: 45,
          weekendReviewBoost: true,
          enableSpelling: true,
          enableListening: true,
          enableChallenge: true,
          reviewPriorityStrict: true
        }
      }
    }
  });

  await prisma.childProfile.createMany({
    data: [
      { name: "Kid A", householdId: household.id, ageTrack: AgeTrack.AGE_10, grade: "G4", packLevel: "core" },
      { name: "Kid B", householdId: household.id, ageTrack: AgeTrack.AGE_13, grade: "G7", packLevel: "core" }
    ]
  });

  await seedWordPack(AgeTrack.AGE_10, "age10-core-v1", ["apple", "bread", "chair", "river", "tiger", "pencil"]);
  await seedWordPack(AgeTrack.AGE_13, "age13-core-v1", ["analyze", "context", "neuron", "justify", "impact", "research"]);

  console.log("Seed done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
