import { NextResponse } from 'next/server';

const BASE = 'https://election.ekantipur.com';
const URLS = {
  home: `${BASE}/?lng=eng`,
  rsp: `${BASE}/party/7/leading?lng=eng`,
  spotlight: `${BASE}/pradesh-1/district-jhapa/constituency-5?lng=eng`,
};

// Extra constituencies to inject into Featured Constituency Battles
const EXTRA_CONSTITUENCIES = [
  `${BASE}/pradesh-5/district-dang/constituency-2?lng=eng`,
  `${BASE}/pradesh-3/district-dhading/constituency-1?lng=eng`,
  `${BASE}/pradesh-2/district-sarlahi/constituency-4?lng=eng`,
  `${BASE}/pradesh-2/district-saptari/constituency-2?lng=eng`,
  `${BASE}/pradesh-1/district-sunsari/constituency-1?lng=eng`,
  `${BASE}/pradesh-5/district-nawalparasiwest/constituency-1?lng=eng`,
];

// Extra candidate profiles to inject into Popular Candidates
const EXTRA_PROFILES = [
  `${BASE}/profile/2257?lng=eng`,
  `${BASE}/profile/1669?lng=eng`,
  `${BASE}/profile/240?lng=eng`,
];
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};
const TOTAL_SEATS = 165;

const PROVINCES = [
  { id: 1, name: 'Koshi', slug: 'pradesh-1' },
  { id: 2, name: 'Madhesh', slug: 'pradesh-2' },
  { id: 3, name: 'Bagmati', slug: 'pradesh-3' },
  { id: 4, name: 'Gandaki', slug: 'pradesh-4' },
  { id: 5, name: 'Lumbini', slug: 'pradesh-5' },
  { id: 6, name: 'Karnali', slug: 'pradesh-6' },
  { id: 7, name: 'Sudurpaschim', slug: 'pradesh-7' },
];

async function fetchHTML(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(12000),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.text();
}

function parseParties(html: string) {
  const parties: { id: number; name: string; img: string; won: number; lead: number; total: number }[] = [];
  const seen = new Set<string>();
  const blocks = html.split(/class="party-row d-flex"/i);

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].substring(0, 2000);
    const nameMatch = block.match(/<p>([^<]+)<\/p>/);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();
    if (seen.has(name)) continue;
    seen.add(name);

    const imgMatch = block.match(/<img\s+src="([^"]+)"/);
    const wonMatch = block.match(/win-count">\s*(\d+)/);
    const leadMatch = block.match(/lead-count">\s*(\d+)/);
    const idMatch = block.match(/party\/(\d+)/);

    const won = wonMatch ? parseInt(wonMatch[1], 10) : 0;
    const lead = leadMatch ? parseInt(leadMatch[1], 10) : 0;

    parties.push({
      id: idMatch ? parseInt(idMatch[1], 10) : 0,
      name,
      img: imgMatch ? imgMatch[1] : '',
      won,
      lead,
      total: won + lead,
    });
  }

  parties.sort((a, b) => b.total - a.total);
  return parties;
}

function parseProvinces(html: string) {
  const provinces: {
    id: number; name: string; slug: string; districts: number; seats: number;
    parties: { name: string; img: string; won: number; lead: number }[];
  }[] = [];
  const blocks = html.split(/class="result-table"/i);

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].substring(0, 15000);
    const nameMatch = block.match(/result-header[\s\S]*?<p>([^<]+)<\/p>/i);
    if (!nameMatch) continue;
    const name = nameMatch[1].trim();

    const distMatch = block.match(/District\s*([\d]+)/i);
    const seatMatch = block.match(/Seats:\s*([\d]+)/i);

    const partyResults: { name: string; img: string; won: number; lead: number }[] = [];
    const resultRows = block.split(/class="result-row d-flex"/i);

    for (let j = 1; j < resultRows.length; j++) {
      const row = resultRows[j].substring(0, 2000);
      const pNameMatch = row.match(/<p>([^<]+)<\/p>/);
      if (!pNameMatch || pNameMatch[1].trim() === 'Party') continue;

      const pImgMatch = row.match(/<img\s+src="([^"]+)"/);
      const pWonMatch = row.match(/win-count">\s*(\d+)/);
      const pLeadMatch = row.match(/lead-count">\s*(\d+)/);

      const pWon = pWonMatch ? parseInt(pWonMatch[1], 10) : 0;
      const pLead = pLeadMatch ? parseInt(pLeadMatch[1], 10) : 0;

      partyResults.push({
        name: pNameMatch[1].trim(),
        img: pImgMatch ? pImgMatch[1] : '',
        won: pWon,
        lead: pLead,
      });
    }

    partyResults.sort((a, b) => (b.won + b.lead) - (a.won + a.lead));

    const meta = PROVINCES.find(p => p.name === name);
    provinces.push({
      id: meta ? meta.id : i,
      name,
      slug: meta ? meta.slug : '',
      districts: distMatch ? parseInt(distMatch[1], 10) : 0,
      seats: seatMatch ? parseInt(seatMatch[1], 10) : 0,
      parties: partyResults,
    });
  }

  return provinces;
}

function parsePopularCandidates(html: string) {
  const races: {
    constituency: string;
    featured: { name: string; party: string; img: string; votes: number; margin: number; status: string };
    candidates: { id: number; name: string; party: string; img: string; partyImg: string; votes: number }[];
  }[] = [];

  const blocks = html.split(/class="popular-candidate-card-wrapper"/i);

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].substring(0, 12000);

    const constMatch = block.match(/constituency[^"]*\?lng=eng">([^<]+)/i);
    const constituency = constMatch ? constMatch[1].trim() : '';

    const featNameMatch = block.match(/<h5>([^<]+)<\/h5>/);
    const featName = featNameMatch ? featNameMatch[1].trim() : '';

    const featImgMatch = block.match(/candidate-image[\s\S]*?candidates\/([^"]+)/i);
    const featImg = featImgMatch
      ? `https://assets-generalelection2082.ekantipur.com/candidates/${featImgMatch[1]}`
      : '';

    const featVoteMatch = block.match(
      /vote-count">\s*<p>([\d,]+)<\/p>\s*[\s\S]*?<span>[\s\S]*?([\d,]+)\s*<\/span>/i,
    );
    const featVotes = featVoteMatch ? parseInt(featVoteMatch[1].replace(/,/g, ''), 10) : 0;
    const featMargin = featVoteMatch ? parseInt(featVoteMatch[2].replace(/,/g, ''), 10) : 0;

    const featPartyMatch = block.match(/class="party-image"[^>]*title="([^"]+)"/i);
    const featParty = featPartyMatch ? featPartyMatch[1].trim() : '';

    const candidates: { id: number; name: string; party: string; img: string; partyImg: string; votes: number }[] = [];
    const items = block.split(/candidate-items d-flex/i);

    for (let j = 1; j < items.length; j++) {
      const ib = items[j].substring(0, 3000);
      const nameMatch = ib.match(/<p>([^<]+)<\/p>/);
      const name = nameMatch ? nameMatch[1].trim() : '';
      if (!name) continue;

      const partyMatch = ib.match(/<span>([^<]+)<\/span>/);
      const imgMatch = ib.match(/candidates\/([^"]+)/);
      const partyImgMatch = ib.match(/parties\/([^"]+)/);
      const voteMatch = ib.match(/vote-count[\s\S]{0,200}?<p>([\d,]+)<\/p>/i);
      const profileMatch = ib.match(/profile\/(\d+)/);

      candidates.push({
        id: profileMatch ? parseInt(profileMatch[1], 10) : 0,
        name,
        party: partyMatch ? partyMatch[1].trim() : '',
        img: imgMatch ? `https://assets-generalelection2082.ekantipur.com/candidates/${imgMatch[1]}` : '',
        partyImg: partyImgMatch
          ? `https://assets-generalelection2082.ekantipur.com/parties/${partyImgMatch[1]}`
          : '',
        votes: voteMatch ? parseInt(voteMatch[1].replace(/,/g, ''), 10) : 0,
      });
    }

    // Resolve featured status from actual vote counts
    let featStatus = 'leading';
    if (candidates.length > 0) {
      const featEntry = candidates.find(c => c.name === featName);
      const actualVotes = featEntry?.votes ?? featVotes;
      const maxVotes = Math.max(...candidates.map(c => c.votes));
      featStatus = actualVotes >= maxVotes ? 'leading' : 'following';
    }

    races.push({
      constituency,
      featured: { name: featName, party: featParty, img: featImg, votes: featVotes, margin: featMargin, status: featStatus },
      candidates,
    });
  }

  return races;
}

function parseRSPCandidates(html: string) {
  const candidates: {
    id: number; name: string; constituency: string; constituencyNum: number;
    province: string; district: string; votes: number; leadMargin: number; status: string;
  }[] = [];

  const tableMatch = html.match(/id="election_year_2082"[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tableMatch) return candidates;

  const chunks = tableMatch[1].split(/<tr[\s>]/i);

  for (const chunk of chunks) {
    if (!chunk.trim()) continue;

    const provinceMatch = chunk.match(/data-province="([^"]+)"/);
    const districtMatch = chunk.match(/data-district="([^"]+)"/);
    const nameMatch = chunk.match(/profile\/(\d+)\?lng=eng">([^<]+)/);
    const constMatch = chunk.match(/constituency-(\d+)\?lng=eng">([^<]+)/);
    const voteMatch = chunk.match(/<span>([\d,]+)\s*\((Leading|Won)\)<\/span>/i);

    if (!voteMatch || !nameMatch) continue;

    const totalMatch = chunk.match(/votecount[\s\S]*?<p>([\d,]+)<\/p>/i);

    candidates.push({
      id: nameMatch ? parseInt(nameMatch[1], 10) : 0,
      name: nameMatch ? nameMatch[2].trim() : '',
      constituency: constMatch ? constMatch[2].trim() : '',
      constituencyNum: constMatch ? parseInt(constMatch[1], 10) : 0,
      province: provinceMatch ? provinceMatch[1] : '',
      district: districtMatch ? districtMatch[1] : '',
      votes: totalMatch ? parseInt(totalMatch[1].replace(/,/g, ''), 10) : 0,
      leadMargin: parseInt(voteMatch[1].replace(/,/g, ''), 10),
      status: voteMatch[2].toLowerCase(),
    });
  }

  candidates.sort((a, b) => b.votes - a.votes);
  return candidates;
}

function parseSpotlight(html: string): { constituency: string; candidates: { id: number; name: string; party: string; img: string; partyImg: string; votes: number; margin: number; isLeading: boolean }[] } {
  // Extract constituency name from breadcrumb or heading
  const constMatch = html.match(/Constituency-(\d+)/i);
  const distMatch = html.match(/district-([a-z]+)/i);
  const constituency = distMatch && constMatch
    ? `${distMatch[1].charAt(0).toUpperCase() + distMatch[1].slice(1)}-${constMatch[1]}`
    : 'Jhapa-5';

  const candidates: { id: number; name: string; party: string; img: string; partyImg: string; votes: number; margin: number; isLeading: boolean }[] = [];

  // Split by table rows containing profile links
  const rows = html.split(/<tr[\s>]/i);

  for (const row of rows) {
    const profileMatch = row.match(/profile\/(\d+)/);
    if (!profileMatch) continue;

    const id = parseInt(profileMatch[1], 10);

    const nameMatch = row.match(/candidate-name-link[\s\S]*?<span>([^<]+)<\/span>/i);
    const name = nameMatch ? nameMatch[1].trim() : '';
    if (!name) continue;

    const candidateImgMatch = row.match(/candidates\/([^"]+)/);
    const img = candidateImgMatch
      ? `https://assets-generalelection2082.ekantipur.com/candidates/${candidateImgMatch[1]}`
      : '';

    const partyImgMatch = row.match(/parties\/([^"]+)/);
    const partyImg = partyImgMatch
      ? `https://assets-generalelection2082.ekantipur.com/parties/${partyImgMatch[1]}`
      : '';

    const partyMatch = row.match(/party-name">([^<]+)<\/span>/i);
    const party = partyMatch ? partyMatch[1].trim() : '';

    const isWin = /votecount\s+win/i.test(row);

    const voteMatch = row.match(/votecount[\s\S]*?<p>([\d,]+)<\/p>/i);
    const votes = voteMatch ? parseInt(voteMatch[1].replace(/,/g, ''), 10) : 0;

    const marginMatch = row.match(/votecount[\s\S]*?<span>\s*([\d,]+)/i);
    const margin = marginMatch ? parseInt(marginMatch[1].replace(/,/g, ''), 10) : 0;

    candidates.push({ id, name, party, img, partyImg, votes, margin, isLeading: isWin });
  }

  // Sort by votes descending
  candidates.sort((a, b) => b.votes - a.votes);

  return { constituency, candidates };
}

function parseProfile(html: string): { constituency: string; candidate: { id: number; name: string; party: string; img: string; partyImg: string; votes: number }; siblingCandidates: { id: number; name: string; party: string; img: string; partyImg: string; votes: number }[] } | null {
  // Extract candidate info from profile page
  const nameMatch = html.match(/<h5[^>]*>([^<]+)<\/h5>/);
  const name = nameMatch ? nameMatch[1].trim() : '';
  if (!name) return null;

  const constMatch = html.match(/constituency-(\d+)\?lng=eng">([^<]+)/i);
  const constituency = constMatch ? constMatch[2].trim() : '';
  
  const candidateImgMatch = html.match(/candidates\/([^"]+)/);
  const img = candidateImgMatch
    ? `https://assets-generalelection2082.ekantipur.com/candidates/${candidateImgMatch[1]}`
    : '';

  const partyImgMatch = html.match(/parties\/([^"]+)/);
  const partyImg = partyImgMatch
    ? `https://assets-generalelection2082.ekantipur.com/parties/${partyImgMatch[1]}`
    : '';

  const partyMatch = html.match(/party-name"[\s\S]*?>([^<]+)<\/span>/i);
  const party = partyMatch ? partyMatch[1].trim() : '';

  const voteMatch = html.match(/votecount[\s\S]*?<p>([\d,]+)<\/p>/i);
  const votes = voteMatch ? parseInt(voteMatch[1].replace(/,/g, ''), 10) : 0;

  // Extract sibling candidates from constituency table
  const siblingCandidates: { id: number; name: string; party: string; img: string; partyImg: string; votes: number }[] = [];
  const constTableMatch = html.match(new RegExp(`constituency-\\d+[^<]*(?:constituency members)?[\\s\\S]{0,5000}?(?=<|$)`, 'i'));
  
  if (constTableMatch) {
    const tableSection = constTableMatch[0];
    const rows = tableSection.split(/<tr[\s>]/i);
    
    for (const row of rows) {
      const rowProfileMatch = row.match(/profile\/(\d+)/);
      if (!rowProfileMatch) continue;
      
      const rowNameMatch = row.match(/candidate-name-link[\s\S]*?<span>([^<]+)<\/span>/i);
      const rowName = rowNameMatch ? rowNameMatch[1].trim() : '';
      if (!rowName || rowName === name) continue;

      const rowImgMatch = row.match(/candidates\/([^"]+)/);
      const rowImg = rowImgMatch
        ? `https://assets-generalelection2082.ekantipur.com/candidates/${rowImgMatch[1]}`
        : '';

      const rowPartyImgMatch = row.match(/parties\/([^"]+)/);
      const rowPartyImg = rowPartyImgMatch
        ? `https://assets-generalelection2082.ekantipur.com/parties/${rowPartyImgMatch[1]}`
        : '';

      const rowPartyMatch = row.match(/party-name">([^<]+)<\/span>/i);
      const rowParty = rowPartyMatch ? rowPartyMatch[1].trim() : '';

      const rowVoteMatch = row.match(/votecount[\s\S]*?<p>([\d,]+)<\/p>/i);
      const rowVotes = rowVoteMatch ? parseInt(rowVoteMatch[1].replace(/,/g, ''), 10) : 0;

      siblingCandidates.push({
        id: parseInt(rowProfileMatch[1], 10),
        name: rowName,
        party: rowParty,
        img: rowImg,
        partyImg: rowPartyImg,
        votes: rowVotes,
      });
    }
  }

  return {
    constituency,
    candidate: { id: 0, name, party, img, partyImg, votes },
    siblingCandidates,
  };
}

function computeOverview(parties: ReturnType<typeof parseParties>, provinces: ReturnType<typeof parseProvinces>) {
  const totalWon = parties.reduce((s, p) => s + p.won, 0);
  return {
    totalSeats: TOTAL_SEATS,
    declared: totalWon,
    counting: TOTAL_SEATS - totalWon,
    totalParties: parties.length,
    provinces: provinces.length,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'all';
  const valid = ['all', 'rsp', 'parties', 'overview', 'spotlight'];

  if (!valid.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Use: ${valid.join(', ')}` }, { status: 400 });
  }

  try {
    const needHome = ['all', 'parties', 'overview'].includes(type);
    const needRSP = ['all', 'rsp'].includes(type);
    const needSpotlight = ['all', 'spotlight'].includes(type);
    const needExtra = ['all'].includes(type);

    const fetches: Promise<string>[] = [];
    if (needHome) fetches.push(fetchHTML(URLS.home));
    if (needRSP) fetches.push(fetchHTML(URLS.rsp));
    if (needSpotlight) fetches.push(fetchHTML(URLS.spotlight));
    // Fetch extra constituencies in parallel (gracefully handle failures)
    const extraFetches = needExtra
      ? EXTRA_CONSTITUENCIES.map(url => fetchHTML(url).catch(() => ''))
      : [];

    const [mainResults, extraResults] = await Promise.all([
      Promise.all(fetches),
      Promise.all(extraFetches),
    ]);
    const results = mainResults;
    let idx = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: Record<string, any> = { ok: true, timestamp: new Date().toISOString() };

    if (needHome) {
      const homeHtml = results[idx++];
      result.parties = parseParties(homeHtml);
      result.provinces = parseProvinces(homeHtml);
      result.popularCandidates = parsePopularCandidates(homeHtml);
      result.overview = computeOverview(result.parties, result.provinces);
    }

    if (needRSP) {
      const rspHtml = results[idx++];
      result.rspCandidates = parseRSPCandidates(rspHtml);
    }

    if (needSpotlight) {
      const spotlightHtml = results[idx++];
      result.spotlight = parseSpotlight(spotlightHtml);
    }

    // Inject extra constituencies into popularCandidates (skip duplicates)
    if (needExtra && result.popularCandidates) {
      const existing = new Set(
        (result.popularCandidates as { constituency: string }[]).map(r => r.constituency.toLowerCase()),
      );
      for (const html of extraResults) {
        if (!html) continue;
        const parsed = parseSpotlight(html);
        if (parsed.candidates.length === 0) continue;
        if (existing.has(parsed.constituency.toLowerCase())) continue;
        existing.add(parsed.constituency.toLowerCase());
        const top = parsed.candidates[0];
        const second = parsed.candidates[1];
        const margin = top && second ? top.votes - second.votes : 0;
        result.popularCandidates.unshift({
          constituency: parsed.constituency,
          featured: {
            name: top.name,
            party: top.party,
            img: top.img,
            votes: top.votes,
            margin,
            status: top.isLeading ? 'leading' : 'following',
          },
          candidates: parsed.candidates.map(c => ({
            id: c.id,
            name: c.name,
            party: c.party,
            img: c.img,
            partyImg: c.partyImg,
            votes: c.votes,
          })),
        });
      }
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Scrape error:', msg);
    return NextResponse.json({ ok: false, error: 'Failed to fetch election data', detail: msg }, { status: 502 });
  }
}
