// Interface definitions for Trustpilot API response
interface TrustpilotConsumer {
  id: string;
  displayName: string;
  imageUrl: string;
  numberOfReviews: number;
  countryCode: string;
  hasImage: boolean;
  isVerified: boolean;
}

interface TrustpilotReviewDates {
  experiencedDate: string;
  publishedDate: string;
  updatedDate: string | null;
  submittedDate: string | null;
}

interface TrustpilotReviewLabels {
  merged: any | null;
  verification: {
    isVerified: boolean;
    createdDateTime: string;
    reviewSourceName: string;
    verificationSource: string;
    verificationLevel: string;
    hasDachExclusion: boolean;
  };
}

interface TrustpilotReview {
  id: string;
  filtered: boolean;
  pending: boolean;
  text: string;
  rating: number;
  labels: TrustpilotReviewLabels;
  title: string;
  likes: number;
  source: string;
  dates: TrustpilotReviewDates;
  report: any | null;
  hasUnhandledReports: boolean;
  consumer: TrustpilotConsumer;
  reply: any | null;
  consumersReviewCountOnSameDomain: number;
  consumersReviewCountOnSameLocation: number | null;
  productReviews: any[];
  language: string;
  location: any | null;
}

interface TrustpilotBusinessUnit {
  id: string;
  displayName: string;
  identifyingName: string;
  numberOfReviews: number;
  trustScore: number;
  websiteUrl: string;
  websiteTitle: string;
  profileImageUrl: string;
  stars: number;
  categories: Array<{
    id: string;
    name: string;
    isPrimary: boolean;
  }>;
  isClaimed: boolean;
  contactInfo: {
    email: string;
    address: string;
    city: string;
    country: string;
    phone: string;
    zipCode: string;
  };
}

interface TrustpilotApiResponse {
  domain: string;
  pageUrl: string;
  businessUnit: TrustpilotBusinessUnit;
  reviews: TrustpilotReview[];
  filters: {
    totalNumberOfReviews: number;
    totalNumberOfFilteredReviews: number;
    reviewStatistics: {
      ratings: {
        total: number;
        one: number;
        two: number;
        three: number;
        four: number;
        five: number;
      };
    };
  };
}

// Simplified response interface for our API
interface ReviewSummary {
  id: string;
  rating: number;
  title: string;
  text: string;
  author: string;
  country: string;
  date: string;
  isVerified: boolean;
  source: string;
}

interface ReviewsResponse {
  success: boolean;
  data: {
    domain: string;
    trustpilotUrl: string;
    businessName: string;
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      one: number;
      two: number;
      three: number;
      four: number;
      five: number;
    };
    reviews: ReviewSummary[];
  } | null;
  error?: string;
}

export default defineEventHandler(async (event): Promise<ReviewsResponse> => {
  try {
    // Get the domain from query parameters, default to our domain
    const query = getQuery(event);
    const domain = "whatsapp.checkleaked.cc";

    // Fetch reviews from Trustpilot API
    const trustpilotUrl = `https://trustpilot.digitalshopuy.com/?domain=${domain}`;

    const response = await $fetch<TrustpilotApiResponse>(trustpilotUrl, {
      timeout: 10000, // 10 seconds timeout
    });

    // Transform the response to our simplified format
    const reviews: ReviewSummary[] = response.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      text: review.text,
      author: review.consumer.displayName,
      country: review.consumer.countryCode,
      date: review.dates.publishedDate,
      isVerified: review.labels.verification.isVerified,
      source: review.source,
    }));

    return {
      success: true,
      data: {
        domain: response.domain,
        trustpilotUrl: response.pageUrl,
        businessName: response.businessUnit.displayName,
        totalReviews: response.businessUnit.numberOfReviews,
        averageRating: response.businessUnit.trustScore,
        ratingDistribution: response.filters.reviewStatistics.ratings,
        reviews,
      },
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);

    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : "Failed to fetch reviews",
    };
  }
});
