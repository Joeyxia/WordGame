"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../../../lib/api";
import { PageShell } from "../../../components/page-shell";

type WordPack = { id: string; name: string; version: string; status: string; ageTrack: string; items: unknown[] };
type Word = {
  id: string;
  word: string;
  phonetic: string;
  meaningZh: string;
  meaningEn: string;
  partOfSpeech: string;
  exampleSentence: string;
  exampleSentenceZh: string;
  imageUrl: string;
  audioUrl: string;
  difficultyLevel: number;
  themeCategory: string;
};
type QualityReport = {
  summary: { totalWords: number; issueWords: number; healthyWords: number };
  categoryStats: Record<string, number>;
  issueSamples: { wordId: string; word: string; issues: string[] }[];
};
type ImportPreview = {
  summary: {
    totalInput: number;
    uniqueInput: number;
    duplicatesInPayload: number;
    existingInDatabase: number;
    invalidItems: number;
    importableCount: number;
  };
  invalidItems: { index: number; word: string; issues: string[] }[];
};

const EMPTY_WORD = {
  word: "",
  phonetic: "",
  meaningZh: "",
  meaningEn: "",
  partOfSpeech: "noun",
  exampleSentence: "",
  exampleSentenceZh: "",
  imageUrl: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg",
  audioUrl: "https://cdn.wordquest.games/audio/default.mp3",
  difficultyLevel: 1,
  themeCategory: "general"
};

export default function AdminWordPacksPage() {
  const [packs, setPacks] = useState<WordPack[]>([]);
  const [activePackId, setActivePackId] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [editWordId, setEditWordId] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");
  const [bulkJson, setBulkJson] = useState("");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [quality, setQuality] = useState<QualityReport | null>(null);

  const activePack = useMemo(() => packs.find((pack) => pack.id === activePackId) || null, [packs, activePackId]);

  async function loadPacks() {
    const data = await apiGet<WordPack[]>("/admin/word-packs");
    setPacks(data);
    if (!activePackId && data[0]) {
      setActivePackId(data[0].id);
    }
  }

  async function loadWords(packId: string) {
    const data = await apiGet<{ words: Word[] }>(`/admin/word-packs/${packId}/words`);
    setWords(data.words);
  }

  useEffect(() => {
    apiGet<WordPack[]>("/admin/word-packs")
      .then((data) => {
        setPacks(data);
        if (data[0]) {
          setActivePackId(data[0].id);
        }
      })
      .catch((err: unknown) => setError((err as Error).message));
  }, []);

  useEffect(() => {
    if (!activePackId) return;
    void loadWords(activePackId).catch((err: unknown) => setError((err as Error).message));
  }, [activePackId]);

  async function updatePackStatus(packId: string, nextStatus: string) {
    setSavingId(packId);
    setStatus("Updating pack status...");
    setError("");
    try {
      await apiPatch(`/admin/word-packs/${packId}/status`, { status: nextStatus });
      await loadPacks();
      setStatus("Pack status updated.");
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    } finally {
      setSavingId("");
    }
  }

  function startEdit(word: Word) {
    setEditWordId(word.id);
    setDraft({
      word: word.word,
      phonetic: word.phonetic,
      meaningZh: word.meaningZh,
      meaningEn: word.meaningEn,
      partOfSpeech: word.partOfSpeech,
      exampleSentence: word.exampleSentence,
      exampleSentenceZh: word.exampleSentenceZh,
      imageUrl: word.imageUrl,
      audioUrl: word.audioUrl,
      difficultyLevel: String(word.difficultyLevel),
      themeCategory: word.themeCategory
    });
  }

  async function saveWord() {
    if (!editWordId) return;
    setStatus("Saving word...");
    setError("");
    try {
      await apiPatch(`/admin/words/${editWordId}`, {
        ...draft,
        difficultyLevel: Number(draft.difficultyLevel || 1)
      });
      setStatus("Word updated.");
      setEditWordId("");
      if (activePackId) {
        await loadWords(activePackId);
      }
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  async function createWord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePackId) return;
    const form = new FormData(event.currentTarget);
    setStatus("Creating word...");
    setError("");
    try {
      await apiPost(`/admin/word-packs/${activePackId}/words`, {
        word: String(form.get("word") || ""),
        phonetic: String(form.get("phonetic") || ""),
        meaningZh: String(form.get("meaningZh") || ""),
        meaningEn: String(form.get("meaningEn") || ""),
        partOfSpeech: String(form.get("partOfSpeech") || "noun"),
        exampleSentence: String(form.get("exampleSentence") || ""),
        exampleSentenceZh: String(form.get("exampleSentenceZh") || ""),
        imageUrl: String(form.get("imageUrl") || ""),
        audioUrl: String(form.get("audioUrl") || ""),
        difficultyLevel: Number(form.get("difficultyLevel") || 1),
        themeCategory: String(form.get("themeCategory") || "general")
      });
      setStatus("Word created and linked to pack.");
      event.currentTarget.reset();
      await loadWords(activePackId);
      await loadPacks();
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  function parseBulkWords() {
    const parsed = JSON.parse(bulkJson) as Record<string, unknown>[];
    if (!Array.isArray(parsed)) {
      throw new Error("Bulk JSON must be an array");
    }
    return parsed.map((row) => ({
      word: String(row.word || ""),
      phonetic: String(row.phonetic || ""),
      meaningZh: String(row.meaningZh || row.meaning_zh || ""),
      meaningEn: String(row.meaningEn || row.meaning_en || ""),
      partOfSpeech: String(row.partOfSpeech || row.part_of_speech || "noun"),
      exampleSentence: String(row.exampleSentence || row.example_sentence || ""),
      exampleSentenceZh: String(row.exampleSentenceZh || row.example_sentence_zh || ""),
      imageUrl: String(row.imageUrl || row.image_url || ""),
      audioUrl: String(row.audioUrl || row.audio_url || ""),
      difficultyLevel: Number(row.difficultyLevel || row.difficulty_level || 1),
      themeCategory: String(row.themeCategory || row.theme_category || "general")
    }));
  }

  async function runImportPreview() {
    if (!activePackId) return;
    setError("");
    setStatus("Running import preview...");
    try {
      const wordsPayload = parseBulkWords();
      const data = await apiPost<ImportPreview>(`/admin/word-packs/${activePackId}/import-preview`, { words: wordsPayload });
      setPreview(data);
      setStatus("Import preview ready.");
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  async function executeBulkImport() {
    if (!activePackId) return;
    setError("");
    setStatus("Importing words...");
    try {
      const wordsPayload = parseBulkWords();
      const result = await apiPost<{ ok: boolean; message: string }>(`/admin/word-packs/${activePackId}/import-words`, {
        words: wordsPayload
      });
      setStatus(result.message);
      await loadWords(activePackId);
      await loadPacks();
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  async function loadQualityReport() {
    if (!activePackId) return;
    setError("");
    setStatus("Checking pack quality...");
    try {
      const data = await apiGet<QualityReport>(`/admin/word-packs/${activePackId}/quality-report`);
      setQuality(data);
      setStatus("Quality report loaded.");
    } catch (err) {
      setError((err as Error).message);
      setStatus("");
    }
  }

  return (
    <PageShell title="Word Packs" subtitle="Manage pack status and words by age/version.">
      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {status ? <p className="mb-2 text-sm text-emerald-700">{status}</p> : null}

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        {packs.map((pack) => (
          <article key={pack.id} className={`mc-list-card p-3 text-sm ${activePackId === pack.id ? "ring-2 ring-emerald-600" : ""}`}>
            <button className="w-full text-left" onClick={() => setActivePackId(pack.id)}>
              <p className="font-semibold">
                {pack.name} · {pack.version} · {pack.ageTrack}
              </p>
              <p>Items: {pack.items.length}</p>
            </button>
            <div className="mt-2 flex items-center gap-2">
              <select
                className="p-2"
                defaultValue={pack.status}
                onChange={(event) => void updatePackStatus(pack.id, event.target.value)}
                disabled={savingId === pack.id}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <span>Current: {pack.status}</span>
            </div>
          </article>
        ))}
      </div>

      {activePack ? (
        <form className="mc-list-card mb-3 grid gap-2 p-3 text-sm sm:grid-cols-3" onSubmit={createWord}>
          <input className="p-2" name="word" placeholder="word" defaultValue={EMPTY_WORD.word} required />
          <input className="p-2" name="phonetic" placeholder="/phonetic/" defaultValue={EMPTY_WORD.phonetic} required />
          <input className="p-2" name="partOfSpeech" placeholder="noun" defaultValue={EMPTY_WORD.partOfSpeech} required />
          <input className="p-2" name="meaningEn" placeholder="English meaning" defaultValue={EMPTY_WORD.meaningEn} required />
          <input className="p-2" name="meaningZh" placeholder="Chinese meaning" defaultValue={EMPTY_WORD.meaningZh} required />
          <input className="p-2" name="themeCategory" placeholder="theme" defaultValue={EMPTY_WORD.themeCategory} required />
          <input className="p-2 sm:col-span-3" name="exampleSentence" placeholder="Example sentence (EN)" defaultValue={EMPTY_WORD.exampleSentence} required />
          <input className="p-2 sm:col-span-3" name="exampleSentenceZh" placeholder="Example sentence (ZH)" defaultValue={EMPTY_WORD.exampleSentenceZh} required />
          <input className="p-2 sm:col-span-2" name="imageUrl" placeholder="Image URL" defaultValue={EMPTY_WORD.imageUrl} required />
          <input className="p-2" name="audioUrl" placeholder="Audio URL" defaultValue={EMPTY_WORD.audioUrl} required />
          <input className="p-2" name="difficultyLevel" type="number" min={1} max={5} defaultValue={EMPTY_WORD.difficultyLevel} required />
          <button className="mc-btn sm:col-span-2" type="submit">
            Add Word To {activePack.name}
          </button>
        </form>
      ) : null}

      {activePack ? (
        <section className="mc-list-card mb-3 grid gap-2 p-3 text-sm">
          <p className="font-semibold">Bulk Import JSON</p>
          <textarea
            className="min-h-44 p-2 font-mono text-xs"
            placeholder='Paste JSON array: [{"word":"apple","phonetic":"/.../","meaning_en":"...","meaning_zh":"..."}]'
            value={bulkJson}
            onChange={(event) => setBulkJson(event.target.value)}
          />
          <div className="flex gap-2">
            <button className="mc-btn" onClick={() => void runImportPreview()}>
              Preview Import
            </button>
            <button className="mc-btn" onClick={() => void executeBulkImport()}>
              Import Words
            </button>
            <button className="mc-btn" onClick={() => void loadQualityReport()}>
              Quality Report
            </button>
          </div>
          {preview ? (
            <div className="mc-list-card p-2">
              <p className="font-semibold">
                preview: total {preview.summary.totalInput}, unique {preview.summary.uniqueInput}, invalid {preview.summary.invalidItems},
                importable {preview.summary.importableCount}
              </p>
              {preview.invalidItems.slice(0, 10).map((item) => (
                <p key={`${item.index}-${item.word}`} className="text-xs text-red-700">
                  #{item.index} {item.word || "(empty)"}: {item.issues.join(", ")}
                </p>
              ))}
            </div>
          ) : null}
          {quality ? (
            <div className="mc-list-card p-2">
              <p className="font-semibold">
                quality: total {quality.summary.totalWords}, healthy {quality.summary.healthyWords}, issue words {quality.summary.issueWords}
              </p>
              {quality.issueSamples.slice(0, 10).map((item) => (
                <p key={item.wordId} className="text-xs text-red-700">
                  {item.word}: {item.issues.join(", ")}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="space-y-2">
        {words.map((word) => (
          <article key={word.id} className="mc-list-card p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{word.word}</p>
                <p className="mc-soft">{word.meaningEn}</p>
                <p className="mc-soft text-xs">
                  {word.partOfSpeech} · diff {word.difficultyLevel} · {word.themeCategory}
                </p>
              </div>
              <button className="mc-btn" onClick={() => startEdit(word)}>
                Edit
              </button>
            </div>
          </article>
        ))}
      </div>

      {editWordId ? (
        <section className="mc-list-card mt-4 grid gap-2 p-3 text-sm">
          <p className="font-semibold">Edit Word</p>
          <input className="p-2" value={draft.word || ""} onChange={(e) => setDraft((v) => ({ ...v, word: e.target.value }))} />
          <input className="p-2" value={draft.phonetic || ""} onChange={(e) => setDraft((v) => ({ ...v, phonetic: e.target.value }))} />
          <input className="p-2" value={draft.meaningEn || ""} onChange={(e) => setDraft((v) => ({ ...v, meaningEn: e.target.value }))} />
          <input className="p-2" value={draft.meaningZh || ""} onChange={(e) => setDraft((v) => ({ ...v, meaningZh: e.target.value }))} />
          <input className="p-2" value={draft.partOfSpeech || ""} onChange={(e) => setDraft((v) => ({ ...v, partOfSpeech: e.target.value }))} />
          <input className="p-2" value={draft.themeCategory || ""} onChange={(e) => setDraft((v) => ({ ...v, themeCategory: e.target.value }))} />
          <input className="p-2" value={draft.exampleSentence || ""} onChange={(e) => setDraft((v) => ({ ...v, exampleSentence: e.target.value }))} />
          <input className="p-2" value={draft.exampleSentenceZh || ""} onChange={(e) => setDraft((v) => ({ ...v, exampleSentenceZh: e.target.value }))} />
          <input className="p-2" value={draft.imageUrl || ""} onChange={(e) => setDraft((v) => ({ ...v, imageUrl: e.target.value }))} />
          <input className="p-2" value={draft.audioUrl || ""} onChange={(e) => setDraft((v) => ({ ...v, audioUrl: e.target.value }))} />
          <input className="p-2" type="number" min={1} max={5} value={draft.difficultyLevel || "1"} onChange={(e) => setDraft((v) => ({ ...v, difficultyLevel: e.target.value }))} />
          <div className="flex gap-2">
            <button className="mc-btn" onClick={() => void saveWord()}>
              Save Word
            </button>
            <button className="mc-btn" onClick={() => setEditWordId("")}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
