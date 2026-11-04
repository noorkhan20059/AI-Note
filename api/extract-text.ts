// Vercel Serverless Function: Complete Multi-Page PDF/DOCX Text Extraction
// Maps to: /api/document/extract-text (via vercel.json rewrite)
import zlib from 'zlib';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  maxDuration: 60,
};

// Check if a text snippet consists of garbled binary/compressed characters
export function isGarbledText(text: string): boolean {
  if (!text || text.length < 15) return false;
  // Non-alphanumeric, non-standard punctuation ratio
  const weirdSymbols = (text.match(/[^a-zA-Z0-9\s.,!?:;'"()\-\/]/g) || []).length;
  const ratio = weirdSymbols / text.length;
  if (ratio > 0.08) return true;

  // Check density of words with numbers and letters mixed or excessive symbols
  const words = text.split(/\s+/).filter((w) => w.length >= 3);
  if (words.length > 5) {
    const weirdWords = words.filter((w) => /[^a-zA-Z0-9.,!?-]/.test(w) || /[0-9][a-zA-Z]/.test(w));
    if (weirdWords.length / words.length > 0.35) return true;
  }
  return false;
}

// Pure Node.js FlateDecode stream decompressor for reliable serverless execution
function extractTextFromPdfFlateStreams(buffer: Buffer): { fullText: string; pageCount: number; pagesData: { page: number; text: string }[] } {
  const pagesData: { page: number; text: string }[] = [];
  const textStreams: string[] = [];
  let pos = 0;

  while (pos < buffer.length) {
    const streamIdx = buffer.indexOf('stream', pos);
    if (streamIdx === -1) break;

    let startData = -1;
    if (buffer[streamIdx + 6] === 0x0D && buffer[streamIdx + 7] === 0x0A) {
      startData = streamIdx + 8;
    } else if (buffer[streamIdx + 6] === 0x0A) {
      startData = streamIdx + 7;
    }

    if (startData !== -1) {
      const endstreamIdx = buffer.indexOf('endstream', startData);
      if (endstreamIdx !== -1) {
        let endData = endstreamIdx;
        if (buffer[endData - 2] === 0x0D && buffer[endData - 1] === 0x0A) {
          endData -= 2;
        } else if (buffer[endData - 1] === 0x0A) {
          endData -= 1;
        }

        const streamSlice = buffer.subarray(startData, endData);
        let decomp: Buffer | null = null;
        try {
          decomp = zlib.inflateSync(streamSlice);
        } catch {
          try {
            decomp = zlib.inflateRawSync(streamSlice);
          } catch {
            // Not a flate stream
          }
        }

        if (decomp) {
          const textStr = decomp.toString('utf-8');
          if (textStr.includes('BT') || textStr.includes('Tj') || textStr.includes('TJ')) {
            const textChunks: string[] = [];
            const tjRegex = /\(([^)]*)\)\s*Tj/g;
            let m;
            while ((m = tjRegex.exec(textStr)) !== null) {
              textChunks.push(m[1]);
            }
            const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
            while ((m = tjArrayRegex.exec(textStr)) !== null) {
              const inner = m[1];
              const innerStrings = inner.match(/\(([^)]*)\)/g) || [];
              const combined = innerStrings.map((s) => s.slice(1, -1)).join('');
              if (combined) textChunks.push(combined);
            }
            const clean = textChunks.join(' ').replace(/\\([()\\])/g, '$1').replace(/\s+/g, ' ').trim();
            if (clean.length > 25 && !isGarbledText(clean)) {
              textStreams.push(clean);
            }
          }
        }
        pos = endstreamIdx + 9;
        continue;
      }
    }
    pos = streamIdx + 6;
  }

  textStreams.forEach((t, i) => {
    pagesData.push({ page: i + 1, text: t });
  });

  return {
    fullText: textStreams.join('\n\n'),
    pageCount: Math.max(1, textStreams.length),
    pagesData,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileName = '', fileType = '', dataUrl = '' } = req.body || {};

    if (!dataUrl) {
      return res.status(400).json({ error: 'No document data provided' });
    }

    const base64Index = dataUrl.indexOf('base64,');
    const rawBase64 = base64Index !== -1 ? dataUrl.slice(base64Index + 7) : dataUrl;
    const buffer = Buffer.from(rawBase64, 'base64');

    const lowerName = (fileName || '').toLowerCase();
    const isPdf =
      lowerName.endsWith('.pdf') ||
      (fileType || '').includes('pdf') ||
      buffer.slice(0, 5).toString('ascii').startsWith('%PDF');
    const isDocx =
      lowerName.endsWith('.docx') ||
      (fileType || '').includes('wordprocessingml') ||
      (fileType || '').includes('wordprocessing');

    let fullText = '';
    let totalPages = 1;
    let pagesData: { page: number; text: string }[] = [];
    let detectedSections: { title: string; page: number; section: string; summary: string }[] = [];
    let detectedSubject = 'General Study';

    if (isPdf) {
      try {
        const pdfModule: any = await import('pdf-parse');
        const PDFParseClass = pdfModule.PDFParse || pdfModule.default?.PDFParse || pdfModule.default;

        if (typeof PDFParseClass === 'function') {
          try {
            // pdf-parse v2+ class interface
            const parser = new PDFParseClass({ data: new Uint8Array(buffer) });
            const textResult = await parser.getText();
            totalPages = textResult.total || (textResult.pages ? textResult.pages.length : 1) || 1;
            const extracted = (textResult.text || '').replace(/\x00/g, '').trim();

            if (extracted.length > 50 && !isGarbledText(extracted)) {
              fullText = extracted;
              if (textResult.pages && textResult.pages.length > 0) {
                textResult.pages.forEach((p: any) => {
                  const clean = (p.text || '').replace(/\x00/g, '').trim();
                  if (!isGarbledText(clean)) {
                    pagesData.push({ page: p.num || pagesData.length + 1, text: clean });
                  }
                });
              }
            }
          } catch (classErr) {
            // pdf-parse v1 function interface
            const fnResult = await (PDFParseClass as any)(buffer);
            const extracted = (fnResult.text || '').replace(/\x00/g, '').trim();
            if (extracted.length > 50 && !isGarbledText(extracted)) {
              fullText = extracted;
              totalPages = fnResult.numpages || 1;
            }
          }
        }
      } catch (pdfErr: any) {
        console.warn('[extract-text] pdf-parse library failed, falling back to Flate stream extraction:', pdfErr?.message || pdfErr);
      }

      // If pdf-parse failed or returned garbled/empty text, run pure FlateDecode stream decompressor
      if (!fullText || fullText.length < 50 || isGarbledText(fullText)) {
        console.log('[extract-text] Running pure zlib FlateDecode stream extractor...');
        const flateResult = extractTextFromPdfFlateStreams(buffer);
        if (flateResult.fullText && flateResult.fullText.length > 50) {
          fullText = flateResult.fullText;
          totalPages = flateResult.pageCount;
          pagesData = flateResult.pagesData;
        }
      }
    } else if (isDocx) {
      try {
        const mammothModule: any = await import('mammoth');
        const extractFn = mammothModule.extractRawText || mammothModule.default?.extractRawText;
        const result = await extractFn({ buffer });
        fullText = result.value || '';
        totalPages = Math.max(1, Math.round(fullText.length / 2200));
      } catch (docxErr: any) {
        console.error('[extract-text] mammoth failed:', docxErr?.message || docxErr);
        fullText = buffer.toString('utf-8');
        totalPages = Math.max(1, Math.round(fullText.length / 2000));
      }
    } else {
      fullText = buffer.toString('utf-8');
      totalPages = Math.max(1, Math.round(fullText.length / 2000));
    }

    fullText = fullText.replace(/\x00/g, '').replace(/\r\n/g, '\n').trim();

    // If PDF header binary junk leaked in, strip it
    if (fullText.startsWith('%PDF-') || fullText.includes('/Producer(pypdf)')) {
      fullText = fullText.replace(/%PDF[\s\S]*?endobj/g, '').trim();
    }

    // Infer subject
    if (
      /cs610|computer networks?|packet|protocol|tcp|udp|ethernet|ip address|arp|ospf|bgp|mac address|topology/i.test(
        fileName + ' ' + fullText.slice(0, 5000)
      )
    ) {
      detectedSubject = 'Computer Communication and Networks (CS610)';
    } else if (
      /chemistry|sn1|sn2|reaction|organic|molecule|carbocation|nucleophile|alkene|alkyl/i.test(
        fileName + ' ' + fullText.slice(0, 5000)
      )
    ) {
      detectedSubject = 'Organic Chemistry';
    } else if (
      /physics|quantum|force|velocity|thermodynamics|kinematics|newton/i.test(
        fileName + ' ' + fullText.slice(0, 5000)
      )
    ) {
      detectedSubject = 'Physics';
    } else if (
      /math|calculus|derivative|integral|matrix|algebra|equation|differential/i.test(
        fileName + ' ' + fullText.slice(0, 5000)
      )
    ) {
      detectedSubject = 'Mathematics';
    } else if (
      /biology|cell|dna|protein|organism|genetics|enzyme|mitosis|meiosis/i.test(
        fileName + ' ' + fullText.slice(0, 5000)
      )
    ) {
      detectedSubject = 'Biology';
    }

    // Build pagesData if not already populated from PDF pages
    if (pagesData.length === 0 && fullText.length > 0) {
      const charsPerPage = Math.max(1000, Math.round(fullText.length / totalPages));
      for (let p = 1; p <= totalPages; p++) {
        const start = (p - 1) * charsPerPage;
        const end = Math.min(p * charsPerPage, fullText.length);
        pagesData.push({ page: p, text: fullText.slice(start, end).trim() });
      }
    }

    // Step A: Check for formal Table of Contents in early pages (pages 1-5)
    if (pagesData.length > 0) {
      const tocText = pagesData.slice(0, 5).map((p) => p.text).join('\n');
      
      // Pattern 1: Lecture No. X ... Page ... Title
      const lectureTocMatches = [...tocText.matchAll(/Lecture\s+No\.?\s*(\d+)\s*\.{3,}\s*(\d+)\s*\n+([^\n\.]+)/gi)];
      if (lectureTocMatches.length >= 3) {
        lectureTocMatches.forEach((m) => {
          const lecNum = m[1];
          const pageNum = parseInt(m[2], 10);
          const title = m[3].trim().replace(/\.+$/, '').trim();
          detectedSections.push({
            title: `Lecture ${lecNum}: ${title}`,
            page: pageNum,
            section: `Lecture ${lecNum}`,
            summary: `Comprehensive academic notes for Lecture ${lecNum}: ${title}`,
          });
        });
      }

      // Pattern 2: Chapter X ... Page ... Title
      if (detectedSections.length === 0) {
        const chapterTocMatches = [...tocText.matchAll(/Chapter\s+(\d+)[\s:\.]+([^\n\.]+?)\s*\.{3,}\s*(\d+)/gi)];
        if (chapterTocMatches.length >= 3) {
          chapterTocMatches.forEach((m) => {
            const chapNum = m[1];
            const title = m[2].trim();
            const pageNum = parseInt(m[3], 10);
            detectedSections.push({
              title: `Chapter ${chapNum}: ${title}`,
              page: pageNum,
              section: `Chapter ${chapNum}`,
              summary: `Comprehensive notes for Chapter ${chapNum}: ${title}`,
            });
          });
        }
      }
    }

    // Step B: If no formal TOC matched, scan individual pages for headings
    if (detectedSections.length === 0 && pagesData.length > 0) {
      pagesData.forEach((p) => {
        const lines = p.text.split('\n').map((l) => l.trim()).filter(Boolean);
        const headingLine = lines.find(
          (l) =>
            /^(chapter|section|lecture|module|unit|\d+\.|\d+\.\d+)\b/i.test(l) ||
            (l.length > 4 && l.length < 75 && l === l.toUpperCase() && !/^\d+$/.test(l))
        );
        if (headingLine && detectedSections.length < 45) {
          detectedSections.push({
            title: headingLine.slice(0, 80),
            page: p.page,
            section: `Page ${p.page}`,
            summary: lines.slice(1, 4).join(' ').slice(0, 160) || headingLine,
          });
        }
      });
    }

    if (detectedSections.length === 0 && fullText.length > 0) {
      const lines = fullText.split('\n').map((l) => l.trim()).filter(Boolean);
      let pageCounter = 1;
      const pageStep = Math.max(1, Math.round(totalPages / 20));
      lines.forEach((line) => {
        if (
          /^(chapter|section|lecture|module|unit|\d+\.|\d+\.\d+)\b/i.test(line) ||
          (line.length > 5 && line.length < 65 && line === line.toUpperCase())
        ) {
          if (detectedSections.length < 35) {
            detectedSections.push({
              title: line.slice(0, 80),
              page: pageCounter,
              section: `Section ${detectedSections.length + 1}`,
              summary: line,
            });
            pageCounter += pageStep;
          }
        }
      });
    }

    if (detectedSections.length === 0) {
      detectedSections.push({
        title: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        page: 1,
        section: 'Document Body',
        summary: fullText.slice(0, 200) + (fullText.length > 200 ? '...' : ''),
      });
    }

    console.log(`[extract-text] Finished: ${totalPages} pages, ${pagesData.length} page segments, ${detectedSections.length} sections for "${fileName}"`);

    return res.status(200).json({
      success: true,
      text: fullText,
      pages: totalPages,
      subject: detectedSubject,
      sections: detectedSections,
      pagesData,
    });
  } catch (err: any) {
    console.error('[extract-text] Unexpected error:', err);
    return res.status(500).json({
      error: 'Failed to extract document text: ' + (err?.message || 'Unknown error'),
    });
  }
}
