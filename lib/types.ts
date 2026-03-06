export interface Party {
  id: number;
  name: string;
  img: string;
  won: number;
  lead: number;
  total: number;
}

export interface ProvinceParty {
  name: string;
  img: string;
  won: number;
  lead: number;
}

export interface Province {
  id: number;
  name: string;
  slug: string;
  districts: number;
  seats: number;
  parties: ProvinceParty[];
}

export interface RSPCandidate {
  id: number;
  name: string;
  constituency: string;
  constituencyNum: number;
  province: string;
  district: string;
  votes: number;
  leadMargin: number;
  status: 'leading' | 'won';
}

export interface RaceCandidate {
  id: number;
  name: string;
  party: string;
  img: string;
  partyImg: string;
  votes: number;
}

export interface PopularRace {
  constituency: string;
  featured: {
    name: string;
    party: string;
    img: string;
    votes: number;
    margin: number;
    status: 'leading' | 'following';
  };
  candidates: RaceCandidate[];
}

export interface Overview {
  totalSeats: number;
  declared: number;
  counting: number;
  totalParties: number;
  provinces: number;
}

export interface ElectionData {
  ok: boolean;
  timestamp: string;
  parties: Party[];
  provinces: Province[];
  rspCandidates: RSPCandidate[];
  popularCandidates: PopularRace[];
  overview: Overview;
}

export interface ChangeEvent {
  party: string;
  delta: number;
  at: string; // ISO timestamp
}
