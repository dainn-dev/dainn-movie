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
}

export interface ChapterSummaryDto {
  id: string
  title: string
  order: number
  durationSeconds: number | null
  thumbnailUrl: string | null
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
}

export interface CreateChapterRequest {
  title: string
  order: number
  durationSeconds: number | null
  thumbnailUrl: string | null
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
