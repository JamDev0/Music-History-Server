export interface Music {
  artist: string;
  name: string;
  duration: number;
  id: string;
  reproductions: string;
}

export interface Entry {
  date: string;
  music: string;
  time: {
    from: number;
    to: number;
  }
  id: string;
  session_id: string;
}