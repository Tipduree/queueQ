export type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

export type PendingBooking = {
  serviceSlug: string;
  date: string;
  time: string;
  guests: number;
};
