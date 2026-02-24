export interface NeedsReviewBannerView {
  headline: string;
  message: string;
}

export const getNeedsReviewBannerView = (): NeedsReviewBannerView => {
  return {
    headline: 'Needs review',
    message: 'External status is unknown. An operator will review this order.',
  };
};

