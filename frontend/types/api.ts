export interface GenreDto {
  id: number
  name: string
  slug: string
}

export interface MovieSummaryDto {
  id: string
  title: string
  slug: string
  posterUrl: string | null
  releaseYear: number | null
  avgRating: number
  viewCount: number
  genres: GenreDto[]
  status?: string | null
  createdAt?: string | null
  /** Giá VND; null/0 = miễn phí (M8b) */
  listingPriceVnd?: number | null
}

export interface CastMemberDto {
  celebrityId: string
  slug: string
  name: string
  avatarUrl: string | null
  role: string
  characterName: string | null
}

export interface VideoSourceInfoDto {
  id: string
  quality: string
  status: string
  /** Số điểm phát thêm (CDN / URL dự phòng) trên BE */
  extraStreamEndpointCount?: number
}

export interface StreamEndpointDto {
  id: string
  sortOrder: number
  r2Key: string | null
  directUrl: string | null
}

export interface ChapterSummaryDto {
  id: string
  title: string
  order: number
  durationSeconds: number | null
  thumbnailUrl: string | null
  /** Giây — kết thúc intro; có nút “Bỏ qua intro” khi có giá trị dương */
  introSkipEndSeconds?: number | null
  /** API M8a; thiếu field = không phụ đề */
  hasSubtitles?: boolean
  videoSources: VideoSourceInfoDto[]
}

export interface MovieDetailDto extends MovieSummaryDto {
  description: string | null
  backdropUrl: string | null
  trailerUrl: string | null
  runtimeMinutes: number | null
  mpaaRating: string | null
  status: string
  ratingCount: number
  cast: CastMemberDto[]
  chapters: ChapterSummaryDto[]
  relatedMovies: MovieSummaryDto[]
  /** M8b marketplace — có giá bán lẻ */
  isPaidListing?: boolean
  /** Đã đăng nhập + entitlement: được phát video */
  viewerCanWatch?: boolean
  /** Cần mua (hoặc đăng nhập nếu chưa login) */
  purchaseRequired?: boolean
}

export interface CheckoutResponseDto {
  purchaseId: string
  status: string
  amountVnd: number
  platformFeeVnd: number
  netToCreatorVnd: number
  mockCheckoutEnabled: boolean
  message: string | null
}

export interface PurchaseListItemDto {
  id: string
  movieId: string
  movieTitle: string
  moviePosterUrl: string | null
  amountVnd: number
  status: string
  createdAt: string
  completedAt: string | null
}

export interface PurchaseDetailDto {
  id: string
  movieId: string
  movieTitle: string
  moviePosterUrl: string | null
  amountVnd: number
  platformFeeVnd: number
  netToCreatorVnd: number
  status: string
  provider: string
  externalId: string | null
  createdAt: string
  completedAt: string | null
  viewerRole: string
}

export interface CreatorSaleRowDto {
  purchaseId: string
  movieId: string
  movieTitle: string
  buyerUsername: string
  amountVnd: number
  platformFeeVnd: number
  netToCreatorVnd: number
  status: string
  createdAt: string
  completedAt: string | null
}

export interface CreatorSalesSummaryDto {
  completedSalesCount: number
  pendingPurchasesCount: number
  totalGrossVnd: number
  totalPlatformFeesVnd: number
  totalNetToCreatorVnd: number
}

export interface CreatorSalesResponseDto {
  summary: CreatorSalesSummaryDto
  items: CreatorSaleRowDto[]
}

export interface AdminPurchaseRowDto {
  id: string
  userId: string
  buyerUsername: string
  movieId: string
  movieTitle: string
  amountVnd: number
  platformFeeVnd: number
  status: string
  provider: string
  createdAt: string
  completedAt: string | null
}

export interface CreatorPayoutBalanceDto {
  earnedNetVnd: number
  paidOutVnd: number
  pendingReserveVnd: number
  availableVnd: number
  minPayoutVnd: number
}

export interface PayoutRequestItemDto {
  id: string
  amountVnd: number
  status: string
  adminNote: string | null
  createdAt: string
  processedAt: string | null
}

export interface AdminPayoutRowDto {
  id: string
  userId: string
  username: string
  amountVnd: number
  status: string
  createdAt: string
  processedAt: string | null
  adminNote: string | null
}

export interface ReviewDto {
  id: string
  userId: string
  username: string
  avatarUrl: string | null
  title: string
  body: string
  score: number
  createdAt: string
}

export interface StreamUrlResponse {
  url: string
}

export interface CelebrityListDto {
  id: string
  name: string
  slug: string
  avatarUrl: string | null
  country: string | null
  movieCount: number
}

export interface NewsListDto {
  id: string
  title: string
  slug: string
  coverUrl: string | null
  authorName: string
  publishedAt: string
  tags: string[]
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PagedResult<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface SearchResultDto {
  movies: MovieSummaryDto[]
  celebrities: CelebrityListDto[]
  news: NewsListDto[]
  total: number
}

export interface MovieTrailerDto {
  id: string
  title: string
  slug: string
  posterUrl: string | null
  trailerUrl: string
}

export interface VideoPresignRequest {
  movieId: string
  chapterId: string
  filename: string
  contentType: string
}

export interface VideoPresignResponse {
  url: string
  key: string
  expiresAt: string
}

export interface VideoConfirmRequest {
  movieId: string
  chapterId: string
  key: string
  fileSizeBytes: number
  contentType: string
}

export interface VideoConfirmResponse {
  videoSourceId: string
}

/** M4b — cắt video trên server (FFmpeg) */
export interface TrimChapterRequest {
  startSeconds: number
  endSeconds: number
}

/** M4b — poster từ frame video */
export interface ChapterPosterFromVideoRequest {
  timeSeconds: number
}

export interface SubtitlePresignRequest {
  movieId: string
  chapterId: string
  filename: string
  contentType: string
}

export interface SubtitleConfirmRequest {
  movieId: string
  chapterId: string
  key: string
  fileSizeBytes: number
}

export interface AddMovieCastRequest {
  celebrityId: string
  role: string
  characterName: string | null
  order: number
}

export interface CreateMovieRequest {
  title: string
  description: string | null
  posterUrl: string | null
  backdropUrl: string | null
  trailerUrl: string | null
  releaseYear: number | null
  runtimeMinutes: number | null
  mpaaRating: string | null
  genreIds: number[]
  listingPriceVnd?: number | null
}

export interface UpdateMovieRequest {
  title?: string | null
  description?: string | null
  posterUrl?: string | null
  backdropUrl?: string | null
  trailerUrl?: string | null
  releaseYear?: number | null
  runtimeMinutes?: number | null
  mpaaRating?: string | null
  status?: string | null
  genreIds?: number[] | null
  listingPriceVnd?: number | null
}

export interface CreateChapterRequest {
  title: string
  order: number
  durationSeconds: number | null
  thumbnailUrl: string | null
  introSkipEndSeconds?: number | null
  subtitleR2Key?: string | null
}

export interface FriendUserDto {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

export interface FriendRequestDto {
  id: string
  senderId: string
  senderUsername: string
  senderDisplayName: string
  senderAvatarUrl: string | null
  receiverId: string
  receiverUsername: string
  status: string
  createdAt: string
}

export interface MessageDto {
  id: string
  senderId: string
  receiverId: string
  body: string
  createdAt: string
  isRead: boolean
}

export interface NotificationDto {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  referenceId: string | null
  /** Phim (deep link /watch/{referenceMovieId}/{referenceId}) cho type new_episode */
  referenceMovieId: string | null
}

export interface WatchProgressDto {
  progressSeconds: number
}

export interface WatchHistoryItemDto {
  id: string
  movieId: string
  movieTitle: string
  posterUrl: string | null
  chapterId: string
  chapterTitle: string
  progressSeconds: number
  watchedAt: string
}

export interface AdminStatsDto {
  users: number
  activeUsers: number
  movies: number
  publishedMovies: number
  pendingMovies: number
  news: number
  celebrities: number
  pendingReports: number
}

export interface AdminUserSummaryDto {
  id: string
  username: string
  email: string
  displayName: string
  role: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
}

export interface ContentReportAdminDto {
  id: string
  reporterId: string
  reporterUsername: string
  targetType: string
  targetId: string
  reason: string
  status: string
  createdAt: string
}

export interface UserSearchResultDto {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}
