export interface GoogleAccount {
  id: string
  name: string
  accountName: string
}

export interface GoogleLocation {
  id: string
  accountId: string
  locationName: string
  address: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  primaryPhone: string | null
  websiteUrl: string | null
  primaryCategory: string | null
  additionalCategories: string[]
  latitude: number | null
  longitude: number | null
  metadata: {
    hasUri: boolean
    hasGoogleUpdated: boolean
  }
}

export interface GooglePost {
  name: string
  topicType: string
  summary: string
  callToAction: {
    actionType: string
    url: string | null
  } | null
  event: {
    title: string
    startDate: string
    endDate: string
  } | null
  alertType: string | null
  state: string
  createTime: string
  updateTime: string
  media: {
    mediaFormat: string
    sourceUrl: string
  }[]
}

export interface GoogleReview {
  name: string
  reviewer: {
    displayName: string
    profilePhotoUrl: string | null
  }
  starRating: number
  comment: string
  createTime: string
  updateTime: string
  reviewReply: {
    comment: string
    updateTime: string
  } | null
}

export interface GoogleMetrics {
  searchQueries: { query: string; count: number }[]
  directionsRequests: { count: number; period: string }
  phoneCalls: { count: number; period: string }
  websiteClicks: { count: number; period: string }
  messages: { count: number; period: string }
  bookingCalls: { count: number; period: string }
  foodOrders: { count: number; period: string }
  totalViews: { count: number; period: string }
  totalSearches: { count: number; period: string }
}

export interface GoogleProvider {
  getAccounts(accessToken: string): Promise<GoogleAccount[]>
  getLocations(accessToken: string, accountId: string): Promise<GoogleLocation[]>
  createPost(accessToken: string, locationName: string, post: {
    topicType: string
    summary: string
    callToAction?: { actionType: string; url?: string }
    event?: { title: string; startDate: string; endDate: string }
  }): Promise<GooglePost>
  listReviews(accessToken: string, locationName: string): Promise<GoogleReview[]>
  replyToReview(accessToken: string, reviewName: string, comment: string): Promise<void>
  getMetrics(accessToken: string, locationName: string): Promise<GoogleMetrics>
}

const GBP_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1"
const GBP_API_BASE = "https://mybusiness.googleapis.com/v4"
const GBP_QA_BASE = "https://mybusinessqanda.googleapis.com/v1"

async function fetchGoogleAPI<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google API error: ${response.status} ${error}`)
  }

  return response.json()
}

export class GoogleApiProvider implements GoogleProvider {
  async getAccounts(accessToken: string): Promise<GoogleAccount[]> {
    const data = await fetchGoogleAPI<{ accounts: { name: string; accountName: string }[] }>(
      `${GBP_QA_BASE}/accounts`,
      accessToken
    )
    return (data.accounts || []).map((a) => ({
      id: a.name.split("/").pop() || a.name,
      name: a.name,
      accountName: a.accountName,
    }))
  }

  async getLocations(accessToken: string, accountId: string): Promise<GoogleLocation[]> {
    const data = await fetchGoogleAPI<{ locations: Record<string, unknown>[] }>(
      `${GBP_BASE}/accounts/${accountId}/locations?readMask=*,metadata`,
      accessToken
    )
    return (data.locations || []).map((l: Record<string, unknown>) => ({
      id: (l.name as string)?.split("/").pop() || "",
      accountId,
      locationName: (l.locationName as string) || "",
      address: {
        addressLines: ((l.address as Record<string, string[]>)?.addressLines) || [],
        locality: (l.address as Record<string, string>)?.locality || "",
        administrativeArea: (l.address as Record<string, string>)?.administrativeArea || "",
        postalCode: (l.address as Record<string, string>)?.postalCode || "",
        regionCode: (l.address as Record<string, string>)?.regionCode || "",
      },
      primaryPhone: (l.primaryPhone as string) || null,
      websiteUrl: (l.websiteUrl as string) || null,
      primaryCategory: (l.primaryCategory as Record<string, string>)?.displayName || null,
      additionalCategories: ((l.additionalCategories as Record<string, string>[]) || []).map((c) => c.displayName),
      latitude: (l.latitude as number) || null,
      longitude: (l.longitude as number) || null,
      metadata: {
        hasUri: (l.metadata as Record<string, boolean>)?.hasUri || false,
        hasGoogleUpdated: (l.metadata as Record<string, boolean>)?.hasGoogleUpdated || false,
      },
    }))
  }

  async createPost(
    accessToken: string,
    locationName: string,
    post: {
      topicType: string
      summary: string
      callToAction?: { actionType: string; url?: string }
      event?: { title: string; startDate: string; endDate: string }
    }
  ): Promise<GooglePost> {
    const body: Record<string, unknown> = {
      topicType: post.topicType,
      summary: post.summary,
      languageCode: "pt-BR",
    }

    if (post.callToAction) {
      body.callToAction = {
        actionType: post.callToAction.actionType,
        url: post.callToAction.url || "",
      }
    }

    if (post.event) {
      body.event = {
        title: post.event.title,
        schedule: {
          startDate: { year: parseInt(post.event.startDate), month: 1, day: 1 },
          endDate: { year: parseInt(post.event.endDate), month: 1, day: 1 },
        },
      }
    }

    return fetchGoogleAPI<GooglePost>(
      `${GBP_API_BASE}/${locationName}/localPosts`,
      accessToken,
      { method: "POST", body: JSON.stringify(body) }
    )
  }

  async listReviews(accessToken: string, locationName: string): Promise<GoogleReview[]> {
    const data = await fetchGoogleAPI<{ reviews: Record<string, unknown>[] }>(
      `${GBP_API_BASE}/${locationName}/reviews?pageSize=50`,
      accessToken
    )
    return (data.reviews || []).map((r: Record<string, unknown>) => ({
      name: r.name as string,
      reviewer: {
        displayName: ((r.reviewer as Record<string, string>)?.displayName) || "Anônimo",
        profilePhotoUrl: (r.reviewer as Record<string, string>)?.profilePhotoUrl || null,
      },
      starRating: (r.starRating as number) || 0,
      comment: (r.comment as string) || "",
      createTime: (r.createTime as string) || "",
      updateTime: (r.updateTime as string) || "",
      reviewReply: r.reviewReply
        ? {
            comment: (r.reviewReply as Record<string, string>).comment,
            updateTime: (r.reviewReply as Record<string, string>).updateTime,
          }
        : null,
    }))
  }

  async replyToReview(accessToken: string, reviewName: string, comment: string): Promise<void> {
    await fetchGoogleAPI(
      `${GBP_API_BASE}/${reviewName}/reply`,
      accessToken,
      { method: "POST", body: JSON.stringify({ comment }) }
    )
  }

  async getMetrics(accessToken: string, locationName: string): Promise<GoogleMetrics> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const body = {
      locationNames: [locationName],
      basicRequest: {
        metricRequests: [
          "ALL",
        ],
        timeRange: {
          startTime: thirtyDaysAgo.toISOString(),
          endTime: now.toISOString(),
        },
      },
    }

    try {
      const data = await fetchGoogleAPI<Record<string, unknown>>(
        `${GBP_API_BASE}/accounts/${locationName.split("/")[1]}/locations/${locationName.split("/")[3]}:reportInsights`,
        accessToken,
        { method: "POST", body: JSON.stringify(body) }
      )

      const locationMetrics = (data.locationMetrics as Record<string, unknown>[])?.[0] || {}

      return {
        searchQueries: (locationMetrics.searchQueriesForLocation as { query: string; count: number }[]) || [],
        directionsRequests: { count: 0, period: "30d" },
        phoneCalls: { count: 0, period: "30d" },
        websiteClicks: { count: 0, period: "30d" },
        messages: { count: 0, period: "30d" },
        bookingCalls: { count: 0, period: "30d" },
        foodOrders: { count: 0, period: "30d" },
        totalViews: { count: 0, period: "30d" },
        totalSearches: { count: 0, period: "30d" },
      }
    } catch {
      return {
        searchQueries: [],
        directionsRequests: { count: 0, period: "30d" },
        phoneCalls: { count: 0, period: "30d" },
        websiteClicks: { count: 0, period: "30d" },
        messages: { count: 0, period: "30d" },
        bookingCalls: { count: 0, period: "30d" },
        foodOrders: { count: 0, period: "30d" },
        totalViews: { count: 0, period: "30d" },
        totalSearches: { count: 0, period: "30d" },
      }
    }
  }
}

export class MockGoogleProvider implements GoogleProvider {
  async getAccounts(): Promise<GoogleAccount[]> {
    return [
      { id: "mock-account-1", name: "accounts/mock-account-1", accountName: "Minha Empresa Ltda" },
    ]
  }

  async getLocations(): Promise<GoogleLocation[]> {
    return [
      {
        id: "mock-location-1",
        accountId: "mock-account-1",
        locationName: "Minha Empresa - Matriz",
        address: {
          addressLines: ["Rua Principal, 123"],
          locality: "São Paulo",
          administrativeArea: "SP",
          postalCode: "01001-000",
          regionCode: "BR",
        },
        primaryPhone: "+55 11 99999-8888",
        websiteUrl: "https://meusite.com.br",
        primaryCategory: "Loja de departamentos",
        additionalCategories: [],
        latitude: -23.5505,
        longitude: -46.6333,
        metadata: { hasUri: true, hasGoogleUpdated: true },
      },
      {
        id: "mock-location-2",
        accountId: "mock-account-1",
        locationName: "Minha Empresa - Filial",
        address: {
          addressLines: ["Av. Secundária, 456"],
          locality: "Rio de Janeiro",
          administrativeArea: "RJ",
          postalCode: "20040-000",
          regionCode: "BR",
        },
        primaryPhone: "+55 21 98888-7777",
        websiteUrl: null,
        primaryCategory: "Loja de departamentos",
        additionalCategories: ["Serviço de entrega"],
        latitude: -22.9068,
        longitude: -43.1729,
        metadata: { hasUri: false, hasGoogleUpdated: false },
      },
    ]
  }

  async createPost(_accessToken: string, _locationName: string, post: {
    topicType: string
    summary: string
    callToAction?: { actionType: string; url?: string }
    event?: { title: string; startDate: string; endDate: string }
  }): Promise<GooglePost> {
    return {
      name: `${_locationName}/localPosts/mock-post-${Date.now()}`,
      topicType: post.topicType,
      summary: post.summary,
      callToAction: post.callToAction ? { actionType: post.callToAction.actionType, url: post.callToAction.url || null } : null,
      event: post.event ? { title: post.event.title, startDate: post.event.startDate, endDate: post.event.endDate } : null,
      alertType: null,
      state: "LIVE",
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      media: [],
    }
  }

  async listReviews(): Promise<GoogleReview[]> {
    return [
      {
        name: "accounts/mock-account-1/locations/mock-location-1/reviews/mock-review-1",
        reviewer: { displayName: "Maria Silva", profilePhotoUrl: null },
        starRating: 5,
        comment: "Excelente atendimento! Super recomendo.",
        createTime: new Date(Date.now() - 7 * 86400000).toISOString(),
        updateTime: new Date(Date.now() - 7 * 86400000).toISOString(),
        reviewReply: {
          comment: "Obrigado, Maria! Ficamos felizes com seu feedback.",
          updateTime: new Date(Date.now() - 6 * 86400000).toISOString(),
        },
      },
      {
        name: "accounts/mock-account-1/locations/mock-location-1/reviews/mock-review-2",
        reviewer: { displayName: "João Santos", profilePhotoUrl: null },
        starRating: 3,
        comment: "Produto bom, mas demorou para chegar.",
        createTime: new Date(Date.now() - 14 * 86400000).toISOString(),
        updateTime: new Date(Date.now() - 14 * 86400000).toISOString(),
        reviewReply: null,
      },
    ]
  }

  async replyToReview(): Promise<void> {}

  async getMetrics(): Promise<GoogleMetrics> {
    return {
      searchQueries: [
        { query: "minha empresa são paulo", count: 150 },
        { query: "loja perto de mim", count: 89 },
      ],
      directionsRequests: { count: 45, period: "30d" },
      phoneCalls: { count: 32, period: "30d" },
      websiteClicks: { count: 120, period: "30d" },
      messages: { count: 8, period: "30d" },
      bookingCalls: { count: 5, period: "30d" },
      foodOrders: { count: 0, period: "30d" },
      totalViews: { count: 1200, period: "30d" },
      totalSearches: { count: 850, period: "30d" },
    }
  }
}

export function createGoogleProvider(): GoogleProvider {
  const isEnabled = process.env.GOOGLE_INTEGRATION_ENABLED === "true"

  if (!isEnabled) {
    return new MockGoogleProvider()
  }

  return new GoogleApiProvider()
}
