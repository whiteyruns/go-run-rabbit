export interface ArtistReachMetric {
  platform: string;
  metric: string;
  label: string;
}

export interface ArtistHit {
  title: string;
  feature?: string;
  peak?: string;
  released?: string;
}

export interface ArtistAlbum {
  title: string;
  year: number;
  note?: string;
}

export interface ArtistOutreach {
  platform: string;
  handle: string;
  note: string;
  url?: string;
  imageUrl?: string;
}

export interface ArtistProfile {
  id: string;
  stageName: string;
  realName: string;
  born: string;
  nationality: string;
  genres: string[];
  yearsActive: string;
  signature: string;
  bio: string;
  reach: ArtistReachMetric[];
  hits: ArtistHit[];
  albums: ArtistAlbum[];
  collaborations: string[];
  milestones: string[];
  outreachExamples: ArtistOutreach[];
}
