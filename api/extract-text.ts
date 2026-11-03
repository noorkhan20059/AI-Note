// Vercel Serverless Function: Complete Multi-Page PDF/DOCX Text Extraction
// Maps to: /api/document/extract-text (via vercel.json rewrite)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  maxDuration: 60,
};

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
            fullText = (textResult.text || '').replace(/\x00/g, '');

            if (textResult.pages && textResult.pages.length > 0) {
              textResult.pages.forEach((p: any) => {
                const clean = (p.text || '').replace(/\x00/g, '').trim();
                pagesData.push({ page: p.num || pagesData.length + 1, text: clean });
              });
            }
          } catch (classErr) {
            // pdf-parse v1 function interface
            const fnResult = await (PDFParseClass as any)(buffer);
            fullText = (fnResult.text || '').replace(/\x00/g, '');
            totalPages = fnResult.numpages || 1;
          }
        }
      } catch (pdfErr: any) {
        console.error('[extract-text] PDF parser error, running ASCII stream recovery:', pdfErr?.message || pdfErr);
        const rawStr = buffer.toString('latin1');
        const strings = rawStr.match(/[\x20-\x7E\t\n\r]{4,}/g) || [];
        fullText = strings
          .filter(
            (s) =>
              !s.startsWith('%PDF') &&
              !s.includes('/Producer') &&
              !s.includes('endobj') &&
              !s.includes('endstream')
          )
          .join(' ')
          .trim();
        totalPages = Math.max(1, Math.round(fullText.length / 2000));
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

    // Populate detectedSections from pages or headings
    if (pagesData.length > 0) {
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
